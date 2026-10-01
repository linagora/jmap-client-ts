import { XmlHttpRequestTransport } from './xml-http-request-transport';

describe('XmlHttpRequestTransport', () => {
  it('preserves binary request bodies and accepts successful non-200 responses', async () => {
    const sent: any[] = [];
    const request: any = {
      status: 201,
      responseText: JSON.stringify({ blobId: 'blob' }),
      open: jest.fn(),
      setRequestHeader: jest.fn(),
      send(body: any) {
        sent.push(body);
        this.onload();
      },
    };
    const transport = new XmlHttpRequestTransport(() => request);
    const bytes = Uint8Array.from([0, 255, 128]);

    await expect(transport.post('/upload', bytes.buffer, {})).resolves.toEqual({ blobId: 'blob' });
    expect(sent[0]).toBe(bytes.buffer);
  });

  it('continues to JSON encode object request bodies', async () => {
    const sent: any[] = [];
    const request: any = {
      status: 200,
      responseText: '{}',
      open: jest.fn(),
      setRequestHeader: jest.fn(),
      send(body: any) {
        sent.push(body);
        this.onload();
      },
    };
    const transport = new XmlHttpRequestTransport(() => request);

    await transport.post('/jmap', { methodCalls: [] }, {});
    expect(sent).toEqual([JSON.stringify({ methodCalls: [] })]);
  });
});
