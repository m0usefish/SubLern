import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ExerciseResult } from "./exercise-result.entity";

@Entity()
export class ExerciseSet {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId!: number

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    
    user!: User
    @Column({ type: 'jsonb' }) // PostgreSQL
    payloadJson: any;

    @OneToMany(() => ExerciseResult, (result) => result.exerciseSet)
    results: ExerciseResult[];


}
