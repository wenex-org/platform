import { Test, TestingModule } from '@nestjs/testing';
import { ArtifactsController } from './artifacts.controller';
import { ArtifactsService } from './artifacts.service';

describe('ArtifactsController', () => {
  let artifactsController: ArtifactsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ArtifactsController],
      providers: [ArtifactsService],
    }).compile();

    artifactsController = app.get<ArtifactsController>(ArtifactsController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(artifactsController.getHello()).toBe('Hello World!');
    });
  });
});
