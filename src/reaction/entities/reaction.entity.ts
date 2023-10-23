/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
@Schema()
export class Reaction {
  @Prop({ required: true })
  type: string;
  @Prop({ required: true, type: Object })
  user: any;
  @Prop({ required: true, type: Object })
  message: any;
}
export const reactionSchema = SchemaFactory.createForClass(Reaction);
export type ReactionDocument = Reaction & Document;
