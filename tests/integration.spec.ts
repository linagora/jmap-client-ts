import fetch from 'node-fetch';
import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { Client } from '../src/index';
import { AxiosTransport } from '../src/utils/axios-transport';
import axios from 'axios';
import { IEmailChangesResponse, IMailboxChangesResponse, IError } from '../src/types';

describe('jmap-client-ts', () => {
  const DEFAULT_TIMEOUT = 60000;
  const JMAP_PORT = 80;
  const WEBADMIN_PORT = 8000;
  const PASSWORD = 'password';

  let webadminUrl: string;
  let sessionUrl: string;
  let currentUserNumber = 0;
  let currentUser: string;
  let container: StartedTestContainer;
  let client: Client;

  beforeAll(async () => {
    container = await new GenericContainer('apache/james:memory-3.7.0')
      .withExposedPorts(JMAP_PORT, WEBADMIN_PORT)
      .withCopyFileToContainer('./tests/jmap.properties', '/root/conf/jmap.properties')
      .withCopyFileToContainer('./tests/keystore', '/root/conf/keystore')
      .start();

    webadminUrl = `http://${container.getHost()}:${container.getMappedPort(WEBADMIN_PORT)}`;
    sessionUrl = `http://${container.getHost()}:${container.getMappedPort(JMAP_PORT)}/jmap/session`;
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
      transport: new AxiosTransport(axios),
    });

    await client.fetchSession({
      'X-JMAP-PREFIX': `http://${container.getHost()}:${container.getMappedPort(JMAP_PORT)}`,
      'X-JMAP-WEBSOCKET-PREFIX': `http://${container.getHost()}:${container.getMappedPort(
        JMAP_PORT,
      )}`,
    });
  });

  afterAll(async () => {
    await container.stop();
  });

  it('should get error correctly', async () => {
    let error: IError | null = null;
    try {
      await client.mailbox_get({
        accountId: 'unknown-account-id',
        ids: null,
      });
    } catch (e) {
      error = e as IError;
    }

    expect(error && error.type).toEqual('accountNotFound');
  });

  it('should have mailbox_get working', async () => {
    const response = await client.mailbox_get({
      accountId: client.getAccountIds()[0],
      ids: null,
    });

    expect(response.accountId).toBeDefined();
  });

  it('should have mailbox_changes working', async () => {
    const getResponse = await client.mailbox_get({
      accountId: client.getAccountIds()[0],
      ids: null,
    });

    const changesResponse = await client.mailbox_changes({
      accountId: client.getAccountIds()[0],
      sinceState: getResponse.state,
    });

    expect(changesResponse).toMatchObject<IMailboxChangesResponse>({
      accountId: client.getAccountIds()[0],
      oldState: getResponse.state,
      newState: getResponse.state,
      hasMoreChanges: false,
      created: [],
      updated: [],
      destroyed: [],
      updatedProperties: null,
    });
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

  it('should have email_changes working', async () => {
    const getResponse = await client.email_get({
      accountId: client.getAccountIds()[0],
      ids: [],
    });

    const changesResponse = await client.email_changes({
      accountId: client.getAccountIds()[0],
      sinceState: getResponse.state,
    });

    expect(changesResponse).toMatchObject<IEmailChangesResponse>({
      accountId: client.getAccountIds()[0],
      oldState: getResponse.state,
      newState: getResponse.state,
      hasMoreChanges: false,
      created: [],
      updated: [],
      destroyed: [],
    });

    const getMailboxesResponse = await client.mailbox_get({
      accountId: client.getAccountIds()[0],
      ids: null,
    });

    const draftMailboxId = <string>(
      getMailboxesResponse.list.find(mailbox => mailbox.name.toLowerCase() === 'drafts')?.id
    );

    const emailCreatedResponse = await client.email_set({
      accountId: client.getAccountIds()[0],
      create: {
        emailToCreateId: {
          mailboxIds: {
            [draftMailboxId]: true,
          },
        },
      },
    });

    const emailCreatedId = emailCreatedResponse.created?.emailToCreateId.id as string;

    const newChangesResponse = await client.email_changes({
      accountId: client.getAccountIds()[0],
      sinceState: getResponse.state,
    });

    expect(newChangesResponse).toMatchObject<IEmailChangesResponse>({
      accountId: client.getAccountIds()[0],
      oldState: getResponse.state,
      newState: emailCreatedResponse.newState,
      hasMoreChanges: false,
      created: [emailCreatedId],
      updated: [],
      destroyed: [],
    });
  });

  it('should have email_set working', async () => {
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

  it('should create mailbox', async () => {
    const id = '674cc24095db49ce';
    const response = await client.mailbox_set({
      accountId: client.getAccountIds()[0],
      create: {
        [id]: {
          name: 'mailbox1',
        },
      },
    });

    const expected = {
      created: {
        [id]: expect.any(Object),
      },
    };

    expect(response.created).toBeDefined();
    expect(response).toMatchObject(expect.objectContaining(expected));
  });

  it('should submit email', async () => {
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
          from: [
            {
              name: currentUser,
              email: currentUser,
            },
          ],
          to: [
            {
              name: 'random@localhost',
              email: 'random@localhost',
            },
          ],
          subject: 'subject',
          attachments: null,
          textBody: null,
          htmlBody: null,
          bodyValues: null,
        },
      },
    });

    const id = '674cc24095db49ce';
    const response = await client.emailSubmission_set({
      accountId: client.getAccountIds()[0],
      create: {
        [id]: {
          emailId: emailSetResponse.created!.emailCreated.id,
        },
      },
    });

    const expected = {
      created: {
        [id]: expect.any(String),
      },
    };

    expect(response.created).toBeDefined();
    expect(response).toMatchObject(expect.objectContaining(expected));
  });

  function generateHeaders(username: string, password: string) {
    return {
      Authorization: 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64'),
    };
  }
});
