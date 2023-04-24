import { Controller, Get } from '@nestjs/common';
import { ArtifactsService } from './artifacts.service';

@Controller()
export class ArtifactsController {
  constructor(private readonly artifactsService: ArtifactsService) {}

  @Get()
  getHello(): string {
    return this.artifactsService.getHello();
  }
}
