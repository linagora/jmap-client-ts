import fetch from 'node-fetch';
import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { Client } from '../src/index';
import { AxiosTransport } from '../src/utils/axios-transport';
import axios from 'axios';
import {
  IEmailChangesResponse,
  IMailboxChangesResponse,
  IError,
  IEmailProperties,
} from '../src/types';
import { readFileSync, writeFileSync } from 'fs';
import { generateKeyPairSync } from 'crypto';

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
    const { publicKey, privateKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });

    writeFileSync('./tests/jwt_publickey', publicKey);
    writeFileSync('./tests/jwt_privatekey', privateKey);

    container = await new GenericContainer('linagora/tmail-backend:memory-0.5.0')
      .withExposedPorts(JMAP_PORT, WEBADMIN_PORT)
      .withCopyFileToContainer('./tests/jmap.properties', '/root/conf/jmap.properties')
      .withCopyFileToContainer('./tests/jwt_publickey', '/root/conf/jwt_publickey')
      .withCopyFileToContainer('./tests/jwt_privatekey', '/root/conf/jwt_privatekey')
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
      accountId: client.getPrimaryAccountId(),
      ids: null,
    });

    expect(response.accountId).toBeDefined();
  });

  it('should have mailbox_changes working', async () => {
    const getResponse = await client.mailbox_get({
      accountId: client.getPrimaryAccountId(),
      ids: null,
    });

    const changesResponse = await client.mailbox_changes({
      accountId: client.getPrimaryAccountId(),
      sinceState: getResponse.state,
    });

    expect(changesResponse).toMatchObject<IMailboxChangesResponse>({
      accountId: client.getPrimaryAccountId(),
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
      accountId: client.getPrimaryAccountId(),
    });

    expect(response.accountId).toBeDefined();
  });

  it('should have email_get working', async () => {
    const emailQueryResponse = await client.email_query({
      accountId: client.getPrimaryAccountId(),
    });

    const emailGetResponse = await client.email_get({
      accountId: client.getPrimaryAccountId(),
      ids: emailQueryResponse.ids,
    });

    expect(emailGetResponse.accountId).toBeDefined();
  });

  it('should have email_changes working', async () => {
    const getResponse = await client.email_get({
      accountId: client.getPrimaryAccountId(),
      ids: [],
    });

    const changesResponse = await client.email_changes({
      accountId: client.getPrimaryAccountId(),
      sinceState: getResponse.state,
    });

    expect(changesResponse).toMatchObject<IEmailChangesResponse>({
      accountId: client.getPrimaryAccountId(),
      oldState: getResponse.state,
      newState: getResponse.state,
      hasMoreChanges: false,
      created: [],
      updated: [],
      destroyed: [],
    });

    const getMailboxesResponse = await client.mailbox_get({
      accountId: client.getPrimaryAccountId(),
      ids: null,
    });

    const draftMailboxId = <string>(
      getMailboxesResponse.list.find(mailbox => mailbox.name.toLowerCase() === 'drafts')?.id
    );

    const emailCreatedResponse = await client.email_set({
      accountId: client.getPrimaryAccountId(),
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
      accountId: client.getPrimaryAccountId(),
      sinceState: getResponse.state,
    });

    expect(newChangesResponse).toMatchObject<IEmailChangesResponse>({
      accountId: client.getPrimaryAccountId(),
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
      accountId: client.getPrimaryAccountId(),
      ids: null,
    });

    const draftMailbox = <string>(
      getMailboxesResponse.list.find(mailbox => mailbox.name.toLowerCase() === 'drafts')?.id
    );

    const emailSetResponse = await client.email_set({
      accountId: client.getPrimaryAccountId(),
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
      accountId: client.getPrimaryAccountId(),
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
      accountId: client.getPrimaryAccountId(),
      ids: null,
    });

    const draftMailbox = <string>(
      getMailboxesResponse.list.find(mailbox => mailbox.name.toLowerCase() === 'drafts')?.id
    );

    const emailSetResponse = await client.email_set({
      accountId: client.getPrimaryAccountId(),
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
      accountId: client.getPrimaryAccountId(),
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

  it('should import emails as one thread', async () => {
    const uploadResponse = await client.upload(readFileSync('./tests/1.eml'), 'message/rfc822');

    expect(uploadResponse.size).toEqual(301);
    expect(uploadResponse.type).toEqual('message/rfc822');
    expect(uploadResponse.blobId).toBeDefined();

    const getMailboxesResponse = await client.mailbox_get({
      accountId: client.getPrimaryAccountId(),
      ids: null,
    });

    let inboxMailboxId = '';
    let sentMailboxId = '';
    getMailboxesResponse.list.forEach(value => {
      if (value.role == 'inbox') {
        inboxMailboxId = value.id;
      }
      if (value.role == 'sent') {
        sentMailboxId = value.id;
      }
    });

    const importId1 = '1234567';
    const importId2 = 'abcdefg';
    const uploadResponse2 = await client.upload(readFileSync('./tests/2.eml'), 'message/rfc822');
    const dateString = new Date().toISOString();

    let importResponse = await client.email_import({
      accountId: client.getPrimaryAccountId(),
      ifInState: null,
      emails: {
        [importId1]: {
          blobId: uploadResponse.blobId,
          mailboxIds: {
            [inboxMailboxId]: true,
          },
          keywords: {
            $seen: true,
          },
          receivedAt: dateString,
        },
        [importId2]: {
          blobId: uploadResponse2.blobId,
          mailboxIds: {
            [sentMailboxId]: true,
          },
          keywords: {
            $seen: true,
          },
          receivedAt: dateString,
        },
      },
    });

    expect(importResponse.created).toBeDefined();
    expect(importResponse.notCreated).toBeUndefined();

    let created = importResponse.created as { [Id: string]: IEmailProperties };
    expect(created[importId1]).toBeDefined();
    expect(created[importId2]).toBeDefined();
    expect(created[importId2].threadId).toEqual(created[importId1].threadId);

    const threadId = created[importId2].threadId;
    const emailId1 = created[importId1].id;
    const emailId2 = created[importId2].id;

    const importId3 = '7654321';
    const uploadResponse3 = await client.upload(readFileSync('./tests/3.eml'), 'message/rfc822');
    importResponse = await client.email_import({
      accountId: client.getPrimaryAccountId(),
      ifInState: null,
      emails: {
        [importId3]: {
          blobId: uploadResponse3.blobId,
          mailboxIds: {
            [inboxMailboxId]: true,
          },
          keywords: {
            $seen: true,
          },
          receivedAt: dateString,
        },
      },
    });

    created = importResponse.created as { [Id: string]: IEmailProperties };
    expect(created[importId3].threadId).toEqual(threadId);
    const emailId3 = created[importId3].id;

    const threadGetResponse = await client.thread_get({
      accountId: client.getPrimaryAccountId(),
      ids: [threadId],
    });

    expect(threadGetResponse.list[0]).toBeDefined();
    const threadInfo = threadGetResponse.list[0];
    expect(threadInfo.id).toEqual(threadId);
    expect(new Set(threadInfo.emailIds)).toEqual(new Set([emailId1, emailId2, emailId3]));
  });

  function generateHeaders(username: string, password: string) {
    return {
      Authorization: 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64'),
    };
  }
});
