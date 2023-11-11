/* eslint-disable prettier/prettier */
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { IsEmail } from 'class-validator';
import { Document } from 'mongoose';

@Schema()
export class User {
  @Prop({ required: true })
  firstName: string;
  @Prop({ required: true })
  lastName: string;
  @IsEmail()
  @Prop({ required: false })
  email: string;
  @Prop({ required: false })
  password: string;
  @Prop({ required: true })
  photo: string;
  @Prop({ required: false })
  operation: string;
  @Prop({ required: false })
  addReqs: any[];
  @Prop({ required: false })
  friends: string[];
  @Prop({ required: true })
  status: string;
  @Prop({ required: false })
  lastConnection: Date;
  @Prop({ required: false })
  codePassword: number;
  @Prop({ required: true })
  theme: string;
  @Prop({ required: true })
  accepters: any[];
  @Prop({ required: false })
  signUpType: string;
  @Prop({ required: false })
  idGoogle: string;
}
export const UserSchema = SchemaFactory.createForClass(User);
export type UserDocument = User & Document;
