import { Controller, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  private readonly logger = new Logger('AppController');

  @Cron(CronExpression.EVERY_MINUTE, {
    name: 'getDataFromCovidApi',
  })
  async getDataFromCovidApi() {
    this.logger.debug('Starting getDataFromCovidApi');

    const data = await this.appService.getDataFromCovidApi();
    this.logger.debug(data);

    this.appService.getDataFromCovidApi();
  }
}
