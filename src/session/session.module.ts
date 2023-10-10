/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { UserModule } from 'src/user/user.module';

@Module({
  exports: [SessionService],
  imports: [UserModule],
  controllers: [SessionController],
  providers: [SessionService],
})
export class SessionModule {}
