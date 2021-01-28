import { Transport } from './transport';

export class FetchTransport implements Transport {
  private fetch: (...params: any[]) => Promise<Response>;

  constructor(fetch: any) {
    this.fetch = fetch;
  }

  public post<ResponseType>(
    url: string,
    content: any,
    headers: { [headerName: string]: string },
  ): Promise<ResponseType> {
    return this.request<ResponseType>({
      url,
      method: 'POST',
      body: content,
      headers,
    });
  }

  public get<ResponseType>(
    url: string,
    headers: { [headerName: string]: string },
  ): Promise<ResponseType> {
    return this.request<ResponseType>({ url, method: 'GET', headers });
  }

  private request<ResponseType>({
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
    return this.fetch(url, {
      method,
      body: JSON.stringify(body),
      headers: headers,
    }).then(response => {
      if (response.status !== 200) {
        throw new Error(`Request failed, got http status code ${response.status}`);
      }
      return response.json();
    });
  }
}
