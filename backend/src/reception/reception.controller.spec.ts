import { Test, TestingModule } from '@nestjs/testing';
import { ReceptionController } from './reception.controller';

describe('ReceptionController', () => {
  let controller: ReceptionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReceptionController],
    }).compile();

    controller = module.get<ReceptionController>(ReceptionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
