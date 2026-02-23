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
import addFormats from 'ajv-formats';
import * as readline from 'readline';
import Ajv from 'ajv';

const OLLAMA_HOST = 'http://localhost:11434';
const ollama = new Ollama({ host: OLLAMA_HOST });

export class ClientMCP {
  // Core MCP Components
  private mcp: Client;
  private messages: Message[] = [];
  private transport?: StreamableHTTPClientTransport;

  // Tool Management
  private availableTools: OllamaTool[] = [];
  private toolSchemas: Record<string, any> = {};

  // Validation
  private ajv: Ajv;

  constructor() {
    this.mcp = new Client({
      name: 'ollama-mcp-client',
      version: '1.0.0',
    });

    // Initialize AJV with loose strict mode for flexibility
    this.ajv = new Ajv({ strict: false });
    addFormats(this.ajv);
  }

  /**
   * Establishes connection to the MCP Server via SSE transport.
   * Loads and parses available tools for Ollama compatibility.
   */
  async connect(serverUrl: string): Promise<void> {
    // 1. Cleanup existing transport if any
    if (this.transport) await this.transport.close();

    const url = new URL(serverUrl);

    // 2. Initialize Transport with headers
    this.transport = new StreamableHTTPClientTransport(url, {
      requestInit: {
        headers: {
          // TODO: Logic preserved as requested (hardcoded token used instead of argument)
          Authorization: `apt-Ycw5FZ6l9k8lvk3hoDJDZUjTIh9`,
          'Content-Type': 'application/json',
        },
        keepalive: true,
      },
    });

    // Transport Event Listeners
    this.transport.onerror = (err) => console.error('❌ Transport error:', err);
    this.transport.onclose = () => console.log('🔌 Transport closed');

    // 3. Connect and Fetch Tools
    await this.mcp.connect(this.transport);
    const toolsResult = await this.mcp.listTools();

    // Reset local tool storage
    this.availableTools = [];
    this.toolSchemas = {};

    // 4. Map MCP Tools to Ollama Format & Store Schemas
    toolsResult.tools.forEach((tool) => {
      // Map for Ollama
      this.availableTools.push({
        type: 'function',
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.inputSchema as any,
        },
      });

      // Store schema for internal validation
      this.toolSchemas[tool.name] = tool.inputSchema;
    });

    console.log(
      '✅ Connected to MCP server. Available Tools:',
      this.availableTools.map((t) => t.function.name),
    );
  }

  /**
   * Validates tool arguments against the stored JSON Schema using AJV.
   */
  private validateArgs(toolName: string, args: any): { valid: boolean; errors?: string } {
    const schema = this.toolSchemas[toolName];
    if (!schema) {
      return { valid: false, errors: `Schema not found for tool ${toolName}` };
    }

    const validate = this.ajv.compile(schema);
    const valid = validate(args);

    if (!valid) {
      const errorText = validate.errors?.map((e) => `Parameter '${e.instancePath}' ${e.message}`).join(', ');
      return { valid: false, errors: errorText };
    }

    return { valid: true };
  }

  /**
   * Main processing loop
   *
   * 1. Sends query to LLM.
   * 2. Detects tool calls.
   * 3. Validates arguments client-side.
   * 4. Executes tools (if valid) or returns validation errors.
   * 5. Returns final response from LLM.
   */
  async processQuery(query: string, modelName: string = 'llama3.1:8b') {
    this.messages.push({ role: 'user', content: query });

    console.log('🤖 Sending query to Ollama...');

    // --- Step 1: Initial LLM Request ---
    const firstResponse = await ollama.chat({
      model: modelName,
      messages: this.messages,
      tools: this.availableTools,
    });

    this.messages.push(firstResponse.message);

    // --- Step 2: Handle Tool Calls (if any) ---
    if (firstResponse.message.tool_calls && firstResponse.message.tool_calls.length > 0) {
      console.log(`🛠 Model requested ${firstResponse.message.tool_calls.length} tool(s)`);

      for (const toolCall of firstResponse.message.tool_calls) {
        const toolName = toolCall.function.name;
        const toolArgs = toolCall.function.arguments as Record<string, any>;

        console.log(`🔍 Validating args for ${toolName}...`);

        // Client-Side Validation
        const validation = this.validateArgs(toolName, toolArgs);
        let toolContent = '';

        if (!validation.valid) {
          // Case A: Validation Failed
          console.warn(`⚠️ Validation Failed: ${validation.errors}`);
          toolContent = `Client-Side Validation Error: The arguments provided are invalid. ${validation.errors}. Please fix the arguments and try again.`;
        } else {
          // Case B: Validation Passed -> Execute Tool
          console.log('🔒 Injecting auth token for execution...');
          console.log(`▶ Executing ${toolName}...`);

          try {
            const result = await this.mcp.callTool({
              name: toolName,
              arguments: toolArgs,
            });

            // Parse result content
            const resultContent = result.content as { type: 'text'; text: string }[];
            toolContent = resultContent.map((c) => (c.type === 'text' ? c.text : '')).join('\n');

            console.log(`📄 Tool Output: ${toolContent.substring(0, 50)}...`);
            toolContent += `\n\nStructured Content:\n${toString(result.structuredContent)}`;
          } catch (error: any) {
            console.error(`❌ Tool execution failed: ${error.message}`);
            toolContent = `Error executing tool: ${error.message}`;
          }
        }

        // Append tool result to history
        this.messages.push({
          role: 'tool',
          content: toolContent,
        });
      }

      // --- Step 3: Final LLM Response ---
      console.log('🤖 Generating final response...');
      const finalResponse = await ollama.chat({
        model: modelName,
        messages: this.messages,
        tools: this.availableTools,
      });

      return finalResponse.message.content;
    }

    // If no tools were called, return original response
    return firstResponse.message.content;
  }

  async chatLoop(modelName: string = 'qwen2.5:32b') {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log('\nMCP Client Started!!');
    console.log("Type your queries or 'quit' to exit.");

    while (true) {
      const message = await new Promise<string>((resolve) => {
        rl.question('\nQuery: ', resolve);
      });

      if (message.toLowerCase() === 'quit') {
        break;
      }

      const response = await this.processQuery(message, modelName);
      console.log('\n' + response);
    }

    rl.close();
  }
}

// --- Main Execution ---
(async () => {
  const client = new ClientMCP();

  try {
    await client.connect('http://127.0.0.1:3010/mcp');
    await client.chatLoop('qwen2.5:32b'); // Start interactive loop with your model
  } catch (err) {
    console.error('Main Error:', err);
  }
})().catch(console.error);
