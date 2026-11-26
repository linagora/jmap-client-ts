import { IncomingMessage, Server, ServerResponse } from 'http';
import { AddressInfo } from 'net';
import { Client } from '../src';
import { FetchTransport } from '../src/utils/fetch-transport';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createServer } = require('http');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const nodeFetch = require('node-fetch');

describe('binary uploads', () => {
  let server: Server | undefined;

  afterEach(async () => {
    if (server) await new Promise<void>(resolve => server?.close(() => resolve()));
  });

  it('sends the exact upload bytes and keeps JMAP requests JSON encoded', async () => {
    const requests: Array<{ url: string; contentType?: string; body: Buffer }> = [];
    const activeServer: Server = createServer(
      (request: IncomingMessage, response: ServerResponse) => {
        const chunks: Buffer[] = [];
        request.on('data', (chunk: Buffer) => chunks.push(chunk));
        request.on('end', () => {
          requests.push({
            url: request.url || '',
            contentType: request.headers['content-type'],
            body: Buffer.concat(chunks),
          });
          response.setHeader('Content-Type', 'application/json');
          if (request.url === '/session') {
            const origin = `http://127.0.0.1:${(activeServer.address() as AddressInfo).port}`;
            response.end(
              JSON.stringify({
                capabilities: { 'urn:ietf:params:jmap:core': {}, 'urn:ietf:params:jmap:mail': {} },
                accounts: { account: {} },
                primaryAccounts: { 'urn:ietf:params:jmap:mail': 'account' },
                apiUrl: `${origin}/api`,
                uploadUrl: `${origin}/upload/{accountId}`,
              }),
            );
          } else if (request.url === '/upload/account') {
            response.end(
              JSON.stringify({
                accountId: 'account',
                blobId: 'blob',
                type: 'application/octet-stream',
                size: requests[requests.length - 1].body.length,
              }),
            );
          } else {
            const call = JSON.parse(requests[requests.length - 1].body.toString()).methodCalls[0];
            response.end(
              JSON.stringify({
                methodResponses: [
                  [
                    'Mailbox/get',
                    { accountId: 'account', state: '1', list: [], notFound: [] },
                    call[2],
                  ],
                ],
              }),
            );
          }
        });
      },
    );
    server = activeServer;
    await new Promise<void>(resolve => activeServer.listen(0, '127.0.0.1', resolve));
    const origin = `http://127.0.0.1:${(activeServer.address() as AddressInfo).port}`;
    const client = new Client({
      sessionUrl: `${origin}/session`,
      accessToken: 'token',
      transport: new FetchTransport(nodeFetch),
    });
    await client.fetchSession();

    const bytes = Uint8Array.from([0, 255, 128, 13, 10, 65]);
    await expect(client.upload(bytes.buffer)).resolves.toMatchObject({ blobId: 'blob', size: 6 });
    await client.mailbox_get({ accountId: null, ids: null });

    expect(Array.from(requests[1].body)).toEqual(Array.from(bytes));
    expect(requests[1].contentType).toBe('application/octet-stream');
    expect(JSON.parse(requests[2].body.toString())).toMatchObject({
      methodCalls: [['Mailbox/get', { accountId: 'account', ids: null }, '0']],
    });
  });
});
