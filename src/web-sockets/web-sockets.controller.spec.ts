import { Test, TestingModule } from '@nestjs/testing';
import { WebSocketsController } from './web-sockets.controller';
import { WebSocketsService } from './web-sockets.service';

describe('WebSocketsController', () => {
  let controller: WebSocketsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebSocketsController],
      providers: [WebSocketsService],
    }).compile();

    controller = module.get<WebSocketsController>(WebSocketsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
