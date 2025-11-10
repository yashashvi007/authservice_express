import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';

@Entity({ name: 'refreshTokens' })
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp' })
  expires_at: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @UpdateDateColumn()
  updated_at: number;

  @CreateDateColumn()
  created_at: number;
}
