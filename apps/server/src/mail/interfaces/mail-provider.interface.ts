export interface SendMailOptions {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    from?: string;
}

export interface MailProvider {
    send(options: SendMailOptions): Promise<void>;
}

export const MAIL_PROVIDER = Symbol('MAIL_PROVIDER');
