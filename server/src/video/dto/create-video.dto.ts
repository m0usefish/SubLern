import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl } from "class-validator"
import { VideoLevel } from "../entities/video.entity"

export class CreateVideoDto {
    @IsString()
    @IsNotEmpty()
    youtubeId: string

    @IsString()
    @IsNotEmpty()
    title: string

    @IsOptional()
    @IsString()
    description?: string

    @IsEnum(VideoLevel)
    level: VideoLevel
}
