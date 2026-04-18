import { Module } from '@nestjs/common';
import { McpService } from './mcp.service';

@Module({
  providers: [McpService],
})
export class McpModule {}
