import * as React from 'react';
import { Html, Link, Text, Body, Container } from 'react-email';

interface VerifyEmailTemplateProps {
    name: string;
    verifyLink: string;
}

export const VerifyEmailTemplate: React.FC<VerifyEmailTemplateProps> = ({ name, verifyLink }) => (
    <Html>
        <Body>
            <Container>
                <Text>Hello {name},</Text>
                <Text>
                    Welcome to Grafier! Please click the link below to verify your email address:
                </Text>
                <Link href={verifyLink}>{verifyLink}</Link>
            </Container>
        </Body>
    </Html>
);
