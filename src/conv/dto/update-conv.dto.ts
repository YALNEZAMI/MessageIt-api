/* eslint-disable prettier/prettier */
import { PartialType } from '@nestjs/mapped-types';
import { CreateConvDto } from './create-conv.dto';
//shape of the data that we want to send to the database
export class UpdateConvDto extends PartialType(CreateConvDto) {
  //all fields are optional
  name?: string;
  photo?: string;
  description?: string;
  members?: any[];
  status?: string;
  theme?: string;
}
