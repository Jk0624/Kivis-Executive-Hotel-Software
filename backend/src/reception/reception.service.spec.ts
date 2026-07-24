import { Test, TestingModule } from '@nestjs/testing';
import { ReceptionService } from './reception.service';

describe('ReceptionService', () => {
  let service: ReceptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReceptionService],
    }).compile();

    service = module.get<ReceptionService>(ReceptionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
