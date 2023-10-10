/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Message {
  @Prop({ required: true, type: Object })
  conv: any;
  @Prop({ required: false })
  text: string;
  @Prop({ required: false })
  files: any[];
  @Prop({ required: true })
  date: Date;
  @Prop({ required: false, type: Object })
  ref: any;
  @Prop({ required: false })
  visibility: string[];
  @Prop({ required: true })
  vus: string[];
  @Prop({ required: true, type: Object })
  sender: any;
}
export const MessageSchema = SchemaFactory.createForClass(Message);
export type MessageDocument = Message & Document;
