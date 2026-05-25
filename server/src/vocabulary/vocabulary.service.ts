import { ConflictException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateVocabularyDto } from './dto/create-vocabulary.dto';
import { UpdateVocabularyDto } from './dto/update-vocabulary.dto';
import { VocabularyWord } from './entities/vocabulary-word.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import OpenAI from 'openai';

@Injectable()
export class VocabularyService {
  constructor(
        @InjectRepository(VocabularyWord)
        private vocabularyRepository: Repository<VocabularyWord>,
    ) { }  


  async findAll(userId:number) {
    return this.vocabularyRepository.find({ where: { user: { id: userId } } })
  }
  async add(userId: number, word: string, translation: string, partOfSpeech?: string, article?: string, infinitive?: string){

    const existing = await this.vocabularyRepository.findOne({ where: {user: {id: userId}, word}})
    if (existing) throw new ConflictException('Слово вже є в словнику');

    const newWord = this.vocabularyRepository.create({
            user: { id: userId },
            word,
            translation,
            partOfSpeech,
            article,
            infinitive,
        });

    return this.vocabularyRepository.save(newWord);
  }

  async updateStats(id: number, isCorrect: boolean) {
        const word = await this.vocabularyRepository.findOne({ where: { id } });
        if (word) {
            if (isCorrect) {
                word.correctAttempts = (word.correctAttempts || 0) + 1;
            } else {
                word.incorrectAttempts = (word.incorrectAttempts || 0) + 1;
            }
            await this.vocabularyRepository.save(word);
        }
    }

  async remove(userId: number, id: number) {
    await this.vocabularyRepository.delete({ id, user: { id: userId } });
        return { deleted: true   };
  }

  async translateWord(word: string, contextSentence: string) {
    const apiKey = process.env.OPENAI_API_KEY;

     if (!apiKey) {
            throw new HttpException('OpenAI API key is missing or invalid.', HttpStatus.INTERNAL_SERVER_ERROR);
        }

     const openai = new OpenAI({ apiKey });

     const prompt = `Analyze the German word "${word}" in the following context: "${contextSentence}".
        Provide the following details strictly as a JSON object:
        - "clickedWord": the exact form of the word as it appears in the sentence.
        - "contextualTranslation": the Ukrainian translation of the word specifically as used in this exact context.
        - "lemma": the dictionary base form of the word (e.g., for verbs use the infinitive like 'gehen', for nouns use the singular form without the article like 'Haus', for adjectives use the uninflected form). Do not include the article here.
        - "lemmaTranslation": the general dictionary translation of the lemma in Ukrainian.
        - "partOfSpeech": the part of speech in Ukrainian (e.g., 'іменник', 'дієслово', 'прикметник', 'прислівник', etc.).
        - "article": the definitive article ('der', 'die', or 'das') if it's a noun. Otherwise, return null.
        - "grammaticalForm": a short explanation of the grammatical form of the clicked word (e.g., 'Präsens 3. Person Singular', 'Plural', 'Akkusativ', 'Partizip II', etc.). If it's just the base form, you can say 'Infinitiv'.
        Return ONLY valid JSON with these exact keys. Do not return any other text or markdown formatting.`;

    try {
            const response = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                response_format: { type: 'json_object' }
            });

            const content = response.choices[0].message.content;
            if (!content) {
                throw new Error('No content returned from OpenAI');
            }

            return JSON.parse(content);
        } catch (error: any) {
            console.error('Error translating word with OpenAI:', error.response?.data || error.message || error);
            const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to translate word using OpenAI.';
            throw new HttpException(
                errorMessage,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }

  }
}
