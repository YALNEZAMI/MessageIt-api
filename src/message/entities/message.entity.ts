import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Message {
  @Prop({ required: true })
  conv: string;
  @Prop({ required: false })
  text: string;
  @Prop({ required: false })
  files: any[];
  @Prop({ required: true })
  date: Date;
  @Prop({ required: false })
  ref: string;
  @Prop({ required: false })
  invisiblity: string[];
  @Prop({ required: true, type: Object })
  sender: any;
}
export const MessageSchema = SchemaFactory.createForClass(Message);
export type MessageDocument = Message & Document;
