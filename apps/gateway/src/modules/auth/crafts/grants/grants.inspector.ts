import { getHeaders, ServerMCP } from '@app/common/core/mcp';
import { z } from 'zod';

export function mcpRegistration() {
  const mcp = ServerMCP.create();

  mcp.server.tool(
    'excuterOfMongoDbGrantTable',
    'Provide the Mongo query after sending the Authorization header.',
    {
      query: z.string().min(1, 'query must not be empty').optional(),
    },
    ({ query }, { signal, requestInfo }) => {
      if (signal.aborted) {
        throw new Error('tools/call was cancelled');
      }

      const headers = getHeaders({ requestInfo });
      console.log('Headers received:', headers);
      const authorizationValue = headers.authorization ?? headers.Authorization;
      const authorization = typeof authorizationValue === 'string' ? authorizationValue : undefined;

      if (!authorization) {
        return {
          content: [
            {
              type: 'text',
              text: 'هدر Authorization یافت نشد. لطفاً درخواست MCP را با هدر Authorization (مثلاً "Authorization: Bearer <token>") ارسال کنید.',
            },
          ],
        };
      }

      if (!query) {
        return {
          content: [
            {
              type: 'text',
              text: 'توکن در هدر تأیید شد. لطفاً کوئری Mongo را در فیلد query ارسال کنید.',
            },
          ],
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: `\nQuery:\n${query}`,
          },
        ],
      };
    },
  );
}
