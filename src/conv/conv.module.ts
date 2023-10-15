/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ConvService } from './conv.service';
import { ConvController } from './conv.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Conv, ConvSchema } from './entities/conv.entity';
import { UserModule } from 'src/user/user.module';
import { MessageModule } from 'src/message/message.module';
import { SessionModule } from 'src/session/session.module';
import { WebSocketsModule } from 'src/web-sockets/web-sockets.module';
//module of conversation
@Module({
  imports: [
    //importing the conversation model and mongoose configuration
    MongooseModule.forFeature([{ name: Conv.name, schema: ConvSchema }]),
    UserModule,
    MessageModule,
    SessionModule,
    WebSocketsModule,
  ],
  controllers: [ConvController],
  providers: [ConvService],
})
export class ConvModule {}
