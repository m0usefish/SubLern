import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository, Raw } from 'typeorm'

import { Video } from 'src/video/entities/video.entity'
import { SubtitleCue } from './entities/subtitle-cue.entity'
import { VocabularyService } from 'src/vocabulary/vocabulary.service'

@Injectable()
export class SubtitlesService {
    constructor(

        @InjectRepository(Video)
        private videosRepository: Repository<Video>,
        @InjectRepository(SubtitleCue)
        private cuesRepository: Repository<SubtitleCue>,
        private vocabularyService: VocabularyService,
        private dataSource: DataSource,
    ) {}

    async search(query: string) {

        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        const matches = await this.cuesRepository.find({
            where: { 
                text: Raw((alias) => `${alias} ~* :regex`, { regex: `\\y${escapedQuery}\\y` }) 
            },
            relations: ['video'],
            take: 50, // Limit results
        });

        let translationInfo = null;
        try {
            translationInfo = await this.vocabularyService.translateWord(query, '');
        } catch (e) {
            console.error('Translation failed during search', e);
        }

        return {
            query,
            translationInfo,
            matches: matches.map(m => ({
                id: m.id,
                text: m.text,
                startMs: m.startMs,
                endMs: m.endMs,
                video: {
                    id: m.video.id,
                    title: m.video.title,
                    youtubeId: m.video.youtubeId
                }
            }))
        };
    }

    async uploadSubtitle(videoId: number, fileBuffer: Buffer) {
        const video = await this.videosRepository.findOneBy({ id: videoId })
        if (!video) throw new NotFoundException('Video not found')

        const srtText = fileBuffer.toString('utf-8')
        const cues = this.parseSrt(srtText)

    
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()

        try {
         
            const cueEntities = cues.map((cue) => {
                const entity = new SubtitleCue()
                entity.video = video
                entity.startMs = cue.startMs
                entity.endMs = cue.endMs
                entity.text = cue.text
                return entity
            })
            await queryRunner.manager.save(cueEntities)

            await queryRunner.commitTransaction()
            return true
        } catch (err) {
            await queryRunner.rollbackTransaction()
            throw err
        } finally {
            await queryRunner.release()
        }
    }

    private parseSrt(srtData: string) {
         
        const cues: { startMs: number; endMs: number; text: string }[] = []
        const normalizeTime = (timeStr) => {
            const [h, m, s, ms] = timeStr.split(/[:,]/).map(Number)
            return h * 3600000 + m * 60000 + s * 1000 + ms
        }

        const blocks = srtData
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .split('\n\n')

        for (const block of blocks) {
            if (!block.trim()) continue
            const lines = block.split('\n')
            if (lines.length < 3) continue 

            const timeLine = lines[1]
            const timeMatch = timeLine.match(
                /(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/,
            )
            if (!timeMatch) continue

            const startMs = normalizeTime(timeMatch[1])
            const endMs = normalizeTime(timeMatch[2])
            const text = lines.slice(2).join('\n').trim()

            cues.push({ startMs, endMs, text })
        }
        return cues
    }
}
