import { Test, TestingModule } from '@nestjs/testing';
import { SmallGroupsController } from './small-groups.controller';
import { SmallGroupsService } from './small-groups.service';

describe('SmallGroupsController', () => {
  let controller: SmallGroupsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SmallGroupsController],
      providers: [SmallGroupsService],
    }).compile();

    controller = module.get<SmallGroupsController>(SmallGroupsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
