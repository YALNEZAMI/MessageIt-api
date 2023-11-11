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
  signUpType?: string;
  @Column()
  addReq: any[] = [];
  @Column()
  friends: string[] = [];
  @Column()
  status: string = 'offline';
  @Column()
  theme: string = 'basic';
  @Column()
  lastConnection: Date = new Date();
  @Column()
  accepters?: any[] = [];
}
