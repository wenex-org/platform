import { Injectable, OnModuleInit } from '@nestjs/common';
import { ServerMCP } from '@app/common/core/mcp';
import { registerAuthGrantsMCP } from '../auth/crafts/grants/mcp';

@Injectable()
export class McpService implements OnModuleInit {
  onModuleInit() {
    console.log('🚀 Registering all MCP tools...');

    // Create or get the MCP server instance
    const mcp = ServerMCP.create();

    // Register all MCP tools and resources
    registerAuthGrantsMCP(mcp);

    console.log('✅ All MCP tools have been registered successfully!');
  }
}
