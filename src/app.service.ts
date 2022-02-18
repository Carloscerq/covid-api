import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  constructor(private readonly axios: HttpService) {}

  async getDataFromCovidApi() {
    const { data } = await lastValueFrom(
      this.axios.get(
        'https://disease.sh/v3/covid-19/countries/us%2C%20br%2C%20cn%2C%20ru',
      ),
    );

    const response = {};
    for (const country of data) {
      response[country.country] = country;
    }

    return response;
  }
}
