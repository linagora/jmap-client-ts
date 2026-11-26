import { LINAGORA_CAPABILITIES } from './capabilities.js';
import type { LinagoraMethodCapabilities } from './methods.js';

const {
  calendarEvent,
  contactAutocomplete,
  filter,
  forward,
  labels,
  mailboxClear,
  messagesVault,
  publicAssets,
  settings,
  unauthenticatedBlobAccess,
} = LINAGORA_CAPABILITIES;

/**
 * The `methodCapabilities` option of `createClient` for the Linagora
 * methods. Spread it when the app declares methods of its own:
 *
 * ```ts
 * createClient({ sessionUrl, auth, methodCapabilities: LINAGORA_METHOD_CAPABILITIES });
 * ```
 */
export const LINAGORA_METHOD_CAPABILITIES: LinagoraMethodCapabilities = {
  'Label/get': labels,
  'Label/changes': labels,
  'Label/set': labels,
  'Forward/get': forward,
  'Forward/set': forward,
  'Filter/get': filter,
  'Filter/set': filter,
  'Settings/get': settings,
  'Settings/set': settings,
  'EmailRecoveryAction/get': messagesVault,
  'EmailRecoveryAction/set': messagesVault,
  'TMailContact/autocomplete': contactAutocomplete,
  'PublicAsset/get': publicAssets,
  'PublicAsset/set': publicAssets,
  'UnauthenticatedBlobAccess/set': unauthenticatedBlobAccess,
  'Mailbox/clear': [mailboxClear, 'urn:ietf:params:jmap:mail'],
  'CalendarEvent/parse': calendarEvent,
  'CalendarEvent/accept': calendarEvent,
  'CalendarEvent/reject': calendarEvent,
  'CalendarEvent/maybe': calendarEvent,
  'CalendarEventAttendance/get': calendarEvent,
  'CalendarEventCounter/accept': calendarEvent,
};
