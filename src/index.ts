import { Transport } from './utils/transport';
import {
  IEmailGetResponse,
  IEmailQueryResponse,
  IEmailSetResponse,
  IArguments,
  IMailboxGetResponse,
  IMailboxSetResponse,
  ISession,
  IEmailGetArguments,
  IMailboxGetArguments,
  IMailboxSetArguments,
  IMethodName,
  IReplaceableAccountId,
  IEmailQueryArguments,
  IEmailSetArguments,
  IMailboxChangesArguments,
  IMailboxChangesResponse,
  IEmailSubmissionSetArguments,
  IEmailSubmissionGetResponse,
  IEmailSubmissionGetArguments,
  IEmailSubmissionChangesArguments,
  IEmailSubmissionSetResponse,
  IEmailSubmissionChangesResponse,
  IEmailChangesArguments,
  IEmailChangesResponse,
  IInvocation,
  IUploadResponse,
  IEmailImportArguments,
  IEmailImportResponse,
  IThreadGetArguments,
  IThreadGetResponse,
} from './types';
import { PushClient } from './push';
import { Observable } from 'rxjs';
export class Client {
  private readonly DEFAULT_USING = ['urn:ietf:params:jmap:core', 'urn:ietf:params:jmap:mail'];

  private transport: Transport;
  private httpHeaders: { [headerName: string]: string };

  private sessionUrl: string;
  private overriddenApiUrl?: string;
  private overriddenPushUrl?: string;
  private session?: ISession;

  private pushClient: PushClient;

  constructor({
    sessionUrl,
    accessToken,
    overriddenApiUrl,
    overriddenPushUrl,
    transport,
    httpHeaders,
  }: {
    sessionUrl: string;
    accessToken: string;
    overriddenApiUrl?: string;
    overriddenPushUrl?: string;
    transport: Transport;
    httpHeaders?: { [headerName: string]: string };
  }) {
    this.sessionUrl = sessionUrl;
    if (overriddenApiUrl) {
      this.overriddenApiUrl = overriddenApiUrl;
    }
    if (overriddenPushUrl) {
      this.overriddenPushUrl = overriddenPushUrl;
    }
    this.transport = transport;
    this.httpHeaders = {
      Accept: 'application/json;jmapVersion=rfc-8621',
      Authorization: `Bearer ${accessToken}`,
      ...(httpHeaders ? httpHeaders : {}),
    };
    this.pushClient = new PushClient({
      client: this,
      transport,
      httpHeaders: this.httpHeaders,
    });
  }

  public fetchSession(sessionHeaders?: { [headerName: string]: string }): Promise<void> {
    const requestHeaders = {
      ...this.httpHeaders,
      ...(sessionHeaders ? sessionHeaders : {}),
    };
    const sessionPromise = this.transport.get<ISession>(this.sessionUrl, requestHeaders);
    return sessionPromise.then(session => {
      this.session = session;
      return;
    });
  }

  public getSession(): ISession {
    if (!this.session) {
      throw new Error('Undefined session, should call fetchSession and wait for its resolution');
    }
    return this.session;
  }

  public getAccountIds(): string[] {
    const session = this.getSession();

    return Object.keys(session.accounts);
  }

  public getFirstAccountId(): string {
    const accountIds = this.getAccountIds();

    if (accountIds.length === 0) {
      throw new Error('No account available for this session');
    }

    return accountIds[0];
  }

  public mailbox_get(args: IMailboxGetArguments): Promise<IMailboxGetResponse> {
    return this.request<IMailboxGetResponse>('Mailbox/get', args);
  }

  public mailbox_changes(args: IMailboxChangesArguments): Promise<IMailboxChangesResponse> {
    return this.request<IMailboxChangesResponse>('Mailbox/changes', args);
  }

  public mailbox_set(args: IMailboxSetArguments): Promise<IMailboxSetResponse> {
    return this.request<IMailboxSetResponse>('Mailbox/set', args);
  }

  public email_get(args: IEmailGetArguments): Promise<IEmailGetResponse> {
    return this.request<IEmailGetResponse>('Email/get', args);
  }

  public email_changes(args: IEmailChangesArguments): Promise<IEmailChangesResponse> {
    return this.request<IEmailChangesResponse>('Email/changes', args);
  }

  public email_query(args: IEmailQueryArguments): Promise<IEmailQueryResponse> {
    return this.request<IEmailQueryResponse>('Email/query', args);
  }

  public email_set(args: IEmailSetArguments): Promise<IEmailSetResponse> {
    return this.request<IEmailSetResponse>('Email/set', args);
  }

  public email_import(args: IEmailImportArguments): Promise<IEmailImportResponse> {
    return this.request<IEmailImportResponse>('Email/import', args);
  }

  public thread_get(args: IThreadGetArguments): Promise<IThreadGetResponse> {
    return this.request<IThreadGetResponse>('Thread/get', args);
  }

  public emailSubmission_get(
    args: IEmailSubmissionGetArguments,
  ): Promise<IEmailSubmissionGetResponse> {
    return this.request<IEmailSubmissionGetResponse>('EmailSubmission/get', args);
  }

  public emailSubmission_changes(
    args: IEmailSubmissionChangesArguments,
  ): Promise<IEmailSubmissionChangesResponse> {
    return this.request<IEmailSubmissionChangesResponse>('EmailSubmission/changes', args);
  }

  public emailSubmission_set(
    args: IEmailSubmissionSetArguments,
  ): Promise<IEmailSubmissionSetResponse> {
    return this.request<IEmailSubmissionSetResponse>('EmailSubmission/set', args);
  }

  public upload(buffer: ArrayBuffer, type = 'application/octet-stream'): Promise<IUploadResponse> {
    const uploadUrl = this.getSession().uploadUrl;
    const accountId = this.getFirstAccountId();
    const requestHeaders = {
      ...this.httpHeaders,
      'Content-Type': type,
    };
    return this.transport.post<IUploadResponse>(
      uploadUrl.replace('{accountId}', encodeURIComponent(accountId)),
      buffer,
      requestHeaders,
    );
  }

  private request<ResponseType>(methodName: IMethodName, args: IArguments) {
    const apiUrl = this.getApiUrl();
    return this.transport
      .post<{
        sessionState: string;
        methodResponses: IInvocation<ResponseType>[];
      }>(
        apiUrl,
        {
          using: this.getCapabilities(),
          methodCalls: [[methodName, this.replaceAccountId(args), '0']],
        },
        this.httpHeaders,
      )
      .then(response => {
        const methodResponse = response.methodResponses[0];

        if (methodResponse[0] === 'error') {
          throw methodResponse[1];
        }

        return methodResponse[1];
      });
  }

  public getApiUrl(): string {
    return this.overriddenApiUrl || this.getSession().apiUrl;
  }

  public getPushUrl(): string {
    return (
      this.overriddenPushUrl || this.getSession().capabilities['urn:ietf:params:jmap:websocket'].url
    );
  }

  public pushStart(): Promise<void> {
    return this.pushClient.start();
  }

  public pushMailbox(): Observable<{ [accountId: string]: string }> {
    return this.pushClient.mailbox();
  }

  public pushEmail(): Observable<{ [accountId: string]: string }> {
    return this.pushClient.email();
  }

  public pushEmailSubmission(): Observable<{ [accountId: string]: string }> {
    return this.pushClient.emailSubmission();
  }

  private replaceAccountId<U extends IReplaceableAccountId>(input: U): U {
    return input.accountId !== null
      ? input
      : {
          ...input,
          accountId: this.getFirstAccountId(),
        };
  }

  private getCapabilities() {
    return this.session?.capabilities ? Object.keys(this.session.capabilities) : this.DEFAULT_USING;
  }
}
