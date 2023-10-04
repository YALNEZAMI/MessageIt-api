import { Module } from '@nestjs/common';
import { ConvService } from './conv.service';
import { ConvController } from './conv.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Conv, ConvSchema } from './entities/conv.entity';
import { UserModule } from 'src/user/user.module';
import { MessageModule } from 'src/message/message.module';
//module of conversation
@Module({
  exports: [ConvService],
  imports: [
    //importing the conversation model and mongoose configuration
    MongooseModule.forFeature([{ name: Conv.name, schema: ConvSchema }]),
    UserModule,
    MessageModule,
  ],
  controllers: [ConvController],
  providers: [ConvService],
})
export class ConvModule {}
