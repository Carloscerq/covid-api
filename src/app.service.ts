import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { createReadStream, writeFileSync, unlink } from 'fs';
import { Country } from './dto/country.dto';
import { CountryList } from './dto/country-list.dto';
import { config as dotenvConfig } from 'dotenv';
import { AxiosResponse } from 'axios';
import FormData from 'form-data';
dotenvConfig();

@Injectable()
export class AppService {
  constructor(private readonly axios: HttpService) {}
  private readonly logger = new Logger('AppService');

  async getDataFromCovidApi(): Promise<CountryList> {
    const { data } = await lastValueFrom(
      this.axios.get(
        'https://disease.sh/v3/covid-19/countries/us%2C%20br%2C%20cn%2C%20ru',
      ),
    );

    const response = {};
    data.forEach((country: Country) => {
      response[country.country] = country;
    });

    return <CountryList>response;
  }

  createFile(data: Country[]): string {
    let fileName = '';
    const text: string[] = [
      'País, Casos hoje, Total de morte hoje, Data, Ativos, Em estado critíco',
    ];

    data.forEach((country) => {
      text.push(
        `${country.country}, ${country.todayCases}, ${country.todayDeaths}, ${country.updated}, ${country.active}, ${country.critical}`,
      );
      fileName += `${country.country}_${country.updated}`;
    });

    fileName = fileName + '.csv';

    writeFileSync(fileName, text.join('\n'));
    return fileName;
  }

  async sendFileToCloud(fileName: string, dir: string): Promise<AxiosResponse> {
    const formData = new FormData();
    const file = createReadStream(fileName);

    formData.append('file', file);
    formData.append('token', process.env.CLOUD_TOKEN);
    formData.append('folderId', dir);

    return lastValueFrom(
      this.axios.post('https://store3.gofile.io/uploadFile', formData, {
        headers: formData.getHeaders(),
      }),
    );
  }

  deleteFile(fileName: string): void {
    unlink(fileName, (err) => {
      if (err) {
        this.logger.error(err);
      }
    });
  }
}
