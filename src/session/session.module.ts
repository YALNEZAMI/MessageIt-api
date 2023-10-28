/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { UserModule } from 'src/user/user.module';
import { WebSocketsModule } from 'src/web-sockets/web-sockets.module';

@Module({
  exports: [SessionService],
  imports: [UserModule, WebSocketsModule],
  controllers: [SessionController],
  providers: [SessionService],
})
export class SessionModule {}
