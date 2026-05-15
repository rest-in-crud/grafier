import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { render } from 'react-email';
import * as React from 'react';
import { MAIL_PROVIDER, MailProvider } from './interfaces/mail-provider.interface';
import { ForgotPasswordTemplate } from './templates/forgot-password.template';

@Injectable()
export class MailService {
    constructor(
        @Inject(MAIL_PROVIDER) private provider: MailProvider,
        private config: ConfigService,
    ) {}

    async sendForgotPasswordEmail(email: string, name: string, token: string) {
        const frontendUrl = this.config.getOrThrow<string>('URL_FRONTEND').replace(/\/$/, '');
        const resetLink = `${frontendUrl}/reset/${token}`;

        const html = await render(
            React.createElement(ForgotPasswordTemplate, {
                name,
                resetLink,
            }),
        );

        await this.provider.send({
            to: email,
            subject: 'Reset your password',
            html,
        });
    }
}
