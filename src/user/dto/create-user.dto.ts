/* eslint-disable prettier/prettier */
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class CreateUserDto {
  password2: string;
  @PrimaryGeneratedColumn()
  _id: string;
  @Column()
  firstName: string;
  @Column()
  lastName: string;
  @Column()
  email: string;
  @Column()
  password: string;
  @Column()
  photo: string;
  @Column()
  addReq: string[];
  @Column()
  friends: string[];
  @Column()
  status: string;
  @Column()
  theme: string;
  @Column()
  lastConnection: Date;
}
