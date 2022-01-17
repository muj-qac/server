import { IsObject } from "class-validator";
import { BaseEntity, Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { KpiAllocation } from "./KpiAllocation.model";



@Entity('kpi-data')
export class KpiData extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({
        type: 'simple-json'
    })
    @IsObject()
    schema: string;

    @OneToOne(() => KpiAllocation, allocation => allocation.kpiData)
    allocation: KpiAllocation

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}