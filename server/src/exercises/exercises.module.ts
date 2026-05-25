import { Module } from '@nestjs/common';
import { ExercisesService } from './exercises.service';
import { ExercisesController } from './exercises.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExerciseSet } from './entities/exercise-set.entity';
import { ExerciseResult } from './entities/exercise-result.entity';
import { VocabularyModule } from 'src/vocabulary/vocabulary.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([ExerciseSet, ExerciseResult]),
        VocabularyModule
    ],
  controllers: [ExercisesController],
  providers: [ExercisesService],
})
export class ExercisesModule {}
