import { IsAlpha, IsArray, IsEmail, IsPhoneNumber } from 'class-validator';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UploadedSheet } from './UploadedSheet.model';

@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @IsAlpha()
  first_name: string;

  @Column({
    nullable: true,
  })
  last_name: string;

  @Column({
    unique: true,
  })
  @IsEmail()
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

  @Column({
    nullable: true,
  })
  @IsPhoneNumber('IN')
  phone_number: string;

  @Column({
    type: 'simple-array',
  })
  @IsArray()
  role: string[];

  @Column({
    default: false,
  })
  is_admin: boolean;

  @OneToMany(() => UploadedSheet, (uploadedSheet) => uploadedSheet.user)
  uploadedSheets: UploadedSheet[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
