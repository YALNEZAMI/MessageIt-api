import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class CreateMessageDto {
  @PrimaryGeneratedColumn()
  _id: string;
  @Column()
  conv: string;
  @Column()
  text: string;
  @Column()
  files: any[];
  @Column()
  date: Date;
  @Column()
  ref: string;
  @Column()
  invisiblity: string[];
  @Column()
  sender: string;
}
