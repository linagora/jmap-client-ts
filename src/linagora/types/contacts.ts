/** JMAP contact autocomplete (`com:linagora:params:jmap:contact:autocomplete`). */
import type { Id, UnsignedInt } from '@linagora/jmap-client-ts';

/** A contact of the user's address book or of the domain. */
export interface TMailContact {
  id: Id;
  emailAddress: string;
  firstname: string;
  surname: string;
}

export interface ContactAutocompleteArgs {
  accountId: Id;
  filter: { text: string };
  limit?: UnsignedInt | null;
}

export interface ContactAutocompleteResponse {
  accountId: Id;
  list: TMailContact[];
  limit?: UnsignedInt;
}
