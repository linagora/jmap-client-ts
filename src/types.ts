export type IMethodName =
  | 'Mailbox/get'
  | 'Mailbox/changes'
  | 'Mailbox/set'
  | 'Email/get'
  | 'Email/query'
  | 'Email/set';

/**
 * See https://jmap.io/spec-core.html#the-invocation-data-type
 * [ name, arguments, id ]
 */
export type IMethodCall = [IMethodName, IArguments, string];

export type IEntityProperties = IMailboxProperties | IEmailProperties;

/**
 * See https://jmap.io/spec-core.html#query
 */
export type IFilterCondition = IMailboxFilterCondition | IEmailFilterCondition;

export type IArguments =
  | IGetArguments<IEntityProperties>
  | ISetArguments<IEntityProperties>
  | IQueryArguments<IEmailFilterCondition>;
export interface IReplaceableAccountId {
  /**
   * If null, the library will replace its value by default account id.
   */
  accountId: string | null;
}

/**
 * See https://jmap.io/spec-core.html#get
 */
export interface IGetArguments<Properties extends IEntityProperties> extends IReplaceableAccountId {
  ids: string[] | null;
  properties?: (keyof Properties)[];
}

/**
 * See https://jmap.io/spec-core.html#get
 */
export interface IGetResponse<Foo> {
  accountId: string;
  state: string;
  list: Foo[];
  notFound: string[];
}

/**
 * See https://jmap.io/spec-core.html#changes
 */
export interface IChangesArguments extends IReplaceableAccountId {
  sinceState: string;
  maxChanges?: number | null;
}

/**
 * See https://jmap.io/spec-core.html#changes
 */
export interface IChangesResponse {
  accountId: string;
  oldState: string;
  newState: string;
  hasMoreChanges: boolean;
  created: string[];
  updated: string[];
  destroyed: string[];
}

/**
 * See https://jmap.io/spec-core.html#set
 */
export interface ISetArguments<Properties extends IEntityProperties> extends IReplaceableAccountId {
  ifInState?: string;
  create?: { [id: string]: Partial<Properties> };
  update?: { [id: string]: Partial<Properties> & { [jsonPointer: string]: any } };
  destroy?: string[];
}

/**
 * See https://jmap.io/spec-core.html#set
 */
export interface ISetResponse<Foo> {
  accountId: string;
  oldState?: string;
  newState: string;
  created?: { [key: string]: Foo };
  updated?: { [key: string]: Foo | null };
  destroyed?: string[];
  notCreated?: { [id: string]: ISetError };
  notUpdated?: { [id: string]: ISetError };
  notDestroyed?: { [id: string]: ISetError };
}

/**
 * See https://jmap.io/spec-core.html#query
 */
export interface IQueryArguments<FilterCondition extends IFilterCondition>
  extends IReplaceableAccountId {
  filter?: FilterCondition | IFilterOperator<FilterCondition>;
  sort?: IComparator[];
  position?: number;
  anchor?: string;
  anchorOffset?: number;
  limit?: number;
  calculateTotal?: boolean;
}

/**
 * See https://jmap.io/spec-core.html#query
 */
export interface IQueryResponse {
  accountId: string;
  queryState: string;
  canCalculateChanges: boolean;
  position: number;
  ids: string[];
  total?: number;
  limit?: number;
}

export type IEmailQueryArguments = IQueryArguments<IEmailFilterCondition>;

export type IEmailQueryResponse = IQueryResponse;

/**
 * See https://jmap.io/spec-core.html#query
 */
export interface IFilterOperator<FilterCondition> {
  operator: 'AND' | 'OR' | 'NOT';
  conditions: (FilterCondition | IFilterOperator<FilterCondition>)[];
}

/**
 * See https://jmap.io/spec-core.html#query
 */
export interface IComparator {
  property: string;
  isAscending?: boolean;
  collation?: string;
}

/**
 * See https://jmap.io/spec-core.html#the-request-object
 */
export interface IRequest {
  using: string[];
  methodCalls: IMethodCall[];
  createdIds?: { [creationId: string]: string };
}

/**
 * See https://jmap.io/spec-core.html#the-jmap-session-resource
 */
export interface ICapabilities {
  maxSizeUpload: number;
  maxConcurrentUpload: number;
  maxSizeRequest: number;
  maxConcurrentRequests: number;
  maxCallsInRequest: number;
  maxObjectsInGet: number;
  maxObjectsInSet: number;
  collationAlgorithms: string[];
}

/**
 * See https://jmap.io/spec-mail.html#additions-to-the-capabilities-object
 */
export interface IMailCapabilities {
  maxMailboxesPerEmail?: number;
  maxMailboxDepth?: number;
  maxSizeMailboxName: number;
  maxSizeAttachmentsPerEmail: number;
  emailQuerySortOptions: string[];
  mayCreateTopLevelMailbox: boolean;
}

/**
 * See https://jmap.io/spec-core.html#the-jmap-session-resource
 */
export interface IAccount {
  name: string;
  isPersonal: boolean;
  isReadOnly: boolean;
  accountCapabilities: { [key: string]: IMailCapabilities };
}

/**
 * See https://jmap.io/spec-core.html#the-jmap-session-resource
 */
export interface ISession {
  capabilities: ICapabilities;
  accounts: { [accountId: string]: IAccount };
  primaryAccounts: { [key: string]: string };
  username: string;
  apiUrl: string;
  downloadUrl: string;
  uploadUrl: string;
  eventSourceUrl: string;
  state: string;
}

export type EmailHeader = string;

export type Attachment = File;

/**
 * See https://jmap.io/spec-mail.html#emailget
 */
export interface IEmailGetArguments extends IGetArguments<IEmailProperties> {
  bodyProperties?: string[];
  fetchTextBodyValues?: boolean;
  fetchHTMLBodyValues?: boolean;
  fetchAllBodyValues?: boolean;
  maxBodyValueBytes?: number;
}

/**
 * See https://jmap.io/spec-mail.html#properties-of-the-email-object
 */
export interface IEmailProperties {
  id: string;
  blobId: string;
  threadId: string;
  mailboxIds: { [key: string]: boolean };
  keywords: IEmailKeywords;
  from: IEmailAddress[] | null;
  to: IEmailAddress[] | null;
  bodyValues: {
    [bodyPartId: string]: IEmailBodyValue;
  } | null;
  textBody: IEmailBodyPart[] | null;
  htmlBody: IEmailBodyPart[] | null;
  subject: string;
  date: Date;
  size: number;
  preview: string;
  attachments: Attachment[] | null;
  createdModSeq: number;
  updatedModSeq: number;
  receivedAt: IUtcDate;
}

export type IUtcDate = string;
export type ITrue = true;

/**
 * See https://jmap.io/spec-mail.html#properties-of-the-email-object
 */
export interface IEmailKeywords {
  $draft?: ITrue;
  $seen?: ITrue;
  $flagged?: ITrue;
  $answered?: ITrue;
  $forwarded?: ITrue;
  $phishing?: ITrue;
  $junk?: ITrue;
  $notjunk?: ITrue;
}

/**
 * See https://jmap.io/spec-mail.html#properties-of-the-email-object
 */
export interface IEmailAddress {
  name: string;
  email: string;
}

/**
 * See https://jmap.io/spec-mail.html#threads
 */
export interface IThreadProperties {
  id: string;
  emailsIds: string[];
}

/**
 * See https://jmap.io/spec-mail.html#mailboxes
 */
export interface IMailboxRights {
  mayReadItems: boolean;
  mayAddItems: boolean;
  mayRemoveItems: boolean;
  mayCreateChild: boolean;
  mayRename: boolean;
  mayDelete: boolean;
}

/**
 * See https://jmap.io/spec-mail.html#mailboxes
 */
export interface IMailboxProperties {
  id: string;
  name: string;
  parentId?: string;
  role?: string;
  sortOrder: number;
  totalEmails: number;
  unreadEmails: number;
  totalThreads: number;
  unreadThreads: number;
  myRights: IMailboxRights;
  isSubscribed: false;
}

export type IMailboxGetArguments = IGetArguments<IMailboxProperties>;

export type IMailboxGetResponse = IGetResponse<IMailboxProperties>;

export type IMailboxChangesArguments = IChangesArguments;

/**
 * See https://jmap.io/spec-mail.html#mailboxchanges
 */
export interface IMailboxChangesResponse extends IChangesResponse {
  updatedProperties: string[] | null;
}

export type IMailboxSetArguments = ISetArguments<IMailboxProperties>;

export type IMailboxSetResponse = ISetResponse<IMailboxProperties>;

/**
 * See https://jmap.io/spec-core.html#creation-of-jmap-error-codes-registry
 */
export type IErrorType =
  | 'accountNotFound'
  | 'accountNotSupportedByMethod'
  | 'accountReadOnly'
  | 'anchorNotFound'
  | 'alreadyExists'
  | 'cannotCalculateChanges'
  | 'forbidden'
  | 'fromAccountNotFound'
  | 'fromAccountNotSupportedByMethod'
  | 'invalidArguments'
  | 'invalidPatch'
  | 'invalidProperties'
  | 'notFound'
  | 'notJSON'
  | 'notRequest'
  | 'overQuota'
  | 'rateLimit'
  | 'requestTooLarge'
  | 'invalidResultReference'
  | 'serverFail'
  | 'serverPartialFail'
  | 'serverUnavailable'
  | 'singleton'
  | 'stateMismatch'
  | 'tooLarge'
  | 'tooManyChanges'
  | 'unknownCapability'
  | 'unknownMethod'
  | 'unsupportedFilter'
  | 'unsupportedSort'
  | 'willDestroy';

/**
 * See https://jmap.io/spec-core.html#set
 */
export interface ISetError {
  type: IErrorType;
  description?: string;
  properties?: string[];
}

export interface IMailboxEmailList {
  id: string; // mailboxId . (Max_Int64 - EmailDate) . uid
  threadId: string;
  messageId: string;
  updatedModSeq: number; // Documentation says it is string, must be an error
  created: Date;
  deleted: Date | null;
}

export type IEmailChangesResponse = IChangesResponse;

export type IThreadChangesResponse = IChangesResponse;

/**
 * See https://jmap.io/spec-mail.html#properties-of-the-email-object
 */
export interface IEmailBodyValue {
  value: string;
  isEncodingProblem: boolean;
  isTruncated: boolean;
}

/**
 * See https://jmap.io/spec-mail.html#properties-of-the-email-object
 */
export interface IEmailBodyPart {
  partId: string;
  blobId: string;
  size: number;
  headers: EmailHeader[];
  name: string | null;
  type: string;
  charset: string | null;
  disposition: string | null;
  cid: string | null;
  language: string[] | null;
  location: string | null;
  subParts: IEmailBodyPart[] | null;
  bodyStructure: IEmailBodyPart;
  bodyValues: { [key: string]: IEmailBodyValue };
  textBody: IEmailBodyPart[]; // text/plain
  htmlBody: IEmailBodyPart[]; // text/html
  attachments: IEmailBodyPart[];
  hasAttachment: boolean;
  preview: string;
}

/**
 * See https://jmap.io/spec-mail.html#emailset
 */
export interface IEmailSetBodyPart {
  partId: string;
  type: string;
}

/**
 * See https://jmap.io/spec-mail.html#mailboxquery
 */
export interface IMailboxFilterCondition {
  parentId?: string | null;
  name?: string;
  role?: string | null;
  hasAnyRole?: boolean;
  isSubscribed?: boolean;
}

/**
 * See https://jmap.io/spec-mail.html#emailquery
 */
export interface IEmailFilterCondition {
  inMailbox?: string;
  inMailboxOtherThan?: string[];
  before?: IUtcDate;
  after?: IUtcDate;
  minSize?: number;
  maxSize?: number;
  allInThreadHaveKeyword?: string;
  someInThreadHaveKeyword?: string;
  noneInThreadHaveKeyword?: string;
  hasKeyword?: string;
  notKeyword?: string;
  hasAttachment?: boolean;
  text?: string;
  from?: string;
  to?: string;
  cc?: string;
  bcc?: string;
  subject?: string;
  body?: string;
  header?: string[];
}

export type IEmailGetResponse = IGetResponse<IEmailProperties>;

export type IEmailSetArguments = ISetArguments<IEmailProperties>;

export type IEmailSetResponse = ISetResponse<IEmailProperties>;
