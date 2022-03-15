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

@Entity('verified_kpi')
export class VerifiedKpi extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    aws_key: string;

    @OneToOne(() => UploadedSheet, (uploadedSheet) => uploadedSheet.verifiedKpi, { onDelete: 'CASCADE' })
    @JoinColumn()
    uploadedSheet: UploadedSheet;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
