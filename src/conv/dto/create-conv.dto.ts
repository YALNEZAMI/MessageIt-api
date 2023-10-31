/* eslint-disable prettier/prettier */
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
//shape of the data that we want to send to the database
@Entity()
export class CreateConvDto {
  //id is automatically generated
  @PrimaryGeneratedColumn()
  _id: string;
  //photo of the conversation
  @Column()
  photo: string;
  //name of the conversation
  @Column()
  name: string;
  //description of the conversation if exist
  @Column()
  description: string;

  //theme of conv
  @Column()
  theme: string;
  //members of the conversation(string to set and array to get)
  @Column()
  members: any[];
  //type of the conversation(group or private)
  @Column()
  type: string;
  //admins of the conversation
  @Column()
  admins?: any[];
  //date of creation
  @Column()
  createdAt: Date;
  //chef of group
  @Column()
  chef?: string;
}
