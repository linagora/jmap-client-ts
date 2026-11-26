import { FetchTransport } from './fetch-transport';

describe('FetchTransport', () => {
  it('accepts a successful non-200 response', async () => {
    const fetch = jest.fn().mockResolvedValue({
      status: 201,
      json: () => Promise.resolve({ blobId: 'blob' }),
    });
    const transport = new FetchTransport(fetch);

    await expect(transport.post('/upload', new ArrayBuffer(0), {})).resolves.toEqual({
      blobId: 'blob',
    });
  });

  it('continues to reject unsuccessful responses', async () => {
    const fetch = jest.fn().mockResolvedValue({ status: 400, json: jest.fn() });
    const transport = new FetchTransport(fetch);

    await expect(transport.post('/upload', new ArrayBuffer(0), {})).rejects.toThrow(
      'Request failed, got http status code 400',
    );
  });
});
