import { Injectable, UnauthorizedException } from '@nestjs/common'
import { UserService } from 'src/user/user.service'
import * as argon2 from 'argon2'
import { JwtService } from '@nestjs/jwt'
import { IUser } from 'src/types/types'

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
    ) {}

    async validateUser(email: string, password: string) {
        const user = await this.userService.findOne(email)
        if (!user) {
            throw new UnauthorizedException('Схоже, що ви ще не зареєстровані!')
        }
        const passwordIsMatch = await argon2.verify(user.password, password)
        if (passwordIsMatch) {
            return user
        }
        throw new UnauthorizedException('Не правильний пароль!')
    }

    async login(user: IUser) {
        const { id, email, role } = user
        return {
            id,
            email,
            role,
            token: this.jwtService.sign({ id, email, role }),
        }
    }
}
