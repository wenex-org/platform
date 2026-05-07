/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();

/**
 * Wenex MCP Client v3.0
 *
 * Standard MCP client using Ollama as the LLM backend.
 * Connects to the Wenex MCP server, loads all tools and the startup prompt,
 * then enters an interactive chat loop.
 *
 * Prerequisites:
 *   - Run Ollama locally: ollama run qwen2.5:32b
 *   - Remote tunnel:      ssh -L 11434:localhost:11434 wenex@gpu.wenex.org
 *   - Set env:            MCP_CLIENT_APT_TOKEN=<your-apt-token>
 */
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { Ollama, type Tool as OllamaTool, type Message } from 'ollama';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { toString } from '@app/common/core/utils';
import * as readline from 'node:readline';

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
  private mcp: Client;
  private ollama: Ollama;
  private messages: Message[] = [];
  private tools: OllamaTool[] = [];
  private startupMessages: Message[] = [];

  private config: Required<ClientMCPConfig>;
  private transport?: StreamableHTTPClientTransport;

  constructor(config: Partial<ClientMCPConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    this.mcp = new Client({ name: 'wenex-mcp-client', version: '3.0.0' });
    this.ollama = new Ollama({ host: this.config.ollamaHost });
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

    // Load all available tools from the server
    const toolsResult = await this.mcp.listTools();
    this.tools = toolsResult.tools.map((tool) => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.inputSchema as OllamaTool['function']['parameters'],
      },
    }));

    // Fetch the startup workflow prompt from the server
    try {
      const promptResult = await this.mcp.getPrompt({ name: 'wenex-startup', arguments: {} });
      this.startupMessages = promptResult.messages.map((msg) => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: typeof msg.content === 'string' ? msg.content : ((msg.content as any).text ?? ''),
      }));
    } catch {
      console.warn('⚠️  Startup prompt not available — proceeding without it');
    }

    console.log('✅ Connected to MCP server');
    console.log('   Tools  :', this.tools.length, 'loaded');
    console.log('   Prompt :', this.startupMessages.length > 0 ? 'wenex-startup loaded' : 'none');
  }

  private trimHistory(): void {
    if (this.messages.length > this.config.maxHistoryMessages) {
      this.messages = this.messages.slice(-this.config.maxHistoryMessages);
    }
  }

  async processQuery(query: string, modelName = this.config.defaultModel): Promise<string> {
    this.messages.push({ role: 'user', content: query });
    this.trimHistory();

    console.log('🤖 Processing...');

    let response = await this.ollama.chat({
      model: modelName,
      tools: this.tools,
      messages: [...this.startupMessages, ...this.messages],
    });

    this.messages.push(response.message);

    let round = 0;
    while (response.message.tool_calls?.length && round < this.config.maxToolRounds) {
      round++;

      const toolNames = response.message.tool_calls.map((t) => t.function.name).join(', ');
      console.log(`🛠  Round ${round}: ${toolNames}`);

      for (const toolCall of response.message.tool_calls) {
        const toolName = toolCall.function.name;
        const toolArgs = toolCall.function.arguments as Record<string, any>;

        console.log(`   → ${toolName}`, toolArgs);

        let content: string;
        try {
          const result = await this.mcp.callTool({ name: toolName, arguments: toolArgs });
          const textParts = (result.content as any[]).filter((c) => c.type === 'text').map((c) => c.text);
          content = textParts.join('\n');
          if ((result as any).structuredContent) {
            content += `\n\nStructured Content:\n${toString((result as any).structuredContent)}`;
          }
        } catch (err: any) {
          console.error(`❌ ${toolName} failed:`, err.message);
          content = `ERROR executing ${toolName}: ${err.message}`;
        }

        // Preview first 14 lines of tool output
        const lines = content.split(/\r?\n/).filter((line) => line.trim());
        lines.slice(0, 14).forEach((line, i) => console.log(`${(i + 1).toString().padStart(2, '0')}: ${line}`));
        if (lines.length > 14) console.log(`   ... (${lines.length - 14} more lines)`);

        this.messages.push({ role: 'tool', content, tool_name: toolName });
      }

      response = await this.ollama.chat({
        model: modelName,
        tools: this.tools,
        messages: [...this.startupMessages, ...this.messages],
      });

      this.messages.push(response.message);
    }

    if (round >= this.config.maxToolRounds) {
      console.warn('⚠️  Reached maximum tool rounds');
    }

    return response.message.content || '';
  }

  async disconnect(): Promise<void> {
    if (this.transport) {
      await this.transport.close();
      this.transport = undefined;
    }
    console.log('👋 Disconnected');
  }

  async chatLoop(modelName = this.config.defaultModel): Promise<void> {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    console.log('\n🚀 Wenex MCP Client v3.0 started!');
    console.log("   Type your query or 'quit' to exit.\n");

    const ask = () => new Promise<string>((resolve) => rl.question('\nQuery > ', resolve));

    try {
      while (true) {
        const input = await ask();
        if (!input.trim() || input.toLowerCase() === 'quit') break;

        const response = await this.processQuery(input, modelName);

        console.log('\n  ─────────────────────────────────────────');
        console.log('  AI RESPONSE');
        console.log('  ─────────────────────────────────────────\n');
        console.log(response);
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
    console.error('❌ MCP_CLIENT_APT_TOKEN environment variable is required');
    process.exit(1);
  }

  const client = new ClientMCP({
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
