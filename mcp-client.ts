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
    this.availableTools = {};
    this.validators = {};

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

    // Inject Client-side Resource Reader Tool
    this.availableTools['read_mcp_resource'] = {
      type: 'function',
      function: {
        name: 'read_mcp_resource',
        description: `Read the content of an MCP server resource. Available resource: ${availableResourcesUris}`,
        parameters: {
          type: 'object',
          required: ['uri'],
          properties: { uri: { type: 'string', description: 'The URI of the resource to read' } },
        },
      },
    };

    // Store schema for internal AJV validation
    this.validators['read_mcp_resource'] = {
      schema: { type: 'object', properties: { uri: { type: 'string' } }, required: ['uri'] },
    };

    console.log('✅ Connected to MCP server');
    console.log('   Resources :', availableResourcesUris || 'none');
    console.log(
      '   Tools     :',
      Object.values(this.availableTools)
        .map((t) => t.function.name)
        .join(', '),
    );
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

    console.log('🤖 Sending query to Ollama...');

    // --- Initial LLM Request ---
    let response = await this.ollama.chat({
      model: modelName,
      messages: this.messages,
      tools: Object.values(this.availableTools),
    });

    this.messages.push(response.message);

    // --- Handle Tool Calls (if any) ---
    let round = 0;
    while (response.message.tool_calls?.length && round < this.config.maxToolRounds) {
      round++;
      console.log(`🛠 Round ${round}: ${response.message.tool_calls.length} tool call(s)`);

      // === PARALLEL TOOL EXECUTION ===
      const toolPromises = response.message.tool_calls.map(async (toolCall): Promise<Message> => {
        const toolName = toolCall.function.name;
        const toolArgs = toolCall.function.arguments as Record<string, any>;

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
            if (toolName === 'read_mcp_resource') {
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
            content = `${toolName} execution error: ${err.message}`;
          }
        }

        return { role: 'tool', content, tool_name: toolName };
      });

      const results = await Promise.all(toolPromises);

      // Append results in original order
      for (const result of results) {
        this.messages.push(result);
      }

      this.trimHistory();

      // Next LLM turn
      response = await this.ollama.chat({
        model: modelName,
        messages: this.messages,
        tools: Object.values(this.availableTools),
      });

      this.messages.push(response.message);
    }

    if (round >= this.config.maxToolRounds) {
      console.warn('⚠️ Reached maximum tool rounds');
    }

    return response.message.content || '';
  }

  async disconnect(): Promise<void> {
    await this.transport?.close();
    await this.mcp?.close?.();
    console.log('👋 MCP client disconnected');
  }

  /**
   * Interactive chat loop with graceful exit
   */
  async chatLoop(modelName: string = 'qwen2.5:32b') {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log('\n🚀 MCP Client v2.0 started!');
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
      await this.disconnect();
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
    await client.disconnect();
  }
})().catch(console.error);
