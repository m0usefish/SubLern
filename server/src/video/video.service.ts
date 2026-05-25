import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common'
import { CreateVideoDto } from './dto/create-video.dto'
import { UpdateVideoDto } from './dto/update-video.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Video, VideoLevel } from './entities/video.entity'
import { Repository } from 'typeorm'

@Injectable()
export class VideoService {
    constructor(
        @InjectRepository(Video)
        private readonly videosRepository: Repository<Video>,
    ) {}

    async create(createVideoDto: CreateVideoDto) {
        const existingVideo = await this.videosRepository.findBy({
            youtubeId: createVideoDto.youtubeId,
        })

        if (existingVideo.length) {
            throw new BadRequestException('This video already exists')
        }

        const video = this.videosRepository.create(createVideoDto)
        return this.videosRepository.save(video)
    }

    async findAll(level?: VideoLevel) {
        if (level) {
            return this.videosRepository.find({
                where: { level },
                order: { createdAt: 'DESC' },
            })
        }
        return this.videosRepository.find({ order: { createdAt: 'DESC' } })
    }

    async findOne(id: number) {
        const video = await this.videosRepository.findOne({
            where: { id },
            relations: ['cues'],
        })
        if (!video) throw new NotFoundException('Video not found');
        if (video.cues) {
            video.cues.sort((a, b) => a.startMs - b.startMs);
        }

        return video
    }

    async update(id: number, updateVideoDto: UpdateVideoDto) {
        const video = await this.videosRepository.findOne({
            where: { id },
        })

        if (!video) throw new NotFoundException('Video not found!')

        return await this.videosRepository.update(id, updateVideoDto)
    }

    async remove(id: number) {
        const video = await this.videosRepository.findOne({
            where: { id },
        })
        if (!video) throw new NotFoundException('Video not found!')
        return await this.videosRepository.delete(id)
    }
}
