/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.entity';
import { WebSocketsModule } from 'src/web-sockets/web-sockets.module';
import { GoogleStrategy } from '../google.strategy';

@Module({
  exports: [UserService],
  imports: [
    WebSocketsModule,
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, GoogleStrategy],
})
export class UserModule {}
