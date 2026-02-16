import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * Health check endpoint para keep-alive (Vercel Cron)
   * Responde em: /api/ping (com global prefix)
   */
  @Get('ping')
  getPing() {
    return this.appService.getPing();
  }
}
