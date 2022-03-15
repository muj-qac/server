import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { KpiAllocation } from './KpiAllocation.model';
import { RejectedKpi } from './RejectedKpi.model';
import { User } from './User.model';
import { VerifiedKpi } from './VerifiedKpi.model';

export enum statusTypes {
  PENDING = 'pending',
  INPROCESS = 'processing',
  VERIFIED = 'verified',
  REJECTED = 'rejected'
}

@Entity('uploaded_sheets')
@Unique(['allocated', 'user'])
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

  @OneToOne(() => RejectedKpi, (rejectedKpi) => rejectedKpi.uploadedSheet, {
    onDelete: 'CASCADE',
  })
  rejectedKpi: RejectedKpi;

  @OneToOne(() => VerifiedKpi, (verifiedKpi) => verifiedKpi.uploadedSheet, {
    onDelete: 'CASCADE',
  })
  verifiedKpi: VerifiedKpi;

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
