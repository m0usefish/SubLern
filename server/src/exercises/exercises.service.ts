import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import OpenAI from 'openai';
import { ExerciseSet } from './entities/exercise-set.entity';
import { ExerciseResult } from './entities/exercise-result.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VocabularyService } from 'src/vocabulary/vocabulary.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ExercisesService {
    private openai: OpenAI;
    constructor(
        @InjectRepository(ExerciseSet)
        private exerciseSetRepository: Repository<ExerciseSet>,
        @InjectRepository(ExerciseResult)
        private exerciseResultRepository: Repository<ExerciseResult>,
        private vocabularyService: VocabularyService,
        private configService: ConfigService,
    ) {
        this.openai = new OpenAI({
            apiKey: this.configService.get<string>('OPENAI_API_KEY'),
        });
    }

    async generateExercises(userId: number, type: string = 'fill-in') {
        const words = await this.vocabularyService.findAll(userId);
        if (words.length < 4) {
            throw new BadRequestException('Не достатньо слів в словнику для генерації вправ. Додайте як мінімум 4 слова.');
        }

        // score formula: incorrect * 2 - correct. Add slight randomness to avoid repetitive sequences.
        const sortWords = (arr: any[]) => {
            return arr.sort((a, b) => {
                const scoreA = ((a.incorrectAttempts || 0) * 2) - (a.correctAttempts || 0) + (Math.random() * 2);
                const scoreB = ((b.incorrectAttempts || 0) * 2) - (b.correctAttempts || 0) + (Math.random() * 2);
                return scoreB - scoreA; 
            });
        };

        let payload: any = { exercises: [] };

        if (type === 'flashcards') {
            payload.exercises = sortWords([...words]).slice(0, 10).map(w => ({
                type: 'flashcards',
                wordObj: w
            }));
        } else if (type === 'article-trainer') {
            const nouns = words.filter(w => w.article || (w.partOfSpeech && w.partOfSpeech.toLowerCase().includes('іменник')));
            if (nouns.length < 4) {
                throw new BadRequestException('Не достаньо іменників в словнику для тренування артиклів.');
            }
            const prioritizedNouns = sortWords([...nouns]).slice(0, 10);
            payload.exercises = prioritizedNouns.map(w => {
                const correctArticle = w.article ? w.article.toLowerCase() : 'der';
                return {
                    type: 'article-trainer',
                    question: `Оберіть правильний артикль для: ${w.word}`,
                    options: ['der', 'die', 'das'],
                    correctAnswer: correctArticle,
                    wordObj: w
                };
            });
        } else if (type === 'translation') {
            const prioritizedWords = sortWords([...words]).slice(0, 10);
            payload.exercises = prioritizedWords.map(w => {
                const wrongOptions = words
                    .filter(other => other.id !== w.id && other.translation !== w.translation)
                    .sort(() => 0.5 - Math.random())
                    .slice(0, 3)
                    .map(other => other.translation);
                
                while (wrongOptions.length < 3);
                
                const options = [...wrongOptions, w.translation].sort(() => 0.5 - Math.random());
                
                return {
                    type: 'translation',
                    question: `Як перекладається слово: ${w.word}?`,
                    options: options,
                    correctAnswer: w.translation,
                    wordObj: w
                };
            });
        } else {
            const prioritizedWords = sortWords([...words]).slice(0, 10);
            const selected = prioritizedWords.map(w => ({ word: w.word, translation: w.translation }));
            
            const prompt = `
            Create a "fill-in-the-blank" exercise set for German learners based on these words: ${JSON.stringify(selected)}.
            Return a JSON object with a list of "exercises".
            Each exercise MUST have: "type": "fill-in",
            "question" (a German sentence where the EXACT word provided in the list must fit grammatically without conjugating or changing it, and this exact word is replaced with '___'), 
            "correctAnswer" (MUST be the EXACT word from the list, unmodified),
            "sentenceTranslation" (the Ukrainian translation of the generated German sentence).
            Do not change the word forms from the list. The generated German sentence must make grammatical sense when the exact word from the list is inserted.
            Ensure the output is valid JSON. Output ONLY the JSON.
            `;

            try {
                const response = await this.openai.chat.completions.create({
                    model: 'gpt-4o-mini',
                    messages: [{ role: 'system', content: 'You are a German teacher.' }, { role: 'user', content: prompt }],
                    response_format: { type: 'json_object' }
                });

                const content = response.choices[0].message.content || '{"exercises":[]}';
                payload = JSON.parse(content);
          
                if (payload.exercises && Array.isArray(payload.exercises)) {
                    payload.exercises = payload.exercises.map((ex: any, idx: number) => ({
                        ...ex,
                        wordObj: prioritizedWords[idx]
                    }));
                }
            } catch (error) {
                console.error('OpenAI Error:', error);
                throw new BadRequestException('Failed to generate exercises with OpenAI');
            }
        }

        const exerciseSet = this.exerciseSetRepository.create({
            userId: userId,
            payloadJson: payload,
        });

        return this.exerciseSetRepository.save(exerciseSet);
    }

    async submitResult(userId: number, setId: number, score: number, answersFn: any) {
        const set = await this.exerciseSetRepository.findOne({ where: { id: setId }, relations: ['user'] });
        if (!set) throw new BadRequestException('Set not found');
        if (set.userId !== userId) throw new BadRequestException('Access denied to this set');
        
        // Update stats for each word
        const exercises = set.payloadJson?.exercises || [];
        for (let i = 0; i < exercises.length; i++) {
            const ex = exercises[i];
            if (ex.wordObj && ex.wordObj.id) {
                let isCorrect = false;
                if (ex.type === 'flashcards') {
                    isCorrect = answersFn[i] === 'remembered';
                } else {
                    isCorrect = answersFn[i]?.toLowerCase().trim() === ex.correctAnswer?.toLowerCase().trim();
                }
                await this.vocabularyService.updateStats(ex.wordObj.id, isCorrect);
            }
        }

        const result = this.exerciseResultRepository.create({
            exerciseSet: set,
            score,
            answersJson: answersFn
        });
        return this.exerciseResultRepository.save(result);
    }
    
    async getHistory(userId: number) {
    
        return this.exerciseResultRepository.find({
            where: { exerciseSet: { user: { id: userId } } },
            relations: ['exerciseSet'],
            order: { submittedAt: 'DESC' }
        });
    }

}
