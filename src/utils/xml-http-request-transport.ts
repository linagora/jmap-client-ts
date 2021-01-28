import { Transport } from './transport';

export class XmlHttpRequestTransport implements Transport {
  private xmlHttpRequestConstructor: () => XMLHttpRequest;

  constructor(xmlHttpRequestConstructor: () => XMLHttpRequest) {
    this.xmlHttpRequestConstructor = xmlHttpRequestConstructor;
  }

  post<ResponseType>(
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

  get<ResponseType>(url: string, headers: { [headerName: string]: string }): Promise<ResponseType> {
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
    return new Promise((resolve, reject) => {
      const request = this.xmlHttpRequestConstructor();

      request.open(method, url);

      for (const [name, value] of Object.entries(headers)) {
        request.setRequestHeader(name, value);
      }

      request.onload = () => {
        const status = request.status;
        if (status === 200) {
          resolve(JSON.parse(request.responseText));
        } else {
          reject(new Error(`Request failed, got http status code ${status}`));
        }
      };

      request.onerror = event => {
        reject(event);
      };

      if (body) {
        request.send(JSON.stringify(body));
      } else {
        request.send();
      }
    });
  }
}
