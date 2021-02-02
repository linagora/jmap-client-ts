import { HttpRequest } from './http-request';
import {
  IEmailFilterCondition,
  IEmailGetResponse,
  IEmailProperties,
  IEmailSetProperties,
  IEmailQueryResponse,
  IEmailSetResponse,
  IMailboxGetResponse,
  IQueryArguments,
  ISession,
  ISetArguments,
  IGetEmailArguments,
  IGetMailboxArguments,
} from './types';

export class Client {
  private readonly DEFAULT_USING = ['urn:ietf:params:jmap:core', 'urn:ietf:params:jmap:mail'];

  private httpRequest: HttpRequest;
  private httpHeaders: { [headerName: string]: string };

  private sessionUrl: string;
  private overriddenApiUrl?: string;
  private session?: ISession;

  constructor({
    sessionUrl,
    accessToken,
    overriddenApiUrl,
    httpRequest,
    httpHeaders,
  }: {
    sessionUrl: string;
    accessToken: string;
    overriddenApiUrl?: string;
    httpRequest?: HttpRequest;
    httpHeaders?: { [headerName: string]: string };
  }) {
    this.sessionUrl = sessionUrl;
    if (overriddenApiUrl) {
      this.overriddenApiUrl = overriddenApiUrl;
    }
    this.httpRequest = httpRequest ? httpRequest : new HttpRequest();
    this.httpHeaders = {
      Accept: 'application/json;jmapVersion=rfc-8621',
      Authorization: `Bearer ${accessToken}`,
      ...(httpHeaders ? httpHeaders : {}),
    };
  }

  public fetchSession(): Promise<void> {
    const sessionPromise = this.httpRequest.get<ISession>(this.sessionUrl, this.httpHeaders);
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

  public mailbox_get(args: IGetMailboxArguments): Promise<IMailboxGetResponse> {
    const apiUrl = this.overriddenApiUrl || this.getSession().apiUrl;
    return this.httpRequest
      .post<{
        sessionState: string;
        methodResponses: [['Mailbox/get', IMailboxGetResponse, string]];
      }>(
        apiUrl,
        {
          using: this.getCapabilities(),
          methodCalls: [['Mailbox/get', this.replaceAccountId(args), '0']],
        },
        this.httpHeaders,
      )
      .then(response => response.methodResponses[0][1]);
  }

  public email_query(args: IQueryArguments<IEmailFilterCondition>): Promise<IEmailQueryResponse> {
    const apiUrl = this.overriddenApiUrl || this.getSession().apiUrl;
    return this.httpRequest
      .post<{
        sessionState: string;
        methodResponses: [['Email/query', IEmailQueryResponse, string]];
      }>(
        apiUrl,
        {
          using: this.getCapabilities(),
          methodCalls: [['Email/query', this.replaceAccountId(args), '0']],
        },
        this.httpHeaders,
      )
      .then(response => response.methodResponses[0][1]);
  }

  public email_get(args: IGetEmailArguments): Promise<IEmailGetResponse> {
    const apiUrl = this.overriddenApiUrl || this.getSession().apiUrl;
    return this.httpRequest
      .post<{
        sessionState: string;
        methodResponses: [['Email/get', IEmailGetResponse, string]];
      }>(
        apiUrl,
        {
          using: this.getCapabilities(),
          methodCalls: [['Email/get', this.replaceAccountId(args), '0']],
        },
        this.httpHeaders,
      )
      .then(response => response.methodResponses[0][1]);
  }

  public email_set(
    args: ISetArguments<IEmailSetProperties>,
  ): Promise<IEmailSetResponse<IEmailProperties>> {
    const apiUrl = this.overriddenApiUrl || this.getSession().apiUrl;
    return this.httpRequest
      .post<{
        sessionState: string;
        methodResponses: [['Email/set', IEmailSetResponse<IEmailProperties>, string]];
      }>(
        apiUrl,
        {
          using: this.getCapabilities(),
          methodCalls: [['Email/set', this.replaceAccountId(args), '0']],
        },
        this.httpHeaders,
      )
      .then(response => response.methodResponses[0][1]);
  }

  private replaceAccountId<U extends { accountId: string }>(input: U): U {
    return {
      ...input,
      accountId: input.accountId !== null ? input.accountId : this.getFirstAccountId(),
    };
  }

  private getCapabilities() {
    return this.session?.capabilities ? Object.keys(this.session.capabilities) : this.DEFAULT_USING;
  }
}
