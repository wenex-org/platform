import { ServerMCP } from '@app/common/core/mcp';
import { registerFindAuthGrantTool } from './tools/find.tool';
import { registerCreateAuthGrantTool } from './tools/create.tool';
import { registerDeleteAuthGrantByIdTool } from './tools/delete.tool';

export const registerAuthGrantsMCP = (mcp: ReturnType<typeof ServerMCP.create>) => {
  registerFindAuthGrantTool(mcp);
  registerCreateAuthGrantTool(mcp);
  registerDeleteAuthGrantByIdTool(mcp);
  // ...
};
