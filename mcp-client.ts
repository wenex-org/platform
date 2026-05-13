/**
 * Generic MCP Client
 *
 * Standard MCP client using Ollama as the LLM backend.
 * Connects to any MCP server, captures server-sent startup context,
 * loads all tools, then enters an interactive chat loop.
 *
 * Prerequisites:
 *  - Run Ollama locally: ollama run qwen2.5:32b
 *  - Set env: MCP_CLIENT_APT_TOKEN=<your-auth-token>
 *  - Remote: ssh -L 11434:localhost:11434 wenex@gpu.wenex.org
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
  defaultModel: 'kimi-k2.6:cloud',
  ollamaHost: 'http://localhost:11434',
  mcpServerUrl: 'http://127.0.0.1:3010/mcp',
};

export class ClientMCP {
  private mcp: Client;
  private ollama: Ollama;
  private messages: Message[] = [];

  private tools: OllamaTool[] = [];
  private systemContext: string = '';

  private config: Required<ClientMCPConfig>;
  private transport?: StreamableHTTPClientTransport;

  constructor(config: Partial<ClientMCPConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.ollama = new Ollama({ host: this.config.ollamaHost });
    this.mcp = new Client({ name: 'mcp-client', version: '1.0.0' });
  }

  async connect(serverUrl: string = this.config.mcpServerUrl, authToken?: string): Promise<void> {
    if (this.transport) await this.transport.close();

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authToken) {
      headers['Authorization'] = authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`;
    }

    this.transport = new StreamableHTTPClientTransport(new URL(serverUrl), {
      requestInit: { headers, keepalive: true },
    });

    this.transport.onerror = (err) => console.error('Transport error:', err);
    this.transport.onclose = () => console.log('Transport closed');

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

    // listPrompts() for servers that use prompt discovery.
    if (!this.systemContext) {
      const promptsResult = await this.mcp.listPrompts();
      if (promptsResult.prompts.length > 0) {
        const first = await this.mcp.getPrompt({ name: promptsResult.prompts[0].name, arguments: {} });
        const text = first.messages
          .map((m) => (typeof m.content === 'string' ? m.content : ((m.content as any).text ?? '')))
          .join('\n');
        if (text) this.systemContext = text;
      }
      console.log('from the prompt, systemContext value is:', this.systemContext);
    }

    console.log('\nConnected to MCP server');
    console.log('  Tools  :', this.tools.length, 'loaded');
    console.log('  Context:', this.systemContext ? 'received' : 'none');
  }

  private trimHistory(): void {
    if (this.messages.length > this.config.maxHistoryMessages) {
      this.messages = this.messages.slice(-this.config.maxHistoryMessages);
    }
  }

  async processQuery(query: string, modelName = this.config.defaultModel): Promise<string> {
    this.messages.push({ role: 'user', content: query });
    this.trimHistory();

    console.log('Processing...');

    const contextMessages: Message[] = this.systemContext ? [{ role: 'system', content: this.systemContext }] : [];

    let response = await this.ollama.chat({
      model: modelName,
      tools: this.tools,
      messages: [...contextMessages, ...this.messages],
    });

    this.messages.push(response.message);

    let round = 0;
    while (response.message.tool_calls?.length && round < this.config.maxToolRounds) {
      round++;

      const toolNames = response.message.tool_calls.map((t) => t.function.name).join(', ');
      console.log(`Round ${round}: ${toolNames}`);

      for (const toolCall of response.message.tool_calls) {
        const toolName = toolCall.function.name;
        const toolArgs = toolCall.function.arguments as Record<string, any>;

        console.log(`  → ${toolName}`, toolArgs);

        let content: string;
        try {
          const result = await this.mcp.callTool({ name: toolName, arguments: toolArgs });
          const textParts = (result.content as any[]).filter((c) => c.type === 'text').map((c) => c.text);
          content = textParts.join('\n');
          const structured = (result as { structuredContent?: unknown }).structuredContent;
          if (structured) content += `\n\nStructured Content:\n${toString(structured)}`;
        } catch (err: any) {
          console.error(`${toolName} failed:`, err.message);
          content = `ERROR executing ${toolName}: ${err.message}`;
        }

        // Preview first 14 lines of tool output
        const lines = content.split(/\r?\n/).filter((line) => line.trim());
        lines.slice(0, 14).forEach((line, i) => console.log(`${(i + 1).toString().padStart(2, '0')}: ${line}`));
        if (lines.length > 14) console.log(`  ... (${lines.length - 14} more lines)`);

        this.messages.push({ role: 'tool', content, tool_name: toolName });
        this.trimHistory();
      }

      response = await this.ollama.chat({
        model: modelName,
        tools: this.tools,
        messages: [...contextMessages, ...this.messages],
      });

      this.messages.push(response.message);
    }

    if (round >= this.config.maxToolRounds) {
      console.warn('Reached maximum tool rounds');
    }

    return response.message.content || '';
  }

  async disconnect(): Promise<void> {
    if (this.transport) {
      await this.transport.close();
      this.transport = undefined;
    }
    console.log('Disconnected');
  }

  async chatLoop(modelName = this.config.defaultModel): Promise<void> {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    console.log('\nMCP Client started. Type your query or "quit" to exit.\n');
    const ask = () => new Promise<string>((resolve) => rl.question('\nQuery > ', resolve));

    try {
      while (true) {
        const input = await ask();
        if (!input.trim() || input.toLowerCase() === 'quit') break;

        const response = await this.processQuery(input, modelName);

        console.log('\n  ─────────────────────────────────────────');
        console.log('  RESPONSE');
        console.log('  ─────────────────────────────────────────\n');
        console.log(response);
      }
    } finally {
      rl.close();
      await this.disconnect();
    }
  }
}

// Only Wenex-specific knowledge lives here — outside the class
(async () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('dotenv').config();

  const token = process.env.MCP_CLIENT_APT_TOKEN;
  const serverUrl = process.env.MCP_SERVER_URL;

  if (!token) {
    console.error('MCP_CLIENT_APT_TOKEN environment variable is required');
    process.exit(1);
  }

  const client = new ClientMCP({
    // defaultModel: 'llama3.1:8b',
  });

  try {
    await client.connect(serverUrl, token);
    await client.chatLoop();
  } catch (err) {
    console.error('Fatal error:', err);
    await client.disconnect();
    process.exit(1);
  }
})().catch(console.error);
