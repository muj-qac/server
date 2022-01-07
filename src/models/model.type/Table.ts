import {
  BaseEntity,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

// ============================================================
// Use this in every mode as this is going to be a base model
// ============================================================

@Entity()
export class Table extends BaseEntity {
  @PrimaryColumn({
    type: 'uuid',
  })
  id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
