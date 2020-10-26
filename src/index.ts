import { HttpRequest } from './http-request';
import { IGetArguments, IMailbox, IMailboxProperties, ISession } from './types';

export class Client {
  private readonly DEFAULT_USING = [
    'urn:ietf:params:jmap:core',
    'urn:ietf:params:jmap:mail',
  ];

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
    const sessionPromise = this.httpRequest.get<ISession>(
      this.sessionUrl,
      this.httpHeaders
    );
    return sessionPromise.then((session) => {
      this.session = session;
      return;
    });
  }

  public getSession(): ISession {
    if (!this.session) {
      throw new Error(
        'Undefined session, should call fetchSession and wait for its resolution'
      );
    }
    return this.session;
  }

  public mailbox_get(
    args: IGetArguments<IMailboxProperties>
  ): Promise<{
    accountId: string;
    state: string;
    list: IMailbox[];
    notFound: string;
  }> {
    const apiUrl = this.overriddenApiUrl || this.getSession().apiUrl;
    return this.httpRequest
      .post<{
        sessionState: string;
        methodResponses: [
          [
            'Mailbox/get',
            {
              accountId: string;
              state: string;
              list: IMailbox[];
              notFound: string;
            },
            string
          ]
        ];
      }>(
        apiUrl,
        {
          using: this.session?.capabilities
            ? Object.keys(this.session.capabilities)
            : this.DEFAULT_USING,
          methodCalls: [['Mailbox/get', args, '0']],
        },
        this.httpHeaders
      )
      .then((response) => response.methodResponses[0][1]);
  }
}
