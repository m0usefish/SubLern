import { Module } from '@nestjs/common';
import { VocabularyService } from './vocabulary.service';
import { VocabularyController } from './vocabulary.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VocabularyWord } from './entities/vocabulary-word.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VocabularyWord])],
  controllers: [VocabularyController],
  providers: [VocabularyService],
  exports: [VocabularyService]
})
export class VocabularyModule {}
