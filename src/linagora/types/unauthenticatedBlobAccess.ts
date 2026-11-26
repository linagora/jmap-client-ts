/**
 * `UnauthenticatedBlobAccess/set`
 * (`com:linagora:params:jmap:unauthenticated:blob:access`): a short-lived
 * token that lets another backend download one blob without authentication.
 */
import type { Id, SetError, UTCDate } from '@linagora/jmap-client-ts';

export interface UnauthenticatedBlobAccess {
  /** Fills `{token}` in the `endpoint` of the capability. */
  token: string;
  validUntil: UTCDate;
}

/** Only `create` is supported: keyed by blob id, each value an empty object. */
export interface UnauthenticatedBlobAccessSetArgs {
  accountId: Id;
  create: Record<Id, Record<string, never>>;
}

/**
 * No state: tokens are not stored objects. A new token for a blob replaces
 * the previous one, keyed by blob id.
 */
export interface UnauthenticatedBlobAccessSetResponse {
  accountId: Id;
  created?: Record<Id, UnauthenticatedBlobAccess> | null;
  notCreated?: Record<Id, SetError> | null;
}
