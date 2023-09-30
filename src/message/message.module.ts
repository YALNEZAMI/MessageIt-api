import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from './entities/message.entity';
import { UserModule } from 'src/user/user.module';
import { WebSocketsModule } from 'src/web-sockets/web-sockets.module';

@Module({
  exports: [MessageService],
  imports: [
    WebSocketsModule,
    UserModule,
    MongooseModule.forFeature([
      {
        name: Message.name,
        schema: MessageSchema,
      },
    ]),
  ],
  controllers: [MessageController],
  providers: [MessageService],
})
export class MessageModule {}
