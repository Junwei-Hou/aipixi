import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Images } from './images';

@Entity({ name: 'email' })
export class Email {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => Images, image => image.email)
  images: Images[];

  @Column({ unique: true })
  email: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
