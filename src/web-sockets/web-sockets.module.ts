import { Module } from '@nestjs/common';
import { WebSocketsService } from './web-sockets.service';
import { WebSocketsController } from './web-sockets.controller';

@Module({
  exports: [WebSocketsService],
  controllers: [WebSocketsController],
  providers: [WebSocketsService],
})
export class WebSocketsModule {}
