import fetch from 'node-fetch';
import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { HttpRequestFetch } from '../src/http-request-fetch';
import { Client } from '../src/index';

describe('jmap-client-ts', () => {
  const DEFAULT_TIMEOUT = 60000;
  const JMAP_PORT = 80;
  const WEBADMIN_PORT = 8000;
  const PASSWORD = 'password';

  let webadminUrl: string;
  let sessionUrl: string;
  let overriddenApiUrl: string;
  let currentUserNumber = 0;
  let currentUser: string;
  let container: StartedTestContainer;
  let client: Client;

  beforeAll(async () => {
    container = await new GenericContainer('linagora/james-memory', 'branch-master')
      .withExposedPorts(JMAP_PORT, WEBADMIN_PORT)
      .start();

    webadminUrl = `http://${container.getHost()}:${container.getMappedPort(WEBADMIN_PORT)}`;
    sessionUrl = `http://${container.getHost()}:${container.getMappedPort(JMAP_PORT)}/jmap/session`;
    overriddenApiUrl = `http://${container.getHost()}:${container.getMappedPort(JMAP_PORT)}/jmap`;
  }, DEFAULT_TIMEOUT);

  beforeEach(async () => {
    currentUser = `user${++currentUserNumber}@localhost`;
    const response = await fetch(`${webadminUrl}/users/${currentUser}`, {
      method: 'PUT',
      body: `{ "password": "${PASSWORD}" }`,
    });

    if (response.status !== 204) {
      throw new Error('Failed to create user');
    }

    client = new Client({
      sessionUrl,
      accessToken: '',
      httpHeaders: generateHeaders(currentUser, PASSWORD),
      overriddenApiUrl,
      httpRequest: new HttpRequestFetch(),
    });

    await client.fetchSession();
  });

  afterAll(async () => {
    await container.stop();
  });

  it('should have mailbox_get working', async () => {
    const response = await client.mailbox_get({
      accountId: client.getAccountIds()[0],
      ids: null,
    });

    expect(response.accountId).toBeDefined();
  });

  it('should have email_query working', async () => {
    const response = await client.email_query({
      accountId: client.getAccountIds()[0],
    });

    expect(response.accountId).toBeDefined();
  });

  it('should have email_get working', async () => {
    const emailQueryResponse = await client.email_query({
      accountId: client.getAccountIds()[0],
    });

    const emailGetResponse = await client.email_get({
      accountId: client.getAccountIds()[0],
      ids: emailQueryResponse.ids,
    });

    expect(emailGetResponse.accountId).toBeDefined();
  });

  it('should have email set working', async () => {
    const getMailboxesResponse = await client.mailbox_get({
      accountId: client.getAccountIds()[0],
      ids: null,
    });

    const draftMailbox = <string>(
      getMailboxesResponse.list.find(mailbox => mailbox.name.toLowerCase() === 'drafts')?.id
    );

    const emailSetResponse = await client.email_set({
      accountId: client.getAccountIds()[0],
      create: {
        emailCreated: {
          mailboxIds: {
            [draftMailbox]: true,
          },
          keywords: {
            $draft: true,
          },
          from: [],
          to: [],
          subject: 'subject',
          attachments: null,
          textBody: null,
          htmlBody: null,
          bodyValues: null,
        },
      },
    });

    expect(emailSetResponse.created?.emailCreated).toBeDefined();
  });

  function generateHeaders(username: string, password: string) {
    return {
      Authorization: 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64'),
    };
  }
});
