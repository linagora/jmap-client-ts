import type { AxiosStatic, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Transport } from './transport';

export class AxiosTransport implements Transport {
  private axios: AxiosStatic;

  constructor(axios: AxiosStatic) {
    this.axios = axios;
  }

  public post<ResponseType>(
    url: string,
    content: any,
    headers: { [headerName: string]: string },
  ): Promise<ResponseType> {
    return new Promise<ResponseType>((resolve, reject) => {
      const options: AxiosRequestConfig = {
        headers,
      };

      this.axios
        .post(url, content, options)
        .then((response: AxiosResponse) => {
          resolve(response.data as ResponseType);
        })
        .catch((response: any) => {
          reject(response);
        });
    });
  }

  get<ResponseType>(url: string, headers: { [headerName: string]: string }): Promise<ResponseType> {
    return new Promise<ResponseType>((resolve, reject) => {
      const options: AxiosRequestConfig = {
        headers,
      };

      this.axios
        .get(url, options)
        .then((response: AxiosResponse) => {
          resolve(response.data as ResponseType);
        })
        .catch((response: any) => {
          reject(response);
        });
    });
  }
}
