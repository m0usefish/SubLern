
import { User } from "src/user/entities/user.entity";
import { Video } from "src/video/entities/video.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class VideoProgress {

    @PrimaryGeneratedColumn()
    id!: number

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    user!: User;

    @ManyToOne(() => Video, { onDelete: 'CASCADE' })
    video!: Video;

    @Column({ default: false })
    completed!: boolean;

    @UpdateDateColumn()
    updatedAt!: Date;
}
