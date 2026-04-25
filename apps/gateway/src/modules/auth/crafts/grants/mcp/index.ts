import { ServerMCP } from '@app/common/core/mcp';
import { registerFindAuthGrantsTool } from './tools/find.tool';
import { registerCreateAuthGrantsTool } from './tools/create.tool';
import { registerDeleteAuthGrantsTool } from './tools/delete.tool';

export const registerAuthGrantsMCP = (mcp: ReturnType<typeof ServerMCP.create>) => {
  registerFindAuthGrantsTool(mcp);
  registerCreateAuthGrantsTool(mcp);
  registerDeleteAuthGrantsTool(mcp);
  // ...
};
