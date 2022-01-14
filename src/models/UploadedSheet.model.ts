import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum statusTypes {
    PENDING = "pending",
    INPROCESS = "processing",
    VERIFIED = "verified"
}

@Entity('uploaded-sheets')
export class UploadedSheet extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: string;

    @Column({
        type: "enum",
        enum: statusTypes
    })
    status: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}