/* eslint-disable prettier/prettier */
import { PartialType } from '@nestjs/mapped-types';
import { CreateMessageDto } from './create-message.dto';

export class UpdateMessageDto extends PartialType(CreateMessageDto) {
  conv?: any;
  text?: string;
  files?: any[];
  date?: Date;
  ref?: string;
  visibility?: string[];
  sender?: string;
  vus?: string[];
  recievedBy?: string[];
  reactions?: string[];
}
