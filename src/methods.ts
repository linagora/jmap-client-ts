/**
 * Method registry. Every JMAP method the client knows is an entry of
 * {@link JmapMethods}; apps and companion packages add their own through
 * declaration merging:
 *
 * ```ts
 * declare module '@linagora/jmap-client-ts' {
 *   interface JmapMethods {
 *     'Label/get': {
 *       capability: 'com:linagora:params:jmap:labels';
 *       args: GetArgs<Label>;
 *       response: GetResponse<Label>;
 *     };
 *   }
 * }
 * ```
 */
import { CAPABILITIES } from './capabilities.js';
import type {
  ChangesArgs,
  ChangesResponse,
  CopyArgs,
  CopyResponse,
  GetArgs,
  GetResponse,
  QueryArgs,
  QueryChangesArgs,
  QueryChangesResponse,
  QueryResponse,
  SetArgs,
  SetResponse,
} from './types/generic.js';
import type {
  Email,
  EmailBodyFetchOptions,
  EmailComparator,
  EmailCopy,
  EmailCreate,
  EmailFilterCondition,
  EmailImportArgs,
  EmailImportResponse,
  EmailParseArgs,
  EmailParseResponse,
  EmailSubmission,
  EmailSubmissionComparator,
  EmailSubmissionCreate,
  EmailSubmissionFilterCondition,
  EmailSubmissionSetExtraArgs,
  HeaderProperty,
  HeaderValueOf,
  Identity,
  IdentityCreate,
  Mailbox,
  MailboxComparator,
  MailboxCreate,
  MailboxFilterCondition,
  SearchSnippetGetArgs,
  SearchSnippetGetResponse,
  Thread,
  VacationResponse,
} from './types/mail.js';
import type { MdnParseArgs, MdnParseResponse, MdnSendArgs, MdnSendResponse } from './types/mdn.js';
import type { Quota, QuotaComparator, QuotaFilterCondition } from './types/quota.js';

/** Shape every {@link JmapMethods} entry must follow. */
export interface MethodDefinition {
  /** Capability URN that must be in `using` for this method. */
  capability: string;
  args: object;
  response: object;
}

type MailCapability = typeof CAPABILITIES.mail;

/** Built-in methods. Extend with declaration merging, see module doc. */
export interface JmapMethods {
  // Core (RFC 8620)
  'Core/echo': {
    capability: typeof CAPABILITIES.core;
    args: Record<string, unknown>;
    response: Record<string, unknown>;
  };

  // Mailbox (RFC 8621 §2)
  'Mailbox/get': {
    capability: MailCapability;
    args: GetArgs<Mailbox>;
    response: GetResponse<Mailbox>;
  };
  'Mailbox/changes': {
    capability: MailCapability;
    args: ChangesArgs;
    response: ChangesResponse & { updatedProperties: string[] | null };
  };
  'Mailbox/query': {
    capability: MailCapability;
    args: QueryArgs<MailboxFilterCondition, MailboxComparator> & {
      sortAsTree?: boolean;
      filterAsTree?: boolean;
    };
    response: QueryResponse;
  };
  'Mailbox/queryChanges': {
    capability: MailCapability;
    args: QueryChangesArgs<MailboxFilterCondition, MailboxComparator>;
    response: QueryChangesResponse;
  };
  'Mailbox/set': {
    capability: MailCapability;
    args: SetArgs<Mailbox, MailboxCreate> & { onDestroyRemoveEmails?: boolean };
    response: SetResponse<Mailbox>;
  };

  // Thread (RFC 8621 §3)
  'Thread/get': {
    capability: MailCapability;
    args: GetArgs<Thread>;
    response: GetResponse<Thread>;
  };
  'Thread/changes': {
    capability: MailCapability;
    args: ChangesArgs;
    response: ChangesResponse;
  };

  // Email (RFC 8621 §4)
  'Email/get': {
    capability: MailCapability;
    args: GetArgs<Email> & EmailBodyFetchOptions;
    response: GetResponse<Email>;
  };
  'Email/changes': {
    capability: MailCapability;
    args: ChangesArgs;
    response: ChangesResponse;
  };
  'Email/query': {
    capability: MailCapability;
    args: QueryArgs<EmailFilterCondition, EmailComparator> & { collapseThreads?: boolean };
    response: QueryResponse;
  };
  'Email/queryChanges': {
    capability: MailCapability;
    args: QueryChangesArgs<EmailFilterCondition, EmailComparator> & {
      collapseThreads?: boolean;
    };
    response: QueryChangesResponse;
  };
  'Email/set': {
    capability: MailCapability;
    args: SetArgs<Email, EmailCreate>;
    response: SetResponse<Email>;
  };
  'Email/copy': {
    capability: MailCapability;
    args: CopyArgs<EmailCopy>;
    response: CopyResponse<Email>;
  };
  'Email/import': {
    capability: MailCapability;
    args: EmailImportArgs;
    response: EmailImportResponse;
  };
  'Email/parse': {
    capability: MailCapability;
    args: EmailParseArgs;
    response: EmailParseResponse;
  };

  // SearchSnippet (RFC 8621 §5)
  'SearchSnippet/get': {
    capability: MailCapability;
    args: SearchSnippetGetArgs;
    response: SearchSnippetGetResponse;
  };

  // Identity (RFC 8621 §6)
  'Identity/get': {
    capability: typeof CAPABILITIES.submission;
    args: GetArgs<Identity>;
    response: GetResponse<Identity>;
  };
  'Identity/changes': {
    capability: typeof CAPABILITIES.submission;
    args: ChangesArgs;
    response: ChangesResponse;
  };
  'Identity/set': {
    capability: typeof CAPABILITIES.submission;
    args: SetArgs<Identity, IdentityCreate>;
    response: SetResponse<Identity>;
  };

  // EmailSubmission (RFC 8621 §7)
  'EmailSubmission/get': {
    capability: typeof CAPABILITIES.submission;
    args: GetArgs<EmailSubmission>;
    response: GetResponse<EmailSubmission>;
  };
  'EmailSubmission/changes': {
    capability: typeof CAPABILITIES.submission;
    args: ChangesArgs;
    response: ChangesResponse;
  };
  'EmailSubmission/query': {
    capability: typeof CAPABILITIES.submission;
    args: QueryArgs<EmailSubmissionFilterCondition, EmailSubmissionComparator>;
    response: QueryResponse;
  };
  'EmailSubmission/queryChanges': {
    capability: typeof CAPABILITIES.submission;
    args: QueryChangesArgs<EmailSubmissionFilterCondition, EmailSubmissionComparator>;
    response: QueryChangesResponse;
  };
  'EmailSubmission/set': {
    capability: typeof CAPABILITIES.submission;
    args: SetArgs<EmailSubmission, EmailSubmissionCreate> & EmailSubmissionSetExtraArgs;
    response: SetResponse<EmailSubmission>;
  };

  // VacationResponse (RFC 8621 §8)
  'VacationResponse/get': {
    capability: typeof CAPABILITIES.vacationResponse;
    args: GetArgs<VacationResponse>;
    response: GetResponse<VacationResponse>;
  };
  'VacationResponse/set': {
    capability: typeof CAPABILITIES.vacationResponse;
    args: SetArgs<VacationResponse>;
    response: SetResponse<VacationResponse>;
  };

  // Quota (RFC 9425)
  'Quota/get': {
    capability: typeof CAPABILITIES.quota;
    args: GetArgs<Quota>;
    response: GetResponse<Quota>;
  };
  'Quota/changes': {
    capability: typeof CAPABILITIES.quota;
    args: ChangesArgs;
    response: ChangesResponse & { updatedProperties: string[] | null };
  };
  'Quota/query': {
    capability: typeof CAPABILITIES.quota;
    args: QueryArgs<QuotaFilterCondition, QuotaComparator>;
    response: QueryResponse;
  };
  'Quota/queryChanges': {
    capability: typeof CAPABILITIES.quota;
    args: QueryChangesArgs<QuotaFilterCondition, QuotaComparator>;
    response: QueryChangesResponse;
  };

  // MDN (RFC 9007)
  'MDN/send': {
    capability: typeof CAPABILITIES.mdn;
    args: MdnSendArgs;
    response: MdnSendResponse;
  };
  'MDN/parse': {
    capability: typeof CAPABILITIES.mdn;
    args: MdnParseArgs;
    response: MdnParseResponse;
  };
}

/** Name of any known method, built-in or added by declaration merging. */
export type JmapMethodName = Extract<keyof JmapMethods, string>;

/** Capability one method declares. */
export type MethodCapability<M extends JmapMethodName> = JmapMethods[M] extends {
  capability: infer C;
}
  ? C
  : never;

/** Arguments one method accepts. */
export type MethodArgs<M extends JmapMethodName> = JmapMethods[M] extends {
  args: infer A extends object;
}
  ? A
  : never;

type RawMethodResponse<M extends JmapMethodName> = JmapMethods[M] extends {
  response: infer R;
}
  ? R
  : never;

/**
 * Response one method returns. When `Args` (the arguments actually sent)
 * carries a literal `properties` list and the response has a `list`, each
 * item is narrowed to those properties (plus `id`, always returned).
 */
export type MethodResponse<M extends JmapMethodName, Args = MethodArgs<M>> = NarrowByProperties<
  RawMethodResponse<M>,
  Args
>;

/** Picks `Property` from `T`, resolving `header:*` forms to their exact type. */
export type PickProperties<T, Property extends string> = {
  [K in Property | ('id' extends keyof T ? 'id' : never)]: K extends HeaderProperty
    ? HeaderValueOf<K>
    : K extends keyof T
      ? T[K]
      : never;
};

/** Narrows `Response['list']` to the properties requested in `Args`. */
export type NarrowByProperties<Response, Args> = Args extends {
  properties: readonly (infer Property extends string)[];
}
  ? string extends Property
    ? Response
    : Response extends { list: (infer Item)[] }
      ? {
          [K in keyof Response]: K extends 'list'
            ? Array<PickProperties<Item, Property>>
            : Response[K];
        }
      : Response
  : Response;

/** Built-in methods, used to tell them apart from extension methods. */
export type BuiltinMethodName =
  | 'Core/echo'
  | 'Mailbox/get'
  | 'Mailbox/changes'
  | 'Mailbox/query'
  | 'Mailbox/queryChanges'
  | 'Mailbox/set'
  | 'Thread/get'
  | 'Thread/changes'
  | 'Email/get'
  | 'Email/changes'
  | 'Email/query'
  | 'Email/queryChanges'
  | 'Email/set'
  | 'Email/copy'
  | 'Email/import'
  | 'Email/parse'
  | 'SearchSnippet/get'
  | 'Identity/get'
  | 'Identity/changes'
  | 'Identity/set'
  | 'EmailSubmission/get'
  | 'EmailSubmission/changes'
  | 'EmailSubmission/query'
  | 'EmailSubmission/queryChanges'
  | 'EmailSubmission/set'
  | 'VacationResponse/get'
  | 'VacationResponse/set'
  | 'Quota/get'
  | 'Quota/changes'
  | 'Quota/query'
  | 'Quota/queryChanges'
  | 'MDN/send'
  | 'MDN/parse';

/** Methods added by declaration merging. */
export type ExtensionMethodName = Exclude<JmapMethodName, BuiltinMethodName>;

/**
 * Runtime capability map for extension methods. Types are erased at
 * runtime, so `createClient` needs the URN of every extension method to
 * build `using`; the type forces it to match the declaration.
 */
export type ExtensionMethodCapabilities = {
  [M in ExtensionMethodName]: MethodCapability<M> | readonly MethodCapability<M>[];
};

/**
 * Capabilities sent in `using` for each built-in method. Some methods need
 * more than the one they are declared under (submission implies mail).
 */
export const BUILTIN_METHOD_CAPABILITIES: Readonly<Record<BuiltinMethodName, readonly string[]>> = {
  'Core/echo': [CAPABILITIES.core],
  'Mailbox/get': [CAPABILITIES.mail],
  'Mailbox/changes': [CAPABILITIES.mail],
  'Mailbox/query': [CAPABILITIES.mail],
  'Mailbox/queryChanges': [CAPABILITIES.mail],
  'Mailbox/set': [CAPABILITIES.mail],
  'Thread/get': [CAPABILITIES.mail],
  'Thread/changes': [CAPABILITIES.mail],
  'Email/get': [CAPABILITIES.mail],
  'Email/changes': [CAPABILITIES.mail],
  'Email/query': [CAPABILITIES.mail],
  'Email/queryChanges': [CAPABILITIES.mail],
  'Email/set': [CAPABILITIES.mail],
  'Email/copy': [CAPABILITIES.mail],
  'Email/import': [CAPABILITIES.mail],
  'Email/parse': [CAPABILITIES.mail],
  'SearchSnippet/get': [CAPABILITIES.mail],
  'Identity/get': [CAPABILITIES.mail, CAPABILITIES.submission],
  'Identity/changes': [CAPABILITIES.mail, CAPABILITIES.submission],
  'Identity/set': [CAPABILITIES.mail, CAPABILITIES.submission],
  'EmailSubmission/get': [CAPABILITIES.mail, CAPABILITIES.submission],
  'EmailSubmission/changes': [CAPABILITIES.mail, CAPABILITIES.submission],
  'EmailSubmission/query': [CAPABILITIES.mail, CAPABILITIES.submission],
  'EmailSubmission/queryChanges': [CAPABILITIES.mail, CAPABILITIES.submission],
  'EmailSubmission/set': [CAPABILITIES.mail, CAPABILITIES.submission],
  'VacationResponse/get': [CAPABILITIES.mail, CAPABILITIES.vacationResponse],
  'VacationResponse/set': [CAPABILITIES.mail, CAPABILITIES.vacationResponse],
  'Quota/get': [CAPABILITIES.quota],
  'Quota/changes': [CAPABILITIES.quota],
  'Quota/query': [CAPABILITIES.quota],
  'Quota/queryChanges': [CAPABILITIES.quota],
  'MDN/send': [CAPABILITIES.mail, CAPABILITIES.mdn],
  'MDN/parse': [CAPABILITIES.mail, CAPABILITIES.mdn],
};

// ---------------------------------------------------------------------------
// Result reference paths (RFC 8620 §3.7)
// ---------------------------------------------------------------------------

type IsPlainKey<K> = K extends `${string}:${string}` ? false : string extends K ? false : true;

type Decrement = [0, 0, 1, 2];

/**
 * JSON pointer paths (with the `*` array wildcard) available in a response,
 * up to three segments deep: `/ids`, `/list/*\/threadId`, `/created`, …
 */
export type ResultPath<T, Depth extends 0 | 1 | 2 | 3 = 3> = [Depth] extends [0]
  ? never
  : T extends readonly (infer Item)[]
    ? '/*' | `/*${ResultPath<Item, Decrement[Depth]>}`
    : T extends object
      ? {
          [K in Extract<keyof T, string>]: IsPlainKey<K> extends true
            ? `/${K}` | `/${K}${ResultPath<NonNullable<T[K]>, Decrement[Depth]>}`
            : never;
        }[Extract<keyof T, string>]
      : never;

type FlattenOnce<V> = [V] extends [readonly (infer X)[]] ? X[] : V[];

/** Type a result reference resolves to (arrays under `*` are flattened). */
export type ResultPathValue<T, Path extends string> = Path extends `/${infer Head}/${infer Rest}`
  ? Head extends '*'
    ? T extends readonly (infer Item)[]
      ? FlattenOnce<ResultPathValue<Item, `/${Rest}`>>
      : never
    : Head extends keyof NonNullable<T>
      ? ResultPathValue<NonNullable<NonNullable<T>[Head]>, `/${Rest}`>
      : never
  : Path extends `/${infer Head}`
    ? Head extends '*'
      ? T extends readonly (infer Item)[]
        ? Item[]
        : never
      : Head extends keyof NonNullable<T>
        ? NonNullable<T>[Head]
        : never
    : never;

/** Keys of `T` that are required. */
type RequiredKeys<T> = {
  [K in keyof T]-?: object extends Pick<T, K> ? never : K;
}[keyof T];

/** Required arguments missing from `Given` (neither `key` nor `#key` present). */
export type MissingArgs<Args, Given> = {
  [K in RequiredKeys<Args>]: K extends keyof Given
    ? never
    : K extends string
      ? `#${K}` extends keyof Given
        ? never
        : K
      : K;
}[RequiredKeys<Args>];

/** Property names a method accepts in its `properties` argument (`never` if none). */
export type MethodPropertyName<M extends JmapMethodName> =
  MethodArgs<M> extends {
    properties?: readonly (infer Property)[] | null;
  }
    ? Extract<Property, string>
    : never;

/**
 * `Args` with `properties` typed as a list of `Property`, so that the
 * requested properties can be inferred from a call.
 */
export type WithPropertyList<M extends JmapMethodName, Args, Property extends string> = [
  MethodPropertyName<M>,
] extends [never]
  ? Args
  : Omit<Args, 'properties'> & { properties?: readonly Property[] | null };

/** Response of `M` when `properties` lists `Property` (`never`: not narrowed). */
export type NarrowedMethodResponse<M extends JmapMethodName, Property extends string> = [
  Property,
] extends [never]
  ? MethodResponse<M>
  : MethodResponse<M, { properties: readonly Property[] }>;

/** Arguments of {@link JmapClient.call}. */
export type CallArgs<M extends JmapMethodName, Property extends string = never> = WithPropertyList<
  M,
  MethodArgs<M>,
  Property
>;
