import { User } from 'src/user/entities/user.entity'
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class VocabularyWord {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  word: string

  @Column()
  translation: string

  @Column({ nullable: true })
  partOfSpeech: string;

  @Column({ nullable: true })
  article: string;

  @Column({ nullable: true })
  infinitive: string;

  @Column({ type: 'int', default: 0 })
  correctAttempts: number;

  @Column({ type: 'int', default: 0 })
  incorrectAttempts: number;

  @ManyToOne(() => User,{
    onDelete: 'CASCADE'
  })
  user: User
}
