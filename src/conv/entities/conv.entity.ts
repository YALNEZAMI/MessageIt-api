/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Message } from 'src/message/entities/message.entity';

@Schema()
export class Conv {
  @Prop({ required: false })
  photo: string;
  @Prop({ required: false })
  lastMessage: Message;
  @Prop({ required: false })
  name: string;
  @Prop({ required: false })
  description: string;
  @Prop({ required: true })
  theme: string;
  @Prop({ required: true })
  members: any[];
}
export const ConvSchema = SchemaFactory.createForClass(Conv);
export type ConvDocument = Conv & Document;
