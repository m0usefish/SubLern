import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Query,
} from '@nestjs/common'
import { VideoService } from './video.service'
import { CreateVideoDto } from './dto/create-video.dto'
import { UpdateVideoDto } from './dto/update-video.dto'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { VideoLevel } from './entities/video.entity'

@Controller('video')
export class VideoController {
    constructor(private readonly videoService: VideoService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    create(@Body() createVideoDto: CreateVideoDto) {
        return this.videoService.create(createVideoDto)
    }

    @Get()
    findAll(@Query('level') level?: VideoLevel) {
        return this.videoService.findAll()
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.videoService.findOne(+id)
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    update(@Param('id') id: string, @Body() updateVideoDto: UpdateVideoDto) {
        return this.videoService.update(+id, updateVideoDto)
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    remove(@Param('id') id: string) {
        return this.videoService.remove(+id)
    }
}
