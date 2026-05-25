import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards } from '@nestjs/common';
import { ExercisesService } from './exercises.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';


@Controller('exercises')
@UseGuards(JwtAuthGuard)
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Post('generate')
  generate(@Request() req, @Body('type') type: string) {
    
    return this.exercisesService.generateExercises(req.user.id, type);
  }

  @Post('submit/:setId')
    submit(@Request() req, @Param('setId') setId: string, @Body() body: { score: number; answers: any }) {
        return this.exercisesService.submitResult(req.user.id, Number(setId), body.score, body.answers);
    }

    @Get('history')
    getHistory(@Request() req) {
        return this.exercisesService.getHistory(req.user.id);
    }
}
