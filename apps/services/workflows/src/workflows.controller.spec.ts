import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowsController } from './workflows.controller';
import { WorkflowsService } from './workflows.service';

describe('WorkflowsController', () => {
  let workflowsController: WorkflowsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [WorkflowsController],
      providers: [WorkflowsService],
    }).compile();

    workflowsController = app.get<WorkflowsController>(WorkflowsController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(workflowsController.getHello()).toBe('Hello World!');
    });
  });
});
