import { BadRequestException, Injectable } from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from './entities/user.entity'
import { Repository } from 'typeorm'
import * as argon2 from 'argon2'
import { JwtService } from '@nestjs/jwt'
import { VocabularyWord } from 'src/vocabulary/entities/vocabulary-word.entity'
import { VideoProgress } from 'src/progress/entities/progress.entity'

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
        @InjectRepository(VocabularyWord)
        private dictionaryRepository: Repository<VocabularyWord>,
        @InjectRepository(VideoProgress)
        private progressRepository: Repository<VideoProgress>,
    ) {}

    async create(createUserDto: CreateUserDto) {
        const existingUser = await this.userRepository.findOne({
            where: {
                email: createUserDto.email,
            },
        })
        if (existingUser)
            throw new BadRequestException('This email already exist.')

        const user = await this.userRepository.save({
            email: createUserDto.email,
            password: await argon2.hash(createUserDto.password),
        })

        const token = this.jwtService.sign({ email: createUserDto.email })
        return { user, token }
    }

    async findOne(email: string) {
        return await this.userRepository.findOne({
            where: {
                email,
            },
        })
    }
    async updateStreak(userId: number): Promise<User | null> {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user) return null;

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (user.lastActiveAt) {
            const lastActiveDate = new Date(user.lastActiveAt);
            const lastDate = new Date(lastActiveDate.getFullYear(), lastActiveDate.getMonth(), lastActiveDate.getDate());

            const diffMs = today.getTime() - lastDate.getTime();
            const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
            
                user.streak = (user.streak || 0) + 1;
            } else if (diffDays > 1) {
              
                user.streak = 1;
            }
            
        } else {
           
            user.streak = 1;
        }

        user.lastActiveAt = now;
        return this.userRepository.save(user);
    }

    async getProfileStats(userId: number) {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user) return null;

        const wordCount = await this.dictionaryRepository.count({
            where: { user: { id: userId } },
        });

        const watchedCount = await this.progressRepository.count({
            where: { user: { id: userId } },
        });

        return {
            email: user.email,
            role: user.role,
            streak: user.streak || 0,
            lastActiveAt: user.lastActiveAt,
            createdAt: user.createdAt,
            wordCount,
            watchedVideos: watchedCount,
        };
    }

    async findAll() {
        const users = await this.userRepository.find({
            order: { createdAt: 'DESC' }
        });
        
        return Promise.all(users.map(async (user) => {
            const wordCount = await this.dictionaryRepository.count({
                where: { user: { id: user.id } },
            });

            const watchedCount = await this.progressRepository.count({
                where: { user: { id: user.id } },
            });

            return {
                id: user.id,
                email: user.email,
                role: user.role,
                streak: user.streak,
                lastActiveAt: user.lastActiveAt,
                createdAt: user.createdAt,
                wordCount,
                watchedVideos: watchedCount,
            };
        }));
    }

    remove(id: number) {
        return `This action removes a #${id} user`
    }
}
