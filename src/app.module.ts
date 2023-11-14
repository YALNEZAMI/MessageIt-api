/* eslint-disable prettier/prettier */
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
import { ConfigModule } from '@nestjs/config';
import { ReactionModule } from './reaction/reaction.module';
import { GoogleStrategy } from './google.strategy';
import { FacebookStrategy } from './facebook.strategy';
import { GithubStrategy } from './github.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.mongo_url, {
      dbName: process.env.mongo_db_name,
      writeConcern: {
        w: 'majority',
      },
    }),
    UserModule,
    ConvModule,
    MessageModule,
    WebSocketsModule,
    SessionModule,
    MailerModule,
    ReactionModule,
  ],
  controllers: [AppController],
  providers: [AppService, GoogleStrategy, FacebookStrategy, GithubStrategy],
})
export class AppModule {
  constructor() {}
}
