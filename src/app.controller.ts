import { Controller, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { config as dotenvConfig } from 'dotenv';
dotenvConfig();

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  private readonly logger = new Logger('AppController');

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'getDataFromCovidApi',
  })
  async getDataFromCovidApi() {
    this.logger.log('Starting getDataFromCovidApi.');

    const { USA, Brazil, China, Russia } =
      await this.appService.getDataFromCovidApi();

    const fileUsaBr = this.appService.createFile([USA, Brazil]);
    const fileCnRu = this.appService.createFile([China, Russia]);

    this.logger.log('Finish writing CSV files.');

    await this.appService.sendFileToCloud(fileUsaBr, process.env.USA_BR_BUCKET);
    await this.appService.sendFileToCloud(fileCnRu, process.env.CN_RU_BUCKET);

    this.logger.log('Finish sending files to cloud.');

    this.appService.deleteFile(fileUsaBr);
    this.appService.deleteFile(fileCnRu);

    this.logger.log('Finish deleting files.');
  }
}
