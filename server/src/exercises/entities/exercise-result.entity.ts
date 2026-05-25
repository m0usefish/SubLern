import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ExerciseSet } from "./exercise-set.entity";


@Entity()
export class ExerciseResult {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => ExerciseSet, (set) => set.results, { onDelete: 'CASCADE' })
    exerciseSet: ExerciseSet;

    @Column({ type: 'int' })
    score: number;

    @Column({ type: 'jsonb' })
    answersJson: any;

    @CreateDateColumn()
    submittedAt: Date;



}