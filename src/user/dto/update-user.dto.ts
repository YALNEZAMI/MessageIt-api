/* eslint-disable prettier/prettier */
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  password2?: string;
  photo?: string;
  addReqs?: string[];
  friends?: string[];
  status?: string;
  codePassword?: number;
  lastConnection?: Date;
}
