import { IsObject } from "class-validator";
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";



@Entity('kpi-allocation')
export class KpiAllocation extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: string;

    @Column({
        type:'simple-json'
    })
    @IsObject()
    schema:string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}