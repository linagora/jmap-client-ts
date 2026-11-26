import { describe, expect, it } from 'vitest';

import { createClient } from '../../../src/index.js';
import {
  LINAGORA_CAPABILITIES,
  LINAGORA_METHOD_CAPABILITIES,
} from '../../../src/linagora/index.js';
import type { LinagoraMethodName } from '../../../src/linagora/index.js';
import { ACCOUNT_ID, apiHandler, makeFakeServer, SESSION_URL } from '../../unit/helpers.js';

const API_URL = 'POST https://jmap.example.com/jmap';

function makeClient(responses: Parameters<typeof apiHandler>[0]) {
  const server = makeFakeServer({ [API_URL]: apiHandler(responses) });
  const client = createClient({
    sessionUrl: SESSION_URL,
    fetch: server.fetch,
    methodCapabilities: LINAGORA_METHOD_CAPABILITIES,
  });
  return { server, client, sent: () => server.apiRequests()[0]!.json() };
}

const METHODS: Record<LinagoraMethodName, readonly string[]> = {
  'Label/get': [LINAGORA_CAPABILITIES.labels],
  'Label/changes': [LINAGORA_CAPABILITIES.labels],
  'Label/set': [LINAGORA_CAPABILITIES.labels],
  'Forward/get': [LINAGORA_CAPABILITIES.forward],
  'Forward/set': [LINAGORA_CAPABILITIES.forward],
  'Filter/get': [LINAGORA_CAPABILITIES.filter],
  'Filter/set': [LINAGORA_CAPABILITIES.filter],
  'Settings/get': [LINAGORA_CAPABILITIES.settings],
  'Settings/set': [LINAGORA_CAPABILITIES.settings],
  'EmailRecoveryAction/get': [LINAGORA_CAPABILITIES.messagesVault],
  'EmailRecoveryAction/set': [LINAGORA_CAPABILITIES.messagesVault],
  'TMailContact/autocomplete': [LINAGORA_CAPABILITIES.contactAutocomplete],
  'PublicAsset/get': [LINAGORA_CAPABILITIES.publicAssets],
  'PublicAsset/set': [LINAGORA_CAPABILITIES.publicAssets],
  'UnauthenticatedBlobAccess/set': [LINAGORA_CAPABILITIES.unauthenticatedBlobAccess],
  'Mailbox/clear': [LINAGORA_CAPABILITIES.mailboxClear, 'urn:ietf:params:jmap:mail'],
  'CalendarEvent/parse': [LINAGORA_CAPABILITIES.calendarEvent],
  'CalendarEvent/accept': [LINAGORA_CAPABILITIES.calendarEvent],
  'CalendarEvent/reject': [LINAGORA_CAPABILITIES.calendarEvent],
  'CalendarEvent/maybe': [LINAGORA_CAPABILITIES.calendarEvent],
  'CalendarEventAttendance/get': [LINAGORA_CAPABILITIES.calendarEvent],
  'CalendarEventCounter/accept': [LINAGORA_CAPABILITIES.calendarEvent],
};

describe('LINAGORA_METHOD_CAPABILITIES', () => {
  it('has the capabilities of every declared method', () => {
    const normalized = Object.fromEntries(
      Object.entries(LINAGORA_METHOD_CAPABILITIES).map(([method, capability]) => [
        method,
        typeof capability === 'string' ? [capability] : capability,
      ]),
    );

    expect(normalized).toEqual(METHODS);
  });

  it.each(Object.entries(METHODS))('sends %s with its capabilities', async (method, using) => {
    const { client, sent } = makeClient({ [method]: () => ({ accountId: ACCOUNT_ID }) });

    await client.request(b => [
      // Each method gets the arguments it needs below; only `using` matters here
      b.call(method as 'Core/echo', { accountId: ACCOUNT_ID }),
    ]);

    expect(sent()).toMatchObject({ using: ['urn:ietf:params:jmap:core', ...using] });
  });
});

describe('Linagora methods', () => {
  it('replaces the rules with Filter/set', async () => {
    const { client, sent } = makeClient({
      'Filter/set': () => ({
        accountId: ACCOUNT_ID,
        oldState: '0',
        newState: '1',
        updated: { singleton: {} },
      }),
    });

    const response = await client.call('Filter/set', {
      accountId: ACCOUNT_ID,
      update: {
        singleton: [
          {
            id: '1',
            name: 'Reject spam',
            conditionGroup: {
              conditionCombiner: 'AND',
              conditions: [{ field: 'from', comparator: 'contains', value: 'spam' }],
            },
            action: { appendIn: { mailboxIds: [] }, reject: true },
          },
        ],
      },
    });

    expect(response.updated).toEqual({ singleton: {} });
    expect(sent()).toMatchObject({
      methodCalls: [
        [
          'Filter/set',
          {
            update: {
              singleton: [{ id: '1', name: 'Reject spam', action: { reject: true } }],
            },
          },
          'c0',
        ],
      ],
    });
  });

  it('patches one setting with Settings/set', async () => {
    const { client, sent } = makeClient({
      'Settings/set': () => ({ accountId: ACCOUNT_ID, oldState: 's0', newState: 's1' }),
    });

    await client.call('Settings/set', {
      accountId: ACCOUNT_ID,
      update: { singleton: { 'settings/language': 'fr' } },
    });

    expect(sent()).toMatchObject({
      methodCalls: [
        ['Settings/set', { update: { singleton: { 'settings/language': 'fr' } } }, 'c0'],
      ],
    });
  });

  it('reads a recovery action without accountId nor state', async () => {
    const { client } = makeClient({
      'EmailRecoveryAction/get': () => ({
        list: [{ id: 't1', status: 'completed', successfulRestoreCount: 2, errorRestoreCount: 0 }],
        notFound: [],
      }),
    });

    const response = await client.call('EmailRecoveryAction/get', {
      accountId: ACCOUNT_ID,
      ids: ['t1'],
      properties: ['status', 'successfulRestoreCount'],
    });

    expect(response.list).toEqual([
      { id: 't1', status: 'completed', successfulRestoreCount: 2, errorRestoreCount: 0 },
    ]);
  });

  it('reads the attendance of an invitation as eventAttendanceStatus', async () => {
    const { client } = makeClient({
      'CalendarEventAttendance/get': () => ({
        accountId: ACCOUNT_ID,
        list: [{ blobId: '1_3', eventAttendanceStatus: 'needsAction', isFree: false }],
      }),
    });

    const response = await client.call('CalendarEventAttendance/get', {
      accountId: ACCOUNT_ID,
      blobIds: ['1_3'],
    });

    expect(response.list[0]?.eventAttendanceStatus).toBe('needsAction');
  });

  it('accepts a counter proposal with CalendarEventCounter/accept', async () => {
    const { client, sent } = makeClient({
      'CalendarEventCounter/accept': () => ({ accountId: ACCOUNT_ID, accepted: ['1_5'] }),
    });

    const response = await client.call('CalendarEventCounter/accept', {
      accountId: ACCOUNT_ID,
      blobIds: ['1_5'],
    });

    expect(response.accepted).toEqual(['1_5']);
    expect(sent()).toMatchObject({
      using: ['urn:ietf:params:jmap:core', LINAGORA_CAPABILITIES.calendarEvent],
      methodCalls: [['CalendarEventCounter/accept', { blobIds: ['1_5'] }, 'c0']],
    });
  });

  it('gets a download token for a blob with UnauthenticatedBlobAccess/set', async () => {
    const { client, sent } = makeClient({
      'UnauthenticatedBlobAccess/set': () => ({
        accountId: ACCOUNT_ID,
        created: {
          '1_2': {
            token: '5b9a2f7e-3c1d-4e8f-9a6b-0c2d4e6f8a1b',
            validUntil: '2026-11-26T12:05:00Z',
          },
        },
      }),
    });

    const response = await client.call('UnauthenticatedBlobAccess/set', {
      accountId: ACCOUNT_ID,
      create: { '1_2': {} },
    });

    expect(response.created?.['1_2']?.token).toBe('5b9a2f7e-3c1d-4e8f-9a6b-0c2d4e6f8a1b');
    expect(sent()).toMatchObject({
      methodCalls: [['UnauthenticatedBlobAccess/set', { create: { '1_2': {} } }, 'c0']],
    });
  });
});
