import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { MailProvider, SendMailOptions } from '../interfaces/mail-provider.interface';

@Injectable()
export class ResendProvider implements MailProvider {
    private resend: Resend;

    constructor(private config: ConfigService) {
        this.resend = new Resend(this.config.getOrThrow('RESEND_API_KEY'));
    }

    async send(options: SendMailOptions): Promise<void> {
        const { error } = await this.resend.emails.send({
            from: options.from ?? this.config.getOrThrow('RESEND_MAIL_FROM'),
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text,
        });

        if (error) {
            throw new InternalServerErrorException(`Failed to send email: ${error.message}`);
        }
    }
}
