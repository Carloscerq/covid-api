import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { writeFileSync } from 'fs';
import { Country } from './dto/country.dto';
import { CountryList } from './dto/country-list.dto';

@Injectable()
export class AppService {
  constructor(private readonly axios: HttpService) {}

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

  createFiles(data: Country[]): string {
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

  async sendFilesToCloud(fileName: string): Promise<void> {
  }
}
