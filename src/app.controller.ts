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
    this.logger.log('Starting getDataFromCovidApi.');

    const { USA, Brazil, China, Russia } =
      await this.appService.getDataFromCovidApi();

    const fileUsaBr = this.appService.createFiles([USA, Brazil]);
    const fileCnRu = this.appService.createFiles([China, Russia]);

    this.logger.log('Finish writing CSV files.');

    this.appService.sendFilesToCloud(fileUsaBr);
    this.appService.sendFilesToCloud(fileCnRu);
  }
}
