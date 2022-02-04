import { IsArray, IsBoolean } from 'class-validator';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { KpiData } from './KpiData.model';
import { UploadedSheet } from './UploadedSheet.model';

@Entity('kpi_allocation')
export class KpiAllocation extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'simple-array',
  })
  @IsArray()
  allocated_to_roles: string[];

  @Column({
    default: false,
  })
  @IsBoolean()
  status: boolean;

  @OneToOne(() => KpiData, (kpiData) => kpiData.allocation, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  kpiData: KpiData;

  @OneToMany(() => UploadedSheet, (uploadedSheet) => uploadedSheet.allocated)
  uploadedSheets: UploadedSheet[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
