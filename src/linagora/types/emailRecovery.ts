/**
 * Deleted messages vault (`com:linagora:params:jmap:messages:vault`):
 * restore deleted emails into the `Restored-Messages` mailbox.
 */
import type { Id, UnsignedInt, UTCDate } from '@linagora/jmap-client-ts';

/** James task statuses (`completed`, not the `done` of the extension's documentation). */
export type EmailRecoveryStatus =
  | 'waiting'
  | 'inProgress'
  | 'canceledRequested'
  | 'completed'
  | 'failed'
  | 'canceled'
  | (string & {});

export interface EmailRecoveryAction {
  id: Id;
  successfulRestoreCount: UnsignedInt;
  errorRestoreCount: UnsignedInt;
  status: EmailRecoveryStatus;
}

/** What to restore; every criterion is optional and they all apply. */
export interface EmailRecoveryActionCreate {
  deletedBefore?: UTCDate | null;
  deletedAfter?: UTCDate | null;
  receivedBefore?: UTCDate | null;
  receivedAfter?: UTCDate | null;
  hasAttachment?: boolean | null;
  /** Contained in the subject. */
  subject?: string | null;
  /** An email address. */
  sender?: string | null;
  /** Email addresses, all among To, Cc and Bcc. */
  recipients?: string[] | null;
}

/** `EmailRecoveryAction/get` arguments: `ids` cannot be null. */
export interface EmailRecoveryActionGetArgs {
  accountId: Id;
  ids: readonly Id[];
  properties?: readonly Exclude<keyof EmailRecoveryAction, symbol>[] | null;
}

/** tmail-backend sends neither `accountId` nor `state`. */
export interface EmailRecoveryActionGetResponse {
  accountId?: Id;
  state?: string;
  list: EmailRecoveryAction[];
  notFound: Id[];
}

/** `EmailRecoveryAction/set` arguments: no destroy; only `status: 'canceled'` in an update. */
export interface EmailRecoveryActionSetArgs {
  accountId: Id;
  create?: Record<Id, EmailRecoveryActionCreate> | null;
  update?: Record<Id, { status: 'canceled' }> | null;
}

export interface EmailRecoveryActionSetError {
  type: string;
  description?: string | null;
  properties?: string[];
}

/** tmail-backend sends neither `accountId` nor states. */
export interface EmailRecoveryActionSetResponse {
  accountId?: Id;
  created?: Record<Id, { id: Id }> | null;
  notCreated?: Record<Id, EmailRecoveryActionSetError> | null;
  updated?: Record<Id, null> | null;
  /** `invalidStatus` when the task already ended. */
  notUpdated?: Record<Id, EmailRecoveryActionSetError> | null;
}
