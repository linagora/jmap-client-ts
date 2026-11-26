/** `Mailbox/clear` (`com:linagora:params:jmap:mailbox:clear`). */
import type { Id, SetError, UnsignedInt } from '@linagora/jmap-client-ts';

export interface MailboxClearArgs {
  accountId: Id;
  mailboxId: Id;
}

/** How many emails went, or why none did. */
export interface MailboxClearResponse {
  accountId: Id;
  totalDeletedMessagesCount?: UnsignedInt | null;
  notCleared?: SetError | null;
}
