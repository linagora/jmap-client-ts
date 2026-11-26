/**
 * Declares the Linagora methods to @linagora/jmap-client-ts (declaration merging),
 * and the capabilities `createClient` needs to send them.
 */
import type {
  ChangesArgs,
  ChangesResponse,
  GetArgs,
  GetResponse,
  MethodCapability,
  SetArgs,
  SetResponse,
} from '@linagora/jmap-client-ts';

import type { LINAGORA_CAPABILITIES } from './capabilities.js';
import type {
  CalendarEventAcceptResponse,
  CalendarEventAttendanceGetArgs,
  CalendarEventAttendanceGetResponse,
  CalendarEventCounterAcceptArgs,
  CalendarEventCounterAcceptResponse,
  CalendarEventMaybeResponse,
  CalendarEventParseArgs,
  CalendarEventParseResponse,
  CalendarEventRejectResponse,
  CalendarEventReplyArgs,
} from './types/calendarEvents.js';
import type { ContactAutocompleteArgs, ContactAutocompleteResponse } from './types/contacts.js';
import type {
  EmailRecoveryActionGetArgs,
  EmailRecoveryActionGetResponse,
  EmailRecoveryActionSetArgs,
  EmailRecoveryActionSetResponse,
} from './types/emailRecovery.js';
import type { RuleFilter, RuleFilterSetArgs } from './types/filter.js';
import type { Forward } from './types/forward.js';
import type { Label, LabelCreate } from './types/labels.js';
import type { MailboxClearArgs, MailboxClearResponse } from './types/mailbox.js';
import type { PublicAsset, PublicAssetCreate } from './types/publicAssets.js';
import type { Settings } from './types/settings.js';

type Capabilities = typeof LINAGORA_CAPABILITIES;
type MailCapability = 'urn:ietf:params:jmap:mail';

/** Singleton objects (`Forward`, `Settings`) are only updated, never created nor destroyed. */
type SingletonSetArgs<T> = Omit<SetArgs<T>, 'create' | 'destroy'>;

declare module '@linagora/jmap-client-ts' {
  interface Mailbox {
    /**
     * James shares extension (`urn:apache:james:params:jmap:mail:shares`):
     * `Personal`, or `TeamMailbox[team@domain]` / `Delegated[user@domain]`
     * for the mailboxes shared with the user; absent without the extension.
     */
    namespace?: string | null;
  }

  interface Identity {
    /**
     * James extension (`urn:apache:james:params:jmap:mail:identity:sortorder`,
     * passed as an extra capability): the lowest comes first.
     */
    sortOrder?: number;
  }

  interface IdentityCreate {
    /** See {@link Identity.sortOrder}. */
    sortOrder?: number;
  }

  interface JmapMethods {
    'Label/get': {
      capability: Capabilities['labels'];
      args: GetArgs<Label>;
      response: GetResponse<Label>;
    };
    'Label/changes': {
      capability: Capabilities['labels'];
      args: ChangesArgs;
      response: ChangesResponse;
    };
    'Label/set': {
      capability: Capabilities['labels'];
      args: SetArgs<Label, LabelCreate>;
      response: SetResponse<Label>;
    };
    'Forward/get': {
      capability: Capabilities['forward'];
      args: GetArgs<Forward>;
      response: GetResponse<Forward>;
    };
    'Forward/set': {
      capability: Capabilities['forward'];
      args: SingletonSetArgs<Forward>;
      response: SetResponse<Forward>;
    };
    'Filter/get': {
      capability: Capabilities['filter'];
      args: GetArgs<RuleFilter>;
      response: GetResponse<RuleFilter>;
    };
    'Filter/set': {
      capability: Capabilities['filter'];
      args: RuleFilterSetArgs;
      response: SetResponse<RuleFilter>;
    };
    'Settings/get': {
      capability: Capabilities['settings'];
      args: GetArgs<Settings>;
      response: GetResponse<Settings>;
    };
    'Settings/set': {
      capability: Capabilities['settings'];
      args: SingletonSetArgs<Settings>;
      response: SetResponse<Settings>;
    };
    'EmailRecoveryAction/get': {
      capability: Capabilities['messagesVault'];
      args: EmailRecoveryActionGetArgs;
      response: EmailRecoveryActionGetResponse;
    };
    'EmailRecoveryAction/set': {
      capability: Capabilities['messagesVault'];
      args: EmailRecoveryActionSetArgs;
      response: EmailRecoveryActionSetResponse;
    };
    'TMailContact/autocomplete': {
      capability: Capabilities['contactAutocomplete'];
      args: ContactAutocompleteArgs;
      response: ContactAutocompleteResponse;
    };
    'PublicAsset/get': {
      capability: Capabilities['publicAssets'];
      args: GetArgs<PublicAsset>;
      response: GetResponse<PublicAsset>;
    };
    'PublicAsset/set': {
      capability: Capabilities['publicAssets'];
      args: SetArgs<PublicAsset, PublicAssetCreate>;
      response: SetResponse<PublicAsset>;
    };
    'Mailbox/clear': {
      // tmail-backend also asks for the mail capability
      capability: Capabilities['mailboxClear'] | MailCapability;
      args: MailboxClearArgs;
      response: MailboxClearResponse;
    };
    'CalendarEvent/parse': {
      capability: Capabilities['calendarEvent'];
      args: CalendarEventParseArgs;
      response: CalendarEventParseResponse;
    };
    'CalendarEvent/accept': {
      capability: Capabilities['calendarEvent'];
      args: CalendarEventReplyArgs;
      response: CalendarEventAcceptResponse;
    };
    'CalendarEvent/reject': {
      capability: Capabilities['calendarEvent'];
      args: CalendarEventReplyArgs;
      response: CalendarEventRejectResponse;
    };
    'CalendarEvent/maybe': {
      capability: Capabilities['calendarEvent'];
      args: CalendarEventReplyArgs;
      response: CalendarEventMaybeResponse;
    };
    'CalendarEventAttendance/get': {
      capability: Capabilities['calendarEvent'];
      args: CalendarEventAttendanceGetArgs;
      response: CalendarEventAttendanceGetResponse;
    };
    /** Only when the capability has `counterSupport`. */
    'CalendarEventCounter/accept': {
      capability: Capabilities['calendarEvent'];
      args: CalendarEventCounterAcceptArgs;
      response: CalendarEventCounterAcceptResponse;
    };
  }
}

/** Methods this entry point declares. */
export type LinagoraMethodName =
  | 'Label/get'
  | 'Label/changes'
  | 'Label/set'
  | 'Forward/get'
  | 'Forward/set'
  | 'Filter/get'
  | 'Filter/set'
  | 'Settings/get'
  | 'Settings/set'
  | 'EmailRecoveryAction/get'
  | 'EmailRecoveryAction/set'
  | 'TMailContact/autocomplete'
  | 'PublicAsset/get'
  | 'PublicAsset/set'
  | 'Mailbox/clear'
  | 'CalendarEvent/parse'
  | 'CalendarEvent/accept'
  | 'CalendarEvent/reject'
  | 'CalendarEvent/maybe'
  | 'CalendarEventAttendance/get'
  | 'CalendarEventCounter/accept';

/** Capabilities of the Linagora methods, as `createClient` takes them. */
export type LinagoraMethodCapabilities = {
  readonly [M in LinagoraMethodName]: MethodCapability<M> | readonly MethodCapability<M>[];
};
