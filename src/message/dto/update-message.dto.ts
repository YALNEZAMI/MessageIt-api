import { PartialType } from '@nestjs/mapped-types';
import { CreateMessageDto } from './create-message.dto';

export class UpdateMessageDto extends PartialType(CreateMessageDto) {
  conv?: string;
  text?: string;
  files?: any[];
  date?: Date;
  ref?: string;
  invisiblity?: string[];
  sender?: string;
}
