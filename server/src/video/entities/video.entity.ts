import { SubtitleCue } from 'src/subtitles/entities/subtitle-cue.entity'
import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm'

export enum VideoLevel {
    A1 = 'A1',
    A2 = 'A2',
    B1 = 'B1',
    B2 = 'B2',
    C1 = 'C1',
}

@Entity()
export class Video {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ name: 'youtube_id', unique: true })
    youtubeId!: string

    @Column()
    title!: string

    @Column({ type: 'text', nullable: true })
    description?: string

    @Column({
        type: 'enum',
        enum: VideoLevel,
    })
    level!: VideoLevel

    @OneToMany(() => SubtitleCue, (cue) => cue.video, { cascade: true })
    cues!: SubtitleCue[]

    @CreateDateColumn()
    createdAt!: Date
}
