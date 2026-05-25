import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { CreateProgressDto } from './dto/create-progress.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('progress')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

   @Get()
    findAll(@Request() req) {
        // return this.progressService.findAll(req.user.userId);
         return this.progressService.findAll(req.user.id);
    }

    @Post()
   update(@Request() req, @Body() body: { videoId: number; completed: boolean }) {
        return this.progressService.updateProgress(req.user.id, body.videoId, body.completed);
    }
}
