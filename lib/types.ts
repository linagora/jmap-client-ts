export namespace Jmap {
    /**
     * [ name, arguments, id ]
     */
    export type Invocation = [
        string,
        {
            [name: string]: any;
        },
        string
    ]

    export type Request = {
        using: string[];
        methodCalls: Invocation[];
    }

    export type Capabilities = {
        maxSizeUpload: number;
        maxConcurrentUpload: number;
        maxSizeRequest: number;
        maxConcurrentRequests: number;
        maxCallsInRequest: number;
        maxObjectsInGet: number;
        maxObjectsInSet: number;
        collationAlgorithms: string[];
    };

    export type Account = {
        name: string;
        isPersonal: boolean;
        isReadOnly: boolean;
        accountCapabilities: { [key: string]: any };
    };

    export type Session = {
        capabilities: Capabilities;
        accounts: { [accountId: string]: Account };
        primaryAccounts: { [key: string]: string };
        username: string;
        apiUrl: string;
        downloadUrl: string;
        uploadUrl: string;
        eventSourceUrl: string;
        state: string;
    };

    export type Emailer = string;

    export type EmailHeader = string;

    export type Attachment = File;

    export type Email = {
        id: string;
        blobId: string;
        threadId: string;
        mailboxIds: { [key: string]: boolean };
        keywords: { [key: string]: boolean };
        from: Emailer[] | null;
        to: Emailer[] | null;
        subject: string;
        date: Date;
        size: number;
        preview: string;
        attachments: Attachment[] | null;
        createdModSeq: number;
        updatedModSeq: number;
        deleted: Date | null;
    };

    export type ThreadEmail = {
        id: string;
        mailboxIds: string[];
        isUnread: boolean;
        isFlagged: boolean;
    };

    export type Thread = {
        id: string;
        emails: ThreadEmail[];
        createdModSeq: number;
        updatedModSeq: number;
        deleted: Date | null;
    };

    export type Mailbox = {
        id: string;
        name: string;
        parentId: string | null;
        role: string;
        sortOrder: number;
        mayReadItems: boolean;
        mayAddItems: boolean;
        mayRemoveItems: boolean;
        mayCreateChild: boolean;
        mayRename: boolean;
        mayDelete: boolean;
        totalEmails: number;
        unreadEmails: number;
        totalThreads: number;
        unreadThreads: number;
        createdModSeq: number;
        updatedModSeq: number;
        updatedNotCounrsModSeq: number;
        deleted: Date | null;
        highestUID: number;
        emailHighestModSeq: number;
        emailListLowModSeq: number;
    }

    export type MaiboxEmailList = {
        id: string; // mailboxId . (Max_Int64 - EmailDate) . uid
        messageId: string;
        updatedModSeq: number; // Documentation says it is string, must be an error
        created: Date;
        deleted: Date | null;
    }

    export type EmailChangeLog = {
        id: string;
        created: string[];
        updated: string[];
        destroyed: string[];
    }

    export type ThreadChangeLog = {
        id: string;
        created: string[];
        updated: string[];
        destroyed: string[];
    }

    export type ThreadRef = {
        id: string; // hash(rfc822id) . hash(subject)
        threadId: string;
        lastSeen: Date;
    }

    export type HighLowModSeqCache = {
        highModSeq: number;
        highModSeqEmail: number;
        highModSeqThread: number;
        highModSeqMailbox: number;
        lowModSeqEmail: number;
        lowModSeqThread: number;
        lowModSeqMailbox: number;
    }

    export type Message = {
        htmlBody: string;
    }

    export type EmailBodyValue = {
        value: string;
        isEncodingProblem: boolean;
        isTruncated: boolean;
    }

    export type EmailBodyPart = {
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
        subParts: EmailBodyPart[] | null;
        bodyStructure: EmailBodyPart;
        bodyValues: { [key: string]: EmailBodyValue };
        textBody: EmailBodyPart[]; // text/plain
        htmlBody: EmailBodyPart[]; // text/html
        attachments: EmailBodyPart[];
        hasAttachment: boolean;
        preview: string;
    }
}