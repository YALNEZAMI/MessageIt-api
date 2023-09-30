import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConvModule } from './conv/conv.module';
import { MessageModule } from './message/message.module';
import { WebSocketsModule } from './web-sockets/web-sockets.module';
import { SessionModule } from './session/session.module';
import { MailerModule } from './mailer/mailer.module';

@Module({
  imports: [
    UserModule,
    MongooseModule.forRoot(
      'mongodb+srv://yalnezami:1122334455@cluster0.zprpqjl.mongodb.net/?retryWrites=true&w=majority',
      { dbName: 'nestNgMessenger' },
    ),
    ConvModule,
    MessageModule,
    WebSocketsModule,
    SessionModule,
    MailerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
