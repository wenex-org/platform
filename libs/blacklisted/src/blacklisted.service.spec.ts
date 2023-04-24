import { Test, TestingModule } from '@nestjs/testing';
import { BlacklistedService } from './blacklisted.service';

describe('BlacklistedService', () => {
  let service: BlacklistedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BlacklistedService],
    }).compile();

    service = module.get<BlacklistedService>(BlacklistedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
