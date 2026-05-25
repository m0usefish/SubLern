import { Injectable } from '@nestjs/common';
import { CreateProgressDto } from './dto/create-progress.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { VideoProgress } from './entities/progress.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ProgressService {

    constructor(
        @InjectRepository(VideoProgress)
        private progressRepository: Repository<VideoProgress>,
    ) { }

  async findAll(userId: number) {
        return this.progressRepository.find({
            where: { user: { id: userId } },
            relations: ['video'],
        });
    }

    async updateProgress(userId: number, videoId: number, completed: boolean) {
        let progress = await this.progressRepository.findOne({ where: { user: { id: userId }, video: { id: videoId } } });
        if (!progress) {
            progress = this.progressRepository.create({
                user: { id: userId },
                video: { id: videoId },
                completed,
            });
        } else {
            if (completed) progress.completed = true;
        }
        return this.progressRepository.save(progress);
    }
}
