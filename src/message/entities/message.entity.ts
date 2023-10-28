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
  @Prop({ required: false, type: Object })
  sender: any;
  @Prop({ required: false })
  recievedBy: string[];
  @Prop({ required: false })
  reactions: string[];
  @Prop({ required: true })
  typeMsg: string;
  @Prop({ required: false })
  sous_type: string;
  @Prop({ required: false, type: Object })
  maker: any;
  @Prop({ required: false, type: Object })
  reciever: any;
}
export const MessageSchema = SchemaFactory.createForClass(Message);
export type MessageDocument = Message & Document;
