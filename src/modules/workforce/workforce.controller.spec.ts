import { Test, TestingModule } from '@nestjs/testing';
import { WorkforceController } from './workforce.controller';
import { WorkforceService } from './workforce.service';

describe('WorkforceController', () => {
  let controller: WorkforceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkforceController],
      providers: [WorkforceService],
    }).compile();

    controller = module.get<WorkforceController>(WorkforceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
