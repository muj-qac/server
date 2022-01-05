import { Column, Entity } from 'typeorm';
import { Table } from './util/Table';

@Entity('users')
export class User extends Table {
  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({
    unique: true,
  })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'simple-json',
    nullable: true,
  })
  details: {
    program: string;
    faculty: string;
    school: string;
    department: string;
  };

  @Column()
  phone_number: string;

  @Column()
  role: string;

  @Column({
    default: false,
  })
  is_admin: boolean;
}
