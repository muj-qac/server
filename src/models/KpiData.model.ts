import { IsObject } from 'class-validator';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CellValidation } from '../types/sheet/validations';
import { KpiAllocation } from './KpiAllocation.model';

@Entity('kpi_data')
export class KpiData extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'simple-json',
  })
  @IsObject()
  schema: CellValidation[];

  @Column()
  sheet_id: string;

  @OneToOne(() => KpiAllocation, (allocation) => allocation.kpiData, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  allocation: KpiAllocation;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
