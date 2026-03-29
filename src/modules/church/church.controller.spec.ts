import { Test, TestingModule } from '@nestjs/testing';
import { ChurchController } from './church.controller';

describe('ChurchController', () => {
  let controller: ChurchController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChurchController],
    }).compile();

    controller = module.get<ChurchController>(ChurchController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
