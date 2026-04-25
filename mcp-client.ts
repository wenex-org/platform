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
  private mcp: Client;
  private ollama: Ollama;
  private messages: Message[] = [];

  private config: Required<ClientMCPConfig>;
  private transport?: StreamableHTTPClientTransport;

  private activeTools: Record<string, OllamaTool> = {};
  private availableTools: Record<string, OllamaTool> = {};

  private ajv: Ajv = new Ajv({ strict: false, allErrors: true });
  private validators: Record<string, { schema: any; validator?: any }> = {};

  constructor(config: Partial<ClientMCPConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    this.mcp = new Client({
      name: 'ollama-mcp-client',
      version: '2.1.0',
    });

    this.ollama = new Ollama({ host: this.config.ollamaHost });
    addFormats(this.ajv);
  }

  private getAuthorizationHeader(): string {
    const token = process.env.MCP_CLIENT_APT_TOKEN;
    if (!token) throw new Error('MCP_CLIENT_APT_TOKEN environment variable is required');
    return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  }

  async connect(serverUrl: string = this.config.mcpServerUrl): Promise<void> {
    if (this.transport) await this.transport.close();

    this.transport = new StreamableHTTPClientTransport(new URL(serverUrl), {
      requestInit: {
        headers: {
          Authorization: this.getAuthorizationHeader(),
          'Content-Type': 'application/json',
        },
        keepalive: true,
      },
    });

    this.transport.onerror = (err) => console.error('❌ Transport error:', err);
    this.transport.onclose = () => console.log('🔌 Transport closed');

    await this.mcp.connect(this.transport);

    const [toolsResult, resourcesResult] = await Promise.all([this.mcp.listTools(), this.mcp.listResources()]);

    const availableResourcesUris = resourcesResult.resources.map((r) => r.uri).join(', ');

    this.validators = {};
    this.activeTools = {};
    this.availableTools = {};

    toolsResult.tools.forEach((tool) => {
      this.availableTools[tool.name] = {
        type: 'function',
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.inputSchema as any,
        },
      };

      this.validators[tool.name] = { schema: tool.inputSchema };
    });

    this.activeTools['auth_verify'] = {
      type: 'function',
      function: {
        name: 'auth_verify',
        description: 'Verify the current APT before calling Wenex resource tools.',
        parameters: {
          type: 'object',
          properties: {},
        },
      },
    };

    this.activeTools['read_documentations'] = {
      type: 'function',
      function: {
        name: 'read_documentations',
        description: 'Read an MCP documentation resource by URI.',
        parameters: {
          type: 'object',
          required: ['uri'],
          properties: {
            uri: { type: 'string', description: 'The MCP docs URI to read.' },
          },
        },
      },
    };

    this.activeTools['load_collection_tools'] = {
      type: 'function',
      function: {
        name: 'load_collection_tools',
        description:
          'Load Wenex collection tools using exact service and exact collection names from docs (for example service="auth", collection="grants").',
        parameters: {
          type: 'object',
          required: ['service', 'collection'],
          properties: {
            service: { type: 'string', description: 'Exact service name, e.g. auth, career, identity.' },
            collection: {
              type: 'string',
              description: 'Exact collection name, usually plural, e.g. grants, users, products.',
            },
          },
        },
      },
    };

    this.validators['auth_verify'] = {
      schema: { type: 'object', properties: {} },
    };

    this.validators['read_documentations'] = {
      schema: this.activeTools['read_documentations'].function.parameters,
    };

    this.validators['load_collection_tools'] = {
      schema: this.activeTools['load_collection_tools'].function.parameters,
    };

    console.log('✅ Connected to MCP server');
    console.log('   Resources     :', availableResourcesUris || 'none');
    console.log('   Tools         :', Object.keys(this.availableTools).join(', '));
    console.log('\n   Active Tools  :', Object.keys(this.activeTools).join(', '));
  }

  private getValidator(toolName: string) {
    if (!this.validators[toolName]?.validator) {
      const { schema } = this.validators[toolName];
      if (!schema) throw new Error(`No schema for tool: ${toolName}`);
      this.validators[toolName].validator = this.ajv.compile(schema);
    }
    return this.validators[toolName].validator;
  }

  private validateArgs(toolName: string, args: any): { valid: boolean; error?: string } {
    try {
      const validate = this.getValidator(toolName);
      const valid = validate(args);
      if (!valid) {
        const errors = validate.errors?.map((e) => `${e.instancePath || 'root'} ${e.message}`).join('; ');
        return { valid: false, error: errors };
      }
      return { valid: true };
    } catch (err: any) {
      return { valid: false, error: err.message };
    }
  }

  private trimHistory() {
    if (this.messages.length > this.config.maxHistoryMessages) {
      this.messages = this.messages.slice(-this.config.maxHistoryMessages);
    }
  }

  private buildSystemPrompt(): Message {
    const today = new Date().toISOString().split('T')[0];

    return {
      role: 'system',
      content: `You are an advanced AI Agent for the Wenex Platform. Today is ${today}.

Follow this workflow exactly:
1. DISCOVER:
   - First call read_documentations with uri="docs://readme"
   - Then read the relevant core docs, especially docs://core/specification and docs://core/resource-specification
   - Read docs://core/auth-specification whenever token, auth, permissions, scopes, subjects, grants, 401, or 403 may matter
2. VERIFY:
   - Before using Wenex resource tools, call auth_verify
3. LOAD:
   - You do not have collection tools by default
   - Call load_collection_tools with the exact service and exact collection name from documentation
   - Collection names are exact resource collection names and are usually plural (examples: grants, users, products)
4. EXECUTE:
   - Only call tools after loading them
   - Never guess tool names
   - Never guess collection names
   - Follow Wenex docs for x-zone and request shape`,
    };
  }

  async processQuery(query: string, modelName = this.config.defaultModel): Promise<string> {
    this.messages.push({ role: 'user', content: query });
    this.trimHistory();

    console.log('🤖 Analyzing request...');
    const systemPrompt = this.buildSystemPrompt();

    let response = await this.ollama.chat({
      model: modelName,
      tools: Object.values(this.activeTools),
      messages: [systemPrompt, ...this.messages],
    });

    this.messages.push(response.message);

    let round = 0;
    while (response.message.tool_calls?.length && round < this.config.maxToolRounds) {
      round++;
      console.log(`🛠 Round ${round}: Executing ${response.message.tool_calls.map((t) => t.function.name).join(', ')}...`);

      for (const toolCall of response.message.tool_calls) {
        const toolName = toolCall.function.name;
        const toolArgs = toolCall.function.arguments as Record<string, any>;

        console.log(`Executing (${toolName}) args:`, toolArgs);
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
                  headers: { Authorization: this.getAuthorizationHeader() },
                });

                content = `TOKEN DECRYPTED VALUES:\n${toString(data)}\n\nNOTE: If you need help interpreting token values, read docs://core/auth-specification using read_documentations.`;
              } catch (error) {
                console.error('❌ auth_verify failed:', error);
                content =
                  'TOKEN DECRYPTED VALUES:\ninvalid or expired token\n\nNOTE: If you need help interpreting token values, read docs://core/auth-specification using read_documentations.';
              }
            } else if (toolName === 'load_collection_tools') {
              const { service, collection } = toolArgs;
              const targetPattern = `_${service}_${collection}`;

              let loadedCount = 0;
              Object.values(this.availableTools).forEach((tool) => {
                const name = tool.function?.name;
                if (name && name.endsWith(targetPattern)) {
                  this.activeTools[name] = tool;
                  loadedCount++;
                }
              });

              content =
                loadedCount > 0
                  ? `Successfully loaded ${loadedCount} tools matching "*${targetPattern}". You can now execute them.`
                  : `No tools found matching "*${targetPattern}". Use the exact service and exact collection name from the documentation.`;

              console.log('\n   Active Tools  :', Object.keys(this.activeTools).join(', '), '\n');
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

        const remaining = Math.max(0, lines.length - 12);
        if (remaining > 0) console.log(`... (${remaining} more lines)\n`);

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

  async disconnect() {
    if (this.transport) {
      await this.transport.close();
      this.transport = undefined;
    }
    console.log('👋 MCP client disconnected');
  }

  async chatLoop(modelName: string = 'qwen2.5:32b') {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    console.log('\n🚀 MCP Client v2.1 (Lazy Loaded) started!');
    console.log("Type your query or 'quit' to exit.\n");

    const ask = () => new Promise<string>((resolve) => rl.question('\nQuery > ', resolve));

    try {
      while (true) {
        const input = await ask();
        if (input.toLowerCase() === 'quit') break;

        const response = await this.processQuery(input, modelName);
        console.log('\n');
        console.log('  -------------------------------------------------------  ');
        console.log('  --------------------- AI RESPONSE ---------------------  ');
        console.log('  -------------------------------------------------------  ');
        console.log('\n' + response);
      }
    } finally {
      rl.close();
      await this.disconnect();
    }
  }
}

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
    process.exit(1);
  }
})().catch(console.error);
