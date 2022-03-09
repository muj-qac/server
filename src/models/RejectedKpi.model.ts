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
import { UploadedSheet } from './UploadedSheet.model';

@Entity('rejected_kpi')
export class RejectedKpi extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    comment: string;

    @Column()
    aws_key: string;

    @OneToOne(() => UploadedSheet, (uploadedSheet) => uploadedSheet.rejectedKpi, { onDelete: 'CASCADE' })
    @JoinColumn()
    uploadedSheet: UploadedSheet;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
