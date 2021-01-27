export class HttpRequest {
  // constructor() { }

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
    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();

      request.open(method, url);

      for (const [name, value] of Object.entries(headers)) {
        request.setRequestHeader(name, value);
      }

      request.onload = () => {
        const status = request.status;
        if (status === 0 || (status >= 200 && status < 300)) {
          resolve(JSON.parse(request.responseText));
        } else {
          reject(request.responseText);
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
