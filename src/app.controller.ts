import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  health() {
    return { status: 'ok' };
  }

  @Get('api/health')
  apiHealth() {
    return this.health();
  }

  @Get('api/heath')
  apiHeath() {
    return this.health();
  }
}
