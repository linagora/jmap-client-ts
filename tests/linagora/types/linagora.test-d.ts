import { describe, expectTypeOf, it } from 'vitest';

import { createClient } from '../../../src/index.js';
import type { Identity, JmapMethodName, Mailbox } from '../../../src/index.js';
import { LINAGORA_METHOD_CAPABILITIES } from '../../../src/linagora/index.js';
import type {
  Forward,
  Label,
  LinagoraMethodName,
  Rule,
  RuleCondition,
  RuleConditionGroup,
  TMailContact,
} from '../../../src/linagora/index.js';

const sessionUrl = 'https://jmap.example.com/jmap/session';
const client = createClient({ sessionUrl, methodCapabilities: LINAGORA_METHOD_CAPABILITIES });
const accountId = 'a1';

describe('@linagora/jmap-client-ts/linagora', () => {
  it('declares its methods to the client', () => {
    expectTypeOf<LinagoraMethodName>().toExtend<JmapMethodName>();
  });

  it('requires LINAGORA_METHOD_CAPABILITIES', () => {
    // @ts-expect-error methodCapabilities must list the Linagora methods
    createClient({ sessionUrl });
    createClient({
      sessionUrl,
      methodCapabilities: {
        ...LINAGORA_METHOD_CAPABILITIES,
        // @ts-expect-error a capability must match the declaration
        'Label/get': 'urn:ietf:params:jmap:mail',
      },
    });
  });

  it('narrows Label/get to the requested properties', async () => {
    const response = await client.call('Label/get', {
      accountId,
      ids: null,
      properties: ['displayName', 'color'],
    });
    expectTypeOf(response.list[0]!).toEqualTypeOf<{
      id: string;
      displayName: string;
      color: string | null;
    }>();
  });

  it('creates labels with a display name, the keyword being server-set', () => {
    void client.call('Label/set', {
      accountId,
      create: { new: { displayName: 'Work', color: '#0080ff' } },
    });
    void client.call('Label/set', {
      accountId,
      // @ts-expect-error the keyword is server-set
      create: { new: { displayName: 'Work', keyword: 'work' } },
    });
  });

  it('only updates singletons', async () => {
    const forwards = await client.call('Forward/get', { accountId, ids: ['singleton'] });
    expectTypeOf(forwards.list).toEqualTypeOf<Forward[]>();
    void client.call('Forward/set', {
      accountId,
      update: { singleton: { forwards: ['bob@example.com'], localCopy: true } },
    });
    void client.call('Forward/set', {
      accountId,
      // @ts-expect-error Forward has no create
      create: { new: { forwards: [] } },
    });
  });

  it('takes whole rules with an id in Filter/set', async () => {
    const filters = await client.call('Filter/get', { accountId, ids: ['singleton'] });
    expectTypeOf(filters.list[0]!.rules).toEqualTypeOf<Rule[]>();
    const action = { appendIn: { mailboxIds: [] } };
    const condition: RuleCondition = { field: 'subject', comparator: 'contains', value: 'x' };
    const group: RuleConditionGroup = { conditionCombiner: 'AND', conditions: [condition] };
    void client.call('Filter/set', {
      accountId,
      update: { singleton: [{ id: '1', name: 'Legacy', condition, action }] },
    });
    void client.call('Filter/set', {
      accountId,
      // @ts-expect-error a rule needs an id
      update: { singleton: [{ name: 'No id', condition, action }] },
    });
    void client.call('Filter/set', {
      accountId,
      update: {
        // @ts-expect-error condition and conditionGroup are exclusive
        singleton: [{ id: '1', name: 'Both', condition, conditionGroup: group, action }],
      },
    });
  });

  it('needs ids in EmailRecoveryAction/get', () => {
    // @ts-expect-error ids cannot be null
    void client.call('EmailRecoveryAction/get', { accountId, ids: null });
  });

  it('types contact autocompletion', async () => {
    const response = await client.call('TMailContact/autocomplete', {
      accountId,
      filter: { text: 'ali' },
      limit: 10,
    });
    expectTypeOf(response.list).toEqualTypeOf<TMailContact[]>();
  });

  it('adds the James properties of mailboxes and identities', () => {
    expectTypeOf<Mailbox['namespace']>().toEqualTypeOf<string | null | undefined>();
    expectTypeOf<Identity['sortOrder']>().toEqualTypeOf<number | undefined>();
  });

  it('keeps Label exported', () => {
    expectTypeOf<Label['keyword']>().toEqualTypeOf<string>();
  });
});
