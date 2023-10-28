/* eslint-disable prettier/prettier */
import { PartialType } from '@nestjs/mapped-types';
import { CreateReactionDto } from './create-reaction.dto';

export class UpdateReactionDto extends PartialType(CreateReactionDto) {
  _id?: string;
  type?: string;
  user?: string;
  message?: string;
}
