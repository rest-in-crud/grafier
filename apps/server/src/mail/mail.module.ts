import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MAIL_PROVIDER } from './interfaces/mail-provider.interface';
import { ResendProvider } from './providers/resend.provider';
import { MailService } from './mail.service';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: MAIL_PROVIDER,
            useClass: ResendProvider,
        },
        MailService,
    ],
    exports: [MailService],
})
export class MailModule {}
