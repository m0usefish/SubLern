import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { IUser } from 'src/types/types'
import { UserService } from 'src/user/user.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly configService: ConfigService,
        private readonly userService: UserService,) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_SECRET')!,
        })
    }

    async validate(payload: IUser) {
        let role = payload.role
        let id = payload.id
        if (!role || !id) {
            const user = await this.userService.findOne(payload.email)
            if (user) {
                role = user.role
                id = user.id
            }
        }
        return { id, email: payload.email, role }
    }
}
