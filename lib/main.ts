import { Jmap } from './types';

export class Client {
    sessionUrl: string;

    session: Jmap.Session = null;

    Client(sessionUrl: string) {
        this.sessionUrl = sessionUrl;
    }

    fetchSession() {
        const request = new XMLHttpRequest();

        request.setRequestHeader("Accept", "application/json;jmapVersion=rfc-8620")

        request.open("GET", this.sessionUrl);

        request.onreadystatechange = () => {
            if (request.readyState === XMLHttpRequest.DONE) {
                let status = request.status;
                if (status === 0 || (status >= 200 && status < 400)) {
                    this.session = JSON.parse(request.responseText);
                }
            }
        };
        request.send();
    }

    clearSession() {
        this.session = null;
    }

    // TODO Find a good way to chain methods
    Mailbox_get = (args: { accountId: string, ids: string[], properties: string[] | null}, methodId: string) => {
        return this.invoke(["Mailbox/get", args, methodId]);
    };

    invoke = (invocation: Jmap.Invocation) => {
        return new Promise((resolve, reject) => {
            const request = new XMLHttpRequest();

            request.setRequestHeader("Accept", "application/json;jmapVersion=rfc-8620")

            request.open("POST", this.session.apiUrl);

            request.onreadystatechange = () => {
                if (request.readyState === XMLHttpRequest.DONE) {
                    let status = request.status;
                    if (status === 0 || (status >= 200 && status < 300)) {
                        resolve(JSON.parse(request.responseText));
                    } else {
                        reject(request.responseText);
                    }
                }
            };

            request.send(JSON.stringify(invocation));
        });
    }
}