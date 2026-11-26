/**
 * Capabilities of tmail-backend (Linagora) and of the James extensions it
 * ships, with the shape of their capability objects.
 */

/** Capability URNs of the Linagora and James extensions. */
export const LINAGORA_CAPABILITIES = {
  /** `Label/*` */
  labels: 'com:linagora:params:jmap:labels',
  /** `Forward/*` */
  forward: 'com:linagora:params:jmap:forward',
  /** `Filter/*` */
  filter: 'com:linagora:params:jmap:filter',
  /** `Settings/*` */
  settings: 'com:linagora:params:jmap:settings',
  /** `EmailRecoveryAction/*` (deleted messages vault) */
  messagesVault: 'com:linagora:params:jmap:messages:vault',
  /** `TMailContact/autocomplete` */
  contactAutocomplete: 'com:linagora:params:jmap:contact:autocomplete',
  /** `PublicAsset/*` */
  publicAssets: 'com:linagora:params:jmap:public:assets',
  /** `UnauthenticatedBlobAccess/set` */
  unauthenticatedBlobAccess: 'com:linagora:params:jmap:unauthenticated:blob:access',
  /** `Mailbox/clear` */
  mailboxClear: 'com:linagora:params:jmap:mailbox:clear',
  /** `CalendarEvent/*` and `CalendarEventAttendance/get` */
  calendarEvent: 'com:linagora:params:calendar:event',
  /** Download of every attachment of an email as a zip */
  downloadAll: 'com:linagora:params:downloadAll',
  /** Team mailboxes */
  teamMailboxes: 'com:linagora:params:jmap:team:mailboxes',
  /** Contact support link */
  contactSupport: 'com:linagora:params:jmap:contact:support',
  /** WebSocket authentication tickets */
  webSocketTicket: 'com:linagora:params:jmap:ws:ticket',
  /** James: shared and team mailboxes (`Mailbox.namespace`) */
  jamesShares: 'urn:apache:james:params:jmap:mail:shares',
  /** James: mailbox quotas */
  jamesQuota: 'urn:apache:james:params:jmap:mail:quota',
  /** James: `Identity.sortOrder` */
  jamesIdentitySortOrder: 'urn:apache:james:params:jmap:mail:identity:sortorder',
  /** James: delegated accounts */
  jamesDelegation: 'urn:apache:james:params:jmap:delegation',
} as const;

/** Capability object of `com:linagora:params:jmap:labels`. */
export interface LabelsCapability {
  /** Absent means 1; `readOnly` labels come with version 2. */
  version?: number;
}

/** Capability object of `com:linagora:params:jmap:filter`. */
export interface FilterCapability {
  /** Absent means 1; `FolderFilteringAction` comes with version 2. */
  version?: number;
}

/** Capability object of `com:linagora:params:jmap:settings`. */
export interface SettingsCapability {
  /** Setting keys the client cannot change. */
  readOnlyProperties?: string[];
}

/** Capability object of `com:linagora:params:jmap:messages:vault`. */
export interface MessagesVaultCapability {
  /**
   * Most emails one `EmailRecoveryAction` restores (default 5). tmail-backend
   * sends it as a string (`"5"`).
   */
  maxEmailRecoveryPerRequest?: number | string | null;
  /** How far back users can restore by themselves, e.g. `15 days`. */
  restorationHorizon?: string | null;
}

/** Capability object of `com:linagora:params:jmap:public:assets`. */
export interface PublicAssetsCapability {
  /** Quota of public assets, in bytes. */
  publicAssetTotalSize?: number;
}

/** Capability object of `com:linagora:params:jmap:unauthenticated:blob:access`. */
export interface UnauthenticatedBlobAccessCapability {
  /** URL template with `{accountId}`, `{blobId}` and `{token}`. */
  endpoint: string;
  tokenTtlInSeconds: number;
}

/** Capability object of `com:linagora:params:jmap:contact:autocomplete`. */
export interface ContactAutocompleteCapability {
  minInputLength?: number;
}

/** Capability object of `com:linagora:params:calendar:event`. */
export interface CalendarEventCapability {
  version?: number;
  /** Languages of the reply templates (`language` of the reply methods). */
  replySupportedLanguage?: string[];
  /** `CalendarEventAttendance/get` returns `isFree`. */
  supportFreeBusyQuery?: boolean;
  /** `CalendarEventCounter/accept` is available. */
  counterSupport?: boolean;
}

/** Capability object of `com:linagora:params:jmap:contact:support`. */
export interface ContactSupportCapability {
  supportMailAddress?: string | null;
  httpLink?: string | null;
}
