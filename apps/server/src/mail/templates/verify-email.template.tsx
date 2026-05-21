import * as React from 'react';
import {
    Html,
    Link,
    Text,
    Body,
    Container,
    Section,
    Heading,
    Hr,
    Head,
    Preview,
    Font,
} from 'react-email';

interface VerifyEmailTemplateProps {
    name: string;
    verifyLink: string;
}

const main = {
    backgroundColor: '#050505',
    fontFamily:
        '"Inter Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#f2f2f2',
    padding: '40px 0',
};

const container = {
    backgroundColor: '#0a0a0a',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    margin: '0 auto',
    padding: '44px 44px 40px',
    width: '560px',
};

const asciiLogo = {
    fontFamily: '"JetBrains Mono Variable", ui-monospace, "SF Mono", Menlo, monospace',
    fontSize: '10px',
    lineHeight: '1.1',
    color: '#8a8a8a',
    whiteSpace: 'pre' as const,
    marginBottom: '32px',
};

const h1 = {
    fontFamily: '"JetBrains Mono Variable", ui-monospace, "SF Mono", Menlo, monospace',
    fontSize: '14px',
    fontWeight: '500',
    letterSpacing: '0.22em',
    textTransform: 'uppercase' as const,
    margin: '0 0 24px',
};

const text = {
    fontSize: '13px',
    lineHeight: '1.55',
    color: '#8a8a8a',
    margin: '0 0 32px',
};

const buttonContainer = {
    textAlign: 'center' as const,
    margin: '0 0 32px',
};

const button = {
    backgroundColor: '#f2f2f2',
    color: '#000',
    fontFamily: '"JetBrains Mono Variable", ui-monospace, "SF Mono", Menlo, monospace',
    fontSize: '11px',
    fontWeight: '500',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.2em',
    padding: '13px 18px',
    textDecoration: 'none',
    display: 'inline-block',
};

const hr = {
    borderColor: 'rgba(255, 255, 255, 0.08)',
    margin: '32px 0 24px',
};

const header = {
    fontFamily: '"JetBrains Mono Variable", ui-monospace, "SF Mono", Menlo, monospace',
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '0.25em',
    textTransform: 'uppercase' as const,
    color: '#f2f2f2',
    margin: '0',
};

const separator = {
    borderTop: '1px solid rgba(255, 255, 255, 0.25)',
    margin: '12px 0 32px',
};

const footerSeparator = {
    borderTop: '1px solid rgba(255, 255, 255, 0.25)',
    margin: '32px 0 12px',
};

const footer = {
    fontFamily: '"JetBrains Mono Variable", ui-monospace, "SF Mono", Menlo, monospace',
    fontSize: '10px',
    color: '#555',
    letterSpacing: '0.05em',
    lineHeight: '1.5',
};

export const VerifyEmailTemplate: React.FC<VerifyEmailTemplateProps> = ({ name, verifyLink }) => (
    <Html>
        <Head>
            <Font
                fontFamily="Inter Variable"
                fallbackFontFamily="sans-serif"
                webFont={{
                    url: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.woff2',
                    format: 'woff2',
                }}
                fontWeight={400}
                fontStyle="normal"
            />
            <Font
                fontFamily="JetBrains Mono Variable"
                fallbackFontFamily="monospace"
                webFont={{
                    url: 'https://cdn.jsdelivr.net/fontsource/fonts/jetbrains-mono@latest/latin-500-normal.woff2',
                    format: 'woff2',
                }}
                fontWeight={500}
                fontStyle="normal"
            />
        </Head>
        <Preview>Verify your email address - Grafier</Preview>
        <Body style={main}>
            <Container style={container}>
                <Section>
                    <Text style={header}>GRAFIER</Text>
                    <Section style={separator} />

                    <Heading style={h1}>Verification Required</Heading>
                    <Text style={text}>
                        Hello,{' '}
                        <strong>
                            <em>{name}</em>
                        </strong>
                        <br />
                        <br />
                        Welcome to Grafier. To finalize your account setup and access the canvas,
                        please verify your email address using the link below.
                    </Text>
                    <Section style={buttonContainer}>
                        <Link href={verifyLink} style={button}>
                            Verify Email Address
                        </Link>
                    </Section>
                    <Text style={text}>
                        If you did not request this, please ignore this email. This link will expire
                        shortly for security purposes.
                    </Text>
                    <Section style={footerSeparator} />
                    <Text style={footer}>© {new Date().getFullYear()} GRAFIER // SYSTEM_MSG</Text>
                </Section>
            </Container>
        </Body>
    </Html>
);
