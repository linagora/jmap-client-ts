import { defer, Observable, Subject } from 'rxjs';
import { Client } from '.';
import { ENTITY_TYPES, IEntityType, IStateChange, IWebSocketPushEnable } from './types';
import { Transport } from './utils/transport';
import * as ws from 'isomorphic-ws';

export class PushClient {
  private client: Client;
  private transport: Transport;
  private httpHeaders: { [headerName: string]: string };
  private webSocket?: ws;
  private webSocketSubjects: { [_ in IEntityType]: Subject<{ [accountId: string]: string }> };

  private started?: Promise<void>;
  private enabledDataTypes: { [_ in IEntityType]?: boolean };

  constructor({
    client,
    transport,
    httpHeaders,
  }: {
    client: Client;
    transport: Transport;
    httpHeaders: { [headerName: string]: string };
  }) {
    this.client = client;
    this.transport = transport;
    this.httpHeaders = httpHeaders;
    this.webSocketSubjects = {
      Mailbox: new Subject(),
      Email: new Subject(),
      EmailSubmission: new Subject(),
    };
    this.enabledDataTypes = {};
  }

  public start(): Promise<void> {
    if (!this.started) {
      this.started = new Promise(resolve => {
        this.transport
          .post<{
            value: string;
          }>(
            this.client.getSession().capabilities['com:linagora:params:jmap:ws:ticket']
              .generationEndpoint,
            '',
            this.httpHeaders,
          )
          .then(response => {
            const ticket = response.value;
            const pushUrl = this.client.getSession().capabilities['urn:ietf:params:jmap:websocket']
              .url;
            const webSocket = new ws(`${pushUrl}?ticket=${ticket}`);
            webSocket.onopen = () => {
              this.webSocket = webSocket;
              this.sendSubscriptions(webSocket);
              resolve();
            };
            webSocket.onclose = () => {
              for (const subject of Object.values(this.webSocketSubjects)) {
                subject.complete();
              }

              delete this.webSocket;
            };
            webSocket.onmessage = message => {
              const data = JSON.parse(message.data as string);
              if (data['@type'] == 'StateChange') {
                for (const entityType of ENTITY_TYPES) {
                  if (this.stateChangeContainsEntityType(data, entityType)) {
                    this.webSocketSubjects[entityType].next(
                      this.transformStateChange(data, entityType),
                    );
                  }
                }
              }
            };
            webSocket.onerror = event => {
              console.log(`Error with websocket: ${JSON.stringify(event)}`);
              for (const subject of Object.values(this.webSocketSubjects)) {
                subject.error(event);
              }

              delete this.webSocket;
            };
          });
      });
    }

    return this.started;
  }

  public stop(): void {
    this.webSocket?.close();
  }

  public mailbox(): Observable<{ [accountId: string]: string }> {
    return this.pushForEntityType('Mailbox');
  }

  public email(): Observable<{ [accountId: string]: string }> {
    return this.pushForEntityType('Email');
  }

  public emailSubmission(): Observable<{ [accountId: string]: string }> {
    return this.pushForEntityType('EmailSubmission');
  }

  private pushForEntityType(entityType: IEntityType): Observable<{ [accountId: string]: string }> {
    return defer(() => {
      if (!this.enabledDataTypes[entityType]) {
        this.enabledDataTypes[entityType] = true;

        if (this.webSocket) {
          this.sendSubscriptions(this.webSocket);
        }
      }

      return this.webSocketSubjects[entityType].asObservable();
    });
  }

  private sendSubscriptions(webSocket: ws) {
    const payload: IWebSocketPushEnable = {
      '@type': 'WebSocketPushEnable',
      dataTypes: Object.keys(this.enabledDataTypes),
    };
    webSocket.send(JSON.stringify(payload));
  }

  private stateChangeContainsEntityType(stateChange: IStateChange, type: IEntityType): boolean {
    for (const accountId of Object.keys(stateChange.changed)) {
      if (stateChange.changed[accountId][type]) {
        return true;
      }
    }

    return false;
  }

  private transformStateChange(
    stateChange: IStateChange,
    type: IEntityType,
  ): { [accountId: string]: string } {
    const changedFlattened: { [accountId: string]: string } = {};

    for (const accountId of Object.keys(stateChange.changed)) {
      const entityState = stateChange.changed[accountId][type];
      if (entityState) {
        changedFlattened[accountId] = entityState;
      }
    }

    return changedFlattened;
  }
}
