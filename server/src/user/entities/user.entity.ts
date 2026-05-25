import { VideoProgress } from 'src/progress/entities/progress.entity'
import { VocabularyWord } from 'src/vocabulary/entities/vocabulary-word.entity'
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  email!: string

  @Column()
  password!: string

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role!: UserRole

    @Column({ default: 0 })
    streak!: number;

    @Column({ type: 'timestamp', nullable: true })
    lastActiveAt!: Date;
    
     @OneToMany(() => VocabularyWord, (word) => word.user)
  vocabulary!: VocabularyWord[]

  @OneToMany(() => VideoProgress, (progress) => progress.user)
  progress!: VideoProgress[]

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

}
