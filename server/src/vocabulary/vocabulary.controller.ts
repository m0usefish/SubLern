import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { VocabularyService } from './vocabulary.service';
import { CreateVocabularyDto } from './dto/create-vocabulary.dto';
import { UpdateVocabularyDto } from './dto/update-vocabulary.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('vocabulary')
@UseGuards(JwtAuthGuard)
export class VocabularyController {
  constructor(private readonly vocabularyService: VocabularyService) {}


  @Get()
  findAll(@Request() req) {
    return this.vocabularyService.findAll(req.user.id);
  }

  @Post()
    add(@Request() req, @Body() body: { word: string; translation: string; partOfSpeech?: string; article: string; infinitive: string }) {

        return this.vocabularyService.add(req.user.id, body.word, body.translation, body.partOfSpeech, body.article, body.infinitive);
    }


  @Post('translate')
    translate(@Body() body: { word: string; contextSentence: string }) {
        return this.vocabularyService.translateWord(body.word, body.contextSentence);
    }

  @Delete(':id')
  remove(@Request() req, @Param ('id') id: number) {
        return this.vocabularyService.remove(req.user.id, id);
    }
}
