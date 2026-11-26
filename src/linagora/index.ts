/**
 * Linagora (tmail-backend) and James extensions for @linagora/jmap-client-ts.
 * Importing this entry point declares their methods to the client:
 *
 * ```ts
 * import { createClient } from '@linagora/jmap-client-ts';
 * import { LINAGORA_CAPABILITIES, LINAGORA_METHOD_CAPABILITIES } from '@linagora/jmap-client-ts/linagora';
 *
 * const client = createClient({ sessionUrl, auth, methodCapabilities: LINAGORA_METHOD_CAPABILITIES });
 * if (client.hasCapability(LINAGORA_CAPABILITIES.labels)) {
 *   const { list } = await client.call('Label/get', { accountId, ids: null });
 * }
 * ```
 */
export { LINAGORA_CAPABILITIES } from './capabilities.js';
export type {
  CalendarEventCapability,
  ContactAutocompleteCapability,
  ContactSupportCapability,
  FilterCapability,
  LabelsCapability,
  MessagesVaultCapability,
  PublicAssetsCapability,
  SettingsCapability,
  UnauthenticatedBlobAccessCapability,
} from './capabilities.js';
export { LINAGORA_METHOD_CAPABILITIES } from './methodCapabilities.js';
export type { LinagoraMethodCapabilities, LinagoraMethodName } from './methods.js';
export type * from './types/calendarEvents.js';
export type * from './types/contacts.js';
export type * from './types/emailRecovery.js';
export type * from './types/filter.js';
export type * from './types/forward.js';
export type * from './types/labels.js';
export type * from './types/mailbox.js';
export type * from './types/publicAssets.js';
export type * from './types/settings.js';
export type * from './types/unauthenticatedBlobAccess.js';
