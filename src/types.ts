export interface ITypeMap {
  ['Mailbox/get']: IMailbox;
  ['Email/query']: string[];
  ['Email/get']: IEmailProperties;
}

/**
 * [ name, arguments, id ]
 */
export type IMethodCall = [keyof ITypeMap, { [argumentName: string]: any }, string];

export interface IGetArguments<Properties> {
  accountId: string;
  ids: string[] | null;
  properties?: (keyof Properties)[];
}

export interface ISetArguments<CreatedObject> {
  accountId: string;
  ifInState?: string | null;
  create?: { [temporaryId: string]: CreatedObject };
  update?: { [id: string]: { [jsonPointer: string]: any } };
  destroy?: string[];
}

export interface IQueryArguments<FilterCondition> {
  accountId: string;
  filter?: FilterCondition;
  position?: number;
  limit?: number;
}

export interface IRequest {
  using: string[];
  methodCalls: IMethodCall[];
}

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

export interface IAccount {
  name: string;
  isPersonal: boolean;
  isReadOnly: boolean;
  accountCapabilities: { [key: string]: any };
}

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

export interface IGetEmailArguments extends IGetArguments<IEmailProperties> {
  bodyProperties?: string[];
  fetchTextBodyValues?: boolean;
  fetchHTMLBodyValues?: boolean;
  fetchAllBodyValues?: boolean;
  maxBodyValueBytes?: number;
}

export type IGetMailboxArguments = IGetArguments<IMailboxProperties>;

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
  };
  textBody: IEmailBodyPart[];
  htmlBody: IEmailBodyPart[];
  subject: string;
  size: number;
  preview: string;
  attachments: Attachment[] | null;
  createdModSeq: number;
  updatedModSeq: number;
  receivedAt: IUtcDate;
}

export interface IEmailSetProperties {
  mailboxIds: { [key: string]: boolean };
  keywords: IEmailKeywords;
  from: IEmailAddress[] | null;
  to: IEmailAddress[] | null;
  subject: string;
  attachments: Attachment[] | null;
  textBody: IEmailSetBodyPart[] | null;
  htmlBody: IEmailSetBodyPart[] | null;
  bodyValues: {
    [bodyPartId: string]: IEmailBodyValue;
  } | null;
}

export type IUtcDate = string;
export type ITrue = true;

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

export interface IEmailAddress {
  name: string;
  email: string;
}

export interface IThreadEmail {
  id: string;
  mailboxIds: string[];
  isUnread: boolean;
  isFlagged: boolean;
}

export interface IThread {
  id: string;
  emails: IThreadEmail[];
  createdModSeq: number;
  updatedModSeq: number;
  deleted: Date | null;
}

export interface IMailbox extends IMailboxProperties, IMailboxData {}

export interface IMailboxData {
  createdModSeq: number;
  updatedModSeq: number;
  updatedNotCounrsModSeq: number;
  highestUID: number;
  emailHighestModSeq: number;
  emailListLowModSeq: number;
}

export interface IMailboxRights {
  mayReadItems: boolean;
  mayAddItems: boolean;
  mayRemoveItems: boolean;
  mayCreateChild: boolean;
  mayRename: boolean;
  mayDelete: boolean;
}

export interface IMailboxProperties {
  id: string;
  name: string;
  parentId?: string;
  role: string;
  sortOrder: number;
  myRights: IMailboxRights;
  totalEmails: number;
  unreadEmails: number;
  totalThreads: number;
  unreadThreads: number;
  deleted?: Date;
}

export interface IMailboxGetResponse {
  accountId: string | null;
  state: string;
  list: IMailbox[];
  notFound: string[];
}

export interface IMaiboxEmailList {
  id: string; // mailboxId . (Max_Int64 - EmailDate) . uid
  messageId: string;
  updatedModSeq: number; // Documentation says it is string, must be an error
  created: Date;
  deleted: Date | null;
}

export interface IEmailChangeLog {
  id: string;
  created: string[];
  updated: string[];
  destroyed: string[];
}

export interface IThreadChangeLog {
  id: string;
  created: string[];
  updated: string[];
  destroyed: string[];
}

export interface IThreadRef {
  id: string; // hash(rfc822id) . hash(subject)
  threadId: string;
  lastSeen: Date;
}

export interface IHighLowModSeqCache {
  highModSeq: number;
  highModSeqEmail: number;
  highModSeqThread: number;
  highModSeqMailbox: number;
  lowModSeqEmail: number;
  lowModSeqThread: number;
  lowModSeqMailbox: number;
}

export interface IMessage {
  htmlBody: string;
}

export interface IEmailBodyValue {
  value: string;
  isEncodingProblem: boolean;
  isTruncated: boolean;
}

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

export interface IEmailSetBodyPart {
  partId: string;
  type: string;
}

export interface IEmailFilterCondition {
  inMailbox: string;
}

export interface IEmailQueryResponse {
  accountId: string;
  queryState: string;
  canCalculateChanges: boolean;
  position: number;
  ids: string[];
  total?: number;
  limit?: number;
}

export interface IEmailGetResponse {
  accountId: string | null;
  state: string;
  list: IEmailProperties[];
  notFound: string[];
}

export interface IEmailSetResponse<SetObject> {
  accountId: string | null;
  oldState?: string | null;
  newState: string;
  created?: { [key: string]: SetObject } | null;
  updated?: { [key: string]: SetObject | null } | null;
  destroyed?: string[] | null;
}
