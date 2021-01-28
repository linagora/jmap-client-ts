/**
 * Transport interface should be used for this project only.
 *
 * `get` and `post` methods should return a Promise:
 * - fullfilled with the response Json body as JavaScript object when the response status code is 200
 * - rejected with an Error otherwise
 */
export interface Transport {
  get<ResponseType>(url: string, headers: { [headerName: string]: string }): Promise<ResponseType>;

  post<ResponseType>(
    url: string,
    content: any,
    headers: { [headerName: string]: string },
  ): Promise<ResponseType>;
}
