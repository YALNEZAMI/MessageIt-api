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
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  photo: string;
  @Prop({ required: false })
  operation: string;

  @Prop({ required: false })
  addReqs: string[];
  @Prop({ required: false })
  friends: string[];
  @Prop({ required: true })
  status: string;
  @Prop({ required: false })
  codePassword: number;
}
export const UserSchema = SchemaFactory.createForClass(User);
export type UserDocument = User & Document;
