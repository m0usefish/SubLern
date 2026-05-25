import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common'
import { UserService } from './user.service'
import { CreateUserDto } from './dto/create-user.dto'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { AdminGuard } from 'src/auth/guards/admin.guard'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id)
  }

   @Get('profile')
    @UseGuards(JwtAuthGuard)
    async getProfile(@Request() req) {
        return this.userService.getProfileStats(req.user.id);
    }
     @Get('all')
    @UseGuards(JwtAuthGuard, AdminGuard)
    async getAllUsers() {
        return this.userService.findAll();
    }

    @Post('ping')
    @UseGuards(JwtAuthGuard)
    async ping(@Request() req) {
        // Called on app load to update streak
        return this.userService.updateStreak(req.user.id);
    }
}
