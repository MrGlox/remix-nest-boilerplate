import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class PaymentService {
  private readonly API_URL = 'https://api.lemonsqueezy.com/v1';

  constructor(private httpService: HttpService) {}

  private getHeaders() {
    return {
      Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
      'Content-Type': 'application/json',
    };
  }

  //   async getPaymentStatus(paymentId: string): Promise<AxiosResponse> {
  //     try {
  //       const response = await lastValueFrom(
  //         this.httpService.get(`http://payment-service/payment/${paymentId}`),
  //       );

  //       return response;
  //     } catch (error) {
  //       throw new HttpException(
  //         {
  //           status: error.response.status,
  //           error: error.response.statusText,
  //         },
  //         error.response.status,
  //       );
  //     }
  //   }

  async getProducts(): Promise<AxiosResponse> {
    try {
      const response = await lastValueFrom(
        this.httpService.get(`${this.API_URL}/products`, {
          headers: this.getHeaders(),
        }),
      );

      return response.data;
    } catch (error: any) {
      throw new HttpException(error.response.data, error.response.status);
    }
  }
}
