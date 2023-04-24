import { Controller, Get } from '@nestjs/common';
import { AssetsService } from './assets.service';

@Controller()
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get()
  getHello(): string {
    return this.assetsService.getHello();
  }
}
