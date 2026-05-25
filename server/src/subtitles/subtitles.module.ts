import { Module } from '@nestjs/common'
import { SubtitlesService } from './subtitles.service'
import { SubtitlesController } from './subtitles.controller'
import { TypeOrmModule } from '@nestjs/typeorm'

import { SubtitleCue } from './entities/subtitle-cue.entity'
import { VocabularyModule } from 'src/vocabulary/vocabulary.module'
import { Video } from 'src/video/entities/video.entity'

@Module({
    imports: [
        TypeOrmModule.forFeature([SubtitleCue, Video]),
        VocabularyModule,
    ],
    controllers: [SubtitlesController],
    providers: [SubtitlesService],
    exports: [SubtitlesService],
})
export class SubtitlesModule {}
