import { IsArray } from "class-validator";
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";



@Entity('kpi-allocation')
export class KpiAllocation extends BaseEntity {
    @PrimaryGeneratedColumn()
    id:string;

    @Column()
    @IsArray()
    allocated_to_roles:string[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at:Date;
}