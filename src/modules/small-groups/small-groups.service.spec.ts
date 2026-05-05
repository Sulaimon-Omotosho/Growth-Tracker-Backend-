import { Test, TestingModule } from '@nestjs/testing';
import { SmallGroupsService } from './small-groups.service';

describe('SmallGroupsService', () => {
  let service: SmallGroupsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SmallGroupsService],
    }).compile();

    service = module.get<SmallGroupsService>(SmallGroupsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
