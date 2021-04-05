import { Client } from '../src';
import { AxiosTransport } from '../src/utils/axios-transport';
import axios from 'axios';

describe('jmap-client-ts unittests', () => {
  const axiosTransport = new AxiosTransport(axios);
  const mockTransportGet = jest.fn();
  const mockTransportPost = jest.fn();

  axiosTransport.get = mockTransportGet;
  axiosTransport.post = mockTransportPost;

  const client = new Client({
    sessionUrl: 'session-url',
    accessToken: '',
    httpHeaders: {},
    overriddenApiUrl: 'api-url',
    transport: axiosTransport,
  });

  beforeEach(async () => {
    mockTransportGet.mockClear();
    mockTransportPost.mockClear();
  });

  it('email submission set request is correct', () => {
    mockTransportPost.mockReturnValueOnce(Promise.resolve());

    client.emailSubmission_set({
      accountId: 'random-account-id',
      create: {
        random: {
          emailId: 'random-id',
        },
      },
    });

    expect(mockTransportPost.mock.calls[0][1].methodCalls).toStrictEqual([
      [
        'EmailSubmission/set',
        {
          accountId: 'random-account-id',
          create: {
            random: {
              emailId: 'random-id',
            },
          },
        },
        '0',
      ],
    ]);
  });

  it('email submission get request is correct', () => {
    mockTransportPost.mockReturnValueOnce(Promise.resolve());

    client.emailSubmission_get({
      accountId: 'random-account-id',
      ids: ['random-id1', 'random-id2'],
    });

    expect(mockTransportPost.mock.calls[0][1].methodCalls).toStrictEqual([
      [
        'EmailSubmission/get',
        {
          accountId: 'random-account-id',
          ids: ['random-id1', 'random-id2'],
        },
        '0',
      ],
    ]);
  });

  it('email submission changes request is correct', () => {
    mockTransportPost.mockReturnValueOnce(Promise.resolve());

    client.emailSubmission_changes({
      accountId: 'random-account-id',
      sinceState: 'state1',
    });

    expect(mockTransportPost.mock.calls[0][1].methodCalls).toStrictEqual([
      [
        'EmailSubmission/changes',
        {
          accountId: 'random-account-id',
          sinceState: 'state1',
        },
        '0',
      ],
    ]);
  });
});
