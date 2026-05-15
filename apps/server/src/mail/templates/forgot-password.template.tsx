import * as React from 'react';
import { Html, Link, Text, Body, Container } from 'react-email';

interface ForgotPasswordTemplateProps {
    name: string;
    resetLink: string;
}

export const ForgotPasswordTemplate: React.FC<ForgotPasswordTemplateProps> = ({
    name,
    resetLink,
}) => (
    <Html>
        <Body>
            <Container>
                <Text>Hello {name},</Text>
                <Text>Click the link below to reset your password:</Text>
                <Link href={resetLink}>{resetLink}</Link>
            </Container>
        </Body>
    </Html>
);
