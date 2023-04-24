import { Injectable } from '@nestjs/common';

@Injectable()
export class ArtifactsService {
  getHello(): string {
    return 'Hello World!';
  }
}
