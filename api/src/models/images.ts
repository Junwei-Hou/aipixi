import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Email } from './email';

@Entity({ name: 'image' })
export class Images {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  image: string;

  @Column({ unique: true, nullable: true  })
  aiImage: string;

  @ManyToOne(() => Email)
  email: Email;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
