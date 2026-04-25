/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();

/**
 * Configuration
 *
 * Run Ollama as a service on local
 * Using: ollama run qwen2.5:32b
 * Remote: ssh -L 11434:localhost:11434 wenex@gpu.wenex.org
 */
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { Ollama, type Tool as OllamaTool, type Message } from 'ollama';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { toKebabCase } from 'naming-conventions-modeler';
import { toString } from '@app/common/core/utils';
import * as readline from 'node:readline';
import addFormats from 'ajv-formats';
import axios from 'axios';
import Ajv from 'ajv';

interface ClientMCPConfig {
  mcpServerUrl: string;
  ollamaHost?: string;
  defaultModel?: string;
  maxToolRounds?: number;
  maxHistoryMessages?: number;
  platformAuthVerifyPath: string;
}

const DEFAULT_CONFIG: Required<ClientMCPConfig> = {
  maxToolRounds: 10,
  maxHistoryMessages: 50,
  defaultModel: 'qwen2.5:32b',
  ollamaHost: 'http://localhost:11434',
  mcpServerUrl: 'http://127.0.0.1:3010/mcp',
  platformAuthVerifyPath: 'http://127.0.0.1:3010/auth/verify',
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
  private activeTools: Record<string, OllamaTool> = {};
  private availableTools: Record<string, OllamaTool> = {};

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

    // Reset local tool storage
    this.validators = {};

    this.activeTools = {};
    this.availableTools = {};

    // Map MCP Tools to Ollama Format
    toolsResult.tools.forEach((tool) => {
      // Map for Ollama
      this.availableTools[tool.name] = {
        type: 'function',
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.inputSchema as any,
        },
      };

      // Store schema for internal validation
      this.validators[tool.name] = { schema: tool.inputSchema };
    });

    // Inject Client-side Tools
    this.activeTools['auth_verify'] = {
      type: 'function',
      function: {
        name: 'auth_verify',
        description: 'CRITICAL: Call this tool BEFORE calling the tools to prevent unauthenticated request exception call',
      },
    };

    this.activeTools['read_documentations'] = {
      type: 'function',
      function: {
        name: 'read_documentations',
        description: `CRITICAL: Read the content of an MCP server resource. Available resources: ${availableResourcesUris}.`,
        parameters: {
          type: 'object',
          required: ['uri'],
          properties: { uri: { type: 'string', description: 'The URI of the resource to read' } },
        },
      },
    };

    this.activeTools['load_collection_tools'] = {
      type: 'function',
      function: {
        name: 'load_collection_tools',
        description: `CRITICAL: Call this tool AFTER reading the docs to unlock the database execution tools.
Example: If you need to manage auth grants, pass service="auth" and collection="grant".`,
        parameters: {
          type: 'object',
          required: ['service', 'collection'],
          properties: {
            service: { type: 'string', description: 'The service name (e.g., auth, career)' },
            collection: { type: 'string', description: 'The singular collection name (e.g., grant, user, profile)' },
          },
        },
      },
    };

    // Store schema for internal AJV validation
    this.validators['auth_verify'] = { schema: {} };

    this.validators['read_documentations'] = {
      schema: this.activeTools['read_documentations'].function.parameters,
    };

    this.validators['load_collection_tools'] = {
      schema: this.activeTools['load_collection_tools'].function.parameters,
    };

    console.log('✅ Connected to MCP server');
    console.log('   Resources     :', availableResourcesUris || 'none');
    console.log('   Tools         :', Object.keys(this.availableTools).join(', '));
    console.log('\n\n   Active Tools  :', Object.keys(this.activeTools).join(', '));
  }

  private getValidator(toolName: string) {
    if (!this.validators[toolName]?.validator) {
      const { schema } = this.validators[toolName];
      if (!schema) throw new Error(`No schema for tool: ${toolName}`);
      return (this.validators[toolName].validator = this.ajv.compile(schema));
    } else return this.validators[toolName].validator;
  }

  /**
   * Validates tool arguments against the stored JSON Schema using AJV.
   */
  private validateArgs(toolName: string, args: any): { valid: boolean; error?: string } {
    try {
      const validate = this.getValidator(toolName);
      const valid = validate(args);
      if (!valid) {
        const errors = validate.errors?.map((e) => `${e.instancePath || 'root'} ${e.message}`).join('; ');
        return { valid: false, error: errors };
      } else return { valid: true };
    } catch (err: any) {
      return { valid: false, error: err.message };
    }
  }

  private trimHistory() {
    if (this.messages.length > this.config.maxHistoryMessages) {
      this.messages = this.messages.slice(-this.config.maxHistoryMessages);
    }
  }

  /**
   * Main agent loop — supports multiple tool rounds
   */
  async processQuery(query: string, modelName = this.config.defaultModel): Promise<string> {
    this.messages.push({ role: 'user', content: query });
    this.trimHistory();

    console.log('🤖 Analyzing request...');
    const today = new Date().toISOString().split('T')[0];
    const systemPrompt: Message = {
      role: 'system',
      content: `You are an advanced AI Agent for the Wenex Platform. Today is ${today}.
[ CRITICAL WORKFLOW - DO THIS IN EXACT ORDER EVERY TIME ]:
1. DISCOVER: first of all call 'read_documentations' on 'docs://readme' uri and then the relevant docs.
2. LOAD: You DO NOT have the platform tools by default. You MUST call 'load_collection_tools' with the correct service and collection to unlock them.
3. EXECUTE: Call the newly loaded tools to process the user's request.
NEVER GUESS tool names. Always load them first.`,
    };

    let response = await this.ollama.chat({
      model: modelName,
      tools: Object.values(this.activeTools),
      messages: [systemPrompt, ...this.messages],
    });

    this.messages.push(response.message);

    // --- Handle Tool Calls (if any) ---
    let round = 0;
    while (response.message.tool_calls?.length && round < this.config.maxToolRounds) {
      round++;
      console.log(`🛠 Round ${round}: Executing ${response.message.tool_calls.map((t) => t.function.name).join(', ')}...`);

      // === PARALLEL TOOL EXECUTION ===
      for (const toolCall of response.message.tool_calls) {
        const toolName = toolCall.function.name;
        const toolArgs = toolCall.function.arguments as Record<string, any>;

        console.log(`Parallel execution (${toolName}) args:`, toolArgs);
        const validation = this.validateArgs(toolName, toolArgs);

        let content = '';
        if (!validation.valid) {
          console.warn(`⚠️ Validation failed for ${toolName}`);
          content = toString({
            error: 'validation_failed',
            details: validation.error,
            message: 'Please correct the arguments and try again.',
          });
        } else {
          try {
            if (toolName === 'auth_verify') {
              try {
                const { data } = await axios.get(this.config.platformAuthVerifyPath, {
                  headers: { Authorization: process.env.MCP_CLIENT_APT_TOKEN },
                });
                content += `\n\nTOKEN DECRYPTED VALUES:\n${toString(data)}\n
NOTE: if AI Agent don't know about token values read "docs://core/auth-specification" with "read_documentations" tool`;
              } catch (error) {
                console.error('❌ "auth_verify" endpoint called with exception:', error);
                content += `\n\nTOKEN DECRYPTED VALUES:\n is not valid or expired\n
NOTE: if AI Agent don't know about token values read "docs://core/auth-specification" with "read_documentations" tool`;
              }
            } else if (toolName === 'load_collection_tools') {
              const { service, collection } = toolArgs;
              const targetPattern = `_${toKebabCase(service)}_${toKebabCase(collection)}`;

              let loadedCount = 0;
              Object.values(this.availableTools).forEach((tool) => {
                const toolName = tool.function?.name;
                if (toolName && toolName.endsWith(targetPattern)) {
                  this.activeTools[toolName] = tool;
                  loadedCount++;
                }
              });

              content =
                loadedCount > 0
                  ? `Successfully loaded ${loadedCount} tools containing "*${targetPattern}". You can now execute them.`
                  : `No tools found containing "*${targetPattern}". Please check the spelling from the documentation.`;

              console.log('\n\n   Active Tools  :', Object.keys(this.activeTools).join(', '), '\n');
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
            console.error(`❌ ${toolName} failed:`, err.message);
            content = `ERROR executing ${toolName}: ${err.message}`;
          }
        }

        const lines = content.split(/\r?\n/).filter((line) => line.trim());
        lines.slice(0, 12).forEach((line, index) => {
          console.log(`${(index + 1).toString().padStart(2, '0')}: ${line}`);
        });
        console.log(`... (${lines.length - 12} more lines)\n\n`);

        this.messages.push({ role: 'tool', content, tool_name: toolName });
      }

      response = await this.ollama.chat({
        model: modelName,
        tools: Object.values(this.activeTools),
        messages: [systemPrompt, ...this.messages],
      });

      this.messages.push(response.message);
    }

    if (round >= this.config.maxToolRounds) {
      console.warn('⚠️ Reached maximum tool rounds');
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
        console.log('\n\n');
        console.log('  -------------------------------------------------------  ');
        console.log('  --------------------- AI RESPONSE ---------------------  ');
        console.log('  -------------------------------------------------------  ');
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
