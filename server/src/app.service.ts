import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
  getVideos(): string {
    return 'there will be my future videos'
  }
}
