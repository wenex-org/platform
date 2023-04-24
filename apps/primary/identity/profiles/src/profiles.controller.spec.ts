import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';

describe('ProfilesController', () => {
  let profilesController: ProfilesController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ProfilesController],
      providers: [ProfilesService],
    }).compile();

    profilesController = app.get<ProfilesController>(ProfilesController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(profilesController.getHello()).toBe('Hello World!');
    });
  });
});
