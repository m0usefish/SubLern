import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Video } from 'src/video/entities/video.entity';


@Entity()
export class SubtitleCue {
    @PrimaryGeneratedColumn()
    id!: number

    @ManyToOne(() => Video, (video) => video.cues, { onDelete: 'CASCADE' })
    video!: Video;



    @Column({ type: 'int' })
    startMs!: number;

    @Column({ type: 'int' })
    endMs!: number;

    @Column({ type: 'text' })
    text!: string;
}
