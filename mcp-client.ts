/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();

import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { Ollama, type Tool as OllamaTool, type Message } from 'ollama';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { toString } from '@app/common/core/utils';
import * as readline from 'node:readline';
import addFormats from 'ajv-formats';
import Ajv from 'ajv';

interface ClientMCPConfig {
  mcpServerUrl: string;
  ollamaHost?: string;
  defaultModel?: string;
  maxToolRounds?: number;
  maxHistoryMessages?: number;
}

const DEFAULT_CONFIG: Required<ClientMCPConfig> = {
  maxToolRounds: 10,
  maxHistoryMessages: 50,
  defaultModel: 'qwen2.5:32b',
  ollamaHost: 'http://localhost:11434',
  mcpServerUrl: 'http://127.0.0.1:3010/mcp',
};

export class ClientMCP {
  // Core MCP Components
  private mcp: Client;
  private ollama: Ollama;
  private messages: Message[] = [];

  // Config
  private config: Required<ClientMCPConfig>;
  private transport?: StreamableHTTPClientTransport;

  // Tool Management
  private allFetchedTools: OllamaTool[] = [];
  private activeTools: Record<string, OllamaTool> = {};

  // Validation
  private ajv: Ajv = new Ajv({ strict: false, allErrors: true });
  private validators: Record<string, { schema: any; validator?: any }> = {};

  constructor(config: Partial<ClientMCPConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    this.mcp = new Client({
      name: 'ollama-mcp-client',
      version: '2.0.0',
    });

    this.ollama = new Ollama({ host: this.config.ollamaHost });

    // Initialize AJV with loose strict mode for flexibility
    addFormats(this.ajv);
  }

  /**
   * Connect to MCP server and load tools/resources
   */
  async connect(serverUrl: string = this.config.mcpServerUrl): Promise<void> {
    // Cleanup existing transport if any
    if (this.transport) await this.transport.close();

    const url = new URL(serverUrl);

    // Initialize Transport with headers
    this.transport = new StreamableHTTPClientTransport(url, {
      requestInit: {
        headers: {
          Authorization: process.env.MCP_CLIENT_APT_TOKEN!,
          'Content-Type': 'application/json',
        },
        keepalive: true,
      },
    });

    // Transport Event Listeners
    this.transport.onerror = (err) => console.error('❌ Transport error:', err);
    this.transport.onclose = () => console.log('🔌 Transport closed');

    // Connect and Fetch Tools and Resources
    await this.mcp.connect(this.transport);

    const [toolsResult, resourcesResult] = await Promise.all([this.mcp.listTools(), this.mcp.listResources()]);

    const availableResourcesUris = resourcesResult.resources.map((r) => r.uri).join(', ');

    this.activeTools = {};
    this.allFetchedTools = [];
    this.validators = {};

    // Map MCP Tools to Ollama Format
    toolsResult.tools.forEach((tool) => {
      this.allFetchedTools.push({
        type: 'function',
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.inputSchema as any,
        },
      });
      this.validators[tool.name] = { schema: tool.inputSchema };
    });

    this.activeTools['read_documentations'] = {
      type: 'function',
      function: {
        name: 'read_documentations',
        description: `CRITICAL: Read the content of an MCP server resource. Available resources: docs://mcp/readme, ${availableResourcesUris}.`,
        parameters: {
          type: 'object',
          required: ['uri'],
          properties: { uri: { type: 'string' } },
        },
      },
    };

    // Store schema for internal AJV validation
    this.validators['read_documentations'] = {
      schema: { type: 'object', properties: { uri: { type: 'string' } }, required: ['uri'] },
    };

    this.activeTools['load_collection_tools'] = {
      type: 'function',
      function: {
        name: 'load_collection_tools',
        description: `CRITICAL: Call this tool AFTER reading the docs to unlock the database execution tools.
        Example: If you need to manage auth grants, pass service="auth" and resource_name="grant".`,
        parameters: {
          type: 'object',
          required: ['service', 'resource_name'],
          properties: {
            service: { type: 'string', description: 'The service name (e.g., auth, career)' },
            resource_name: { type: 'string', description: 'The singular resource name (e.g., grant, user, profile)' },
          },
        },
      },
    };
    this.validators['load_collection_tools'] = {
      schema: this.activeTools['load_collection_tools'].function.parameters,
    };

    console.log(`✅ Connected. Server provided ${this.allFetchedTools.length} tools (Lazy Loading mode).`);
  }

  private validateArgs(toolName: string, args: any): { valid: boolean; error?: string } {
    try {
      if (!this.validators[toolName]?.validator) {
        this.validators[toolName].validator = this.ajv.compile(this.validators[toolName].schema);
      }
      const valid = this.validators[toolName].validator!(args);
      if (!valid) {
        return { valid: false, error: this.validators[toolName].validator!.errors?.map((e: any) => e.message).join(', ') };
      }
      return { valid: true };
    } catch (err: any) {
      return { valid: false, error: err.message };
    }
  }

  async processQuery(query: string, modelName = this.config.defaultModel): Promise<string> {
    this.messages.push({ role: 'user', content: query });
    if (this.messages.length > this.config.maxHistoryMessages) {
      this.messages = this.messages.slice(-this.config.maxHistoryMessages);
    }

    console.log('🤖 Analyzing request...');
    const today = new Date().toISOString().split('T')[0];

    const systemPrompt: Message = {
      role: 'system',
      content: `You are an advanced AI Agent for the Wenex Platform. Today is ${today}.
      
[CRITICAL WORKFLOW - DO THIS IN EXACT ORDER]:
1. DISCOVER: Call 'read_documentations' on 'docs://mcp/readme' and then the relevant service docs.
2. LOAD: You DO NOT have the database execution tools by default. You MUST call 'load_collection_tools' with the correct service and resource (e.g. auth, grant) to unlock them.
3. EXECUTE: Call the newly loaded tools (e.g., find_auth_grant, create_auth_grant) to process the user's request.
NEVER GUESS tool names. Always load them first.`,
    };

    let response = await this.ollama.chat({
      model: modelName,
      messages: [systemPrompt, ...this.messages],
      tools: Object.values(this.activeTools),
    });

    this.messages.push(response.message);

    // --- Handle Tool Calls (if any) ---
    let round = 0;
    while (response.message.tool_calls?.length && round < this.config.maxToolRounds) {
      round++;
      console.log(`🛠 Round ${round}: Executing ${response.message.tool_calls.map((t) => t.function.name).join(', ')}...`);

      // === PARALLEL TOOL EXECUTION ===
      const toolPromises = response.message.tool_calls.map(async (toolCall): Promise<Message> => {
        const toolName = toolCall.function.name;
        const toolArgs = toolCall.function.arguments as Record<string, any>;

        const validation = this.validateArgs(toolName, toolArgs);
        let content = '';

        if (!validation.valid) {
          content = toString({ error: 'validation_failed', details: validation.error });
        } else {
          try {
            if (toolName === 'load_collection_tools') {
              const { service, resource_name } = toolArgs;
              const targetPattern = `_${service}_${resource_name}`;

              let loadedCount = 0;
              this.allFetchedTools.forEach((tool) => {
                const toolName = tool.function?.name;

                if (toolName && toolName.includes(targetPattern)) {
                  this.activeTools[toolName] = tool;
                  loadedCount++;
                }
              });

              content =
                loadedCount > 0
                  ? `Successfully loaded ${loadedCount} tools containing "${targetPattern}". You can now execute them.`
                  : `No tools found containing "${targetPattern}". Please check the spelling from the documentation.`;
            } else if (toolName === 'read_documentations') {
              const result = await this.mcp.readResource({ uri: toolArgs.uri });
              content = result.contents.map((c: any) => c.text || toString(c)).join('\n\n');
            } else {
              const result = await this.mcp.callTool({ name: toolName, arguments: toolArgs });
              const textParts = (result.content as any[]).filter((c) => c.type === 'text').map((c) => c.text);
              content = textParts.join('\n');

              if ((result as any).structuredContent) {
                content += `\n\nStructured Content:\n${toString((result as any).structuredContent)}`;
              }
            }
          } catch (err: any) {
            content = `ERROR executing ${toolName}: ${err.message}`;
          }
        }

        return { role: 'tool', content, tool_name: toolName };
      });

      const results = await Promise.all(toolPromises);
      results.forEach((res) => this.messages.push(res));

      response = await this.ollama.chat({
        model: modelName,
        messages: [systemPrompt, ...this.messages],
        tools: Object.values(this.activeTools),
      });

      this.messages.push(response.message);
    }

    return response.message.content || '';
  }

  disconnect() {
    console.log('👋 MCP client disconnected');
    process.exit(0);
  }

  /**
   * Interactive chat loop with graceful exit
   */
  async chatLoop(modelName: string = 'qwen2.5:32b') {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    console.log('\n🚀 MCP Client v2.0 (Lazy Loaded) started!');
    console.log("Type your query or 'quit' to exit.\n");

    const ask = () => new Promise<string>((resolve) => rl.question('\nQuery > ', resolve));

    try {
      while (true) {
        const input = await ask();
        if (input.toLowerCase() === 'quit') break;

        const response = await this.processQuery(input, modelName);
        console.log('\n' + response);
      }
    } finally {
      rl.close();
      this.disconnect();
    }
  }
}

// ====================== MAIN ======================
(async () => {
  const token = process.env.MCP_CLIENT_APT_TOKEN;
  if (!token) {
    console.error('❌ MCP_CLIENT_APT_TOKEN environment variable is required!');
    process.exit(1);
  }

  const client = new ClientMCP({
    // override defaults here if needed
    // defaultModel: 'llama3.1:8b',
  });

  try {
    await client.connect();
    await client.chatLoop();
  } catch (err) {
    console.error('💥 Fatal error:', err);
    client.disconnect();
  }
})().catch(console.error);
