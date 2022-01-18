import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { KpiAllocation } from './KpiAllocation.model';
import { User } from './User.model';

export enum statusTypes {
  PENDING = 'pending',
  INPROCESS = 'processing',
  VERIFIED = 'verified',
}

@Entity('uploaded-sheets')
export class UploadedSheet extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: statusTypes,
  })
  status: string;

  @Column()
  aws_key: string;

  @ManyToOne(() => KpiAllocation, (allocated) => allocated.uploadedSheets, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'kpi_id',
  })
  allocated: KpiAllocation;

  @ManyToOne(() => User, (user) => user.uploadedSheets)
  @JoinColumn({
    name: 'user_id',
  })
  user: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
