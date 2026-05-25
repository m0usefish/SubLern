import { Controller, UploadedFile, Post, Body, UseInterceptors, UseGuards, Get, Query } from '@nestjs/common';
import { SubtitlesService } from './subtitles.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Multer } from 'multer';

@Controller('subtitles')
export class SubtitlesController {
  constructor(private readonly subtitlesService: SubtitlesService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
   async uploadSubtitle(
        @Body('videoId') videoId: number,
        @UploadedFile() file: Express.Multer.File
    ) {
        return this.subtitlesService.uploadSubtitle(videoId, file.buffer);
    }

    @Get('search')
    @UseGuards(JwtAuthGuard)
    async search(@Query('query') query: string) {
        if (!query) return { matches: [], translationInfo: null };
        return this.subtitlesService.search(query);
    }


}
