/** JMAP forwards (`com:linagora:params:jmap:forward`). */
import type { Id } from '@linagora/jmap-client-ts';

/** The only Forward object of an account; forwarding is off when `forwards` is empty. */
export interface Forward {
  /** Always `singleton`. */
  id: Id;
  /** Keep a copy in the inbox when forwarding. */
  localCopy: boolean;
  /** Addresses every email is forwarded to. */
  forwards: string[];
}
