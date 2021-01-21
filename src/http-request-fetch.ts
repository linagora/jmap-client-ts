import fetch, { Headers } from 'node-fetch';
import { HttpRequest } from './http-request';

export class HttpRequestFetch extends HttpRequest {
  // constructor() { }

  public post<ResponseType>(url: string, content: any, headers: { [headerName: string]: string }) {
    return this.request<ResponseType>({
      url,
      method: 'POST',
      body: content,
      headers,
    });
  }

  public get<ResponseType>(url: string, headers: { [headerName: string]: string }) {
    return this.request<ResponseType>({ url, method: 'GET', headers });
  }

  public request<ResponseType>({
    url,
    method,
    body,
    headers,
  }: {
    url: string;
    method: 'POST' | 'GET';
    body?: any;
    headers: { [headerName: string]: string };
  }): Promise<ResponseType> {
    return fetch(url, {
      method,
      body: JSON.stringify(body),
      headers: new Headers(headers),
    }).then(response => {
      if (response.status !== 200) {
        throw new Error(`Request failed, got http status code ${response.status}`);
      }
      return response.json();
    });
  }
}
