/* eslint-disable prettier/prettier */
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class CreateMessageDto {
  @PrimaryGeneratedColumn()
  _id: string;
  @Column()
  conv: any;
  @Column()
  text: string;
  @Column()
  files: any;
  @Column()
  date: Date;
  @Column()
  ref: string;
  @Column()
  visibility: string[];
  @Column()
  vus: string[];
  @Column()
  sender: string;
  @Column()
  recievedBy: string[];
  @Column()
  reactions: string[] = [];
}
