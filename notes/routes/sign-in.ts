import { CognitoIdentityProviderClient, InitiateAuthCommand, AuthFlowType } from '@aws-sdk/client-cognito-identity-provider';
import { APIGatewayProxyResult } from 'aws-lambda';
import { ClientId, region } from '../variables';

export default async (data: any): Promise<APIGatewayProxyResult> => {

    if (!data.email) return { statusCode: 400, body: JSON.stringify({ message: 'email required' }) };
    if (!data.password) return { statusCode: 400, body: JSON.stringify({ message: 'password required' }) };

    const client = new CognitoIdentityProviderClient({ region });
    const command = new InitiateAuthCommand({
        ClientId,
        AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
        AuthParameters: {
            USERNAME: data.email,
            PASSWORD: data.password,
        },
    });

    const response = await client.send(command);
    const statusCode = response.$metadata.httpStatusCode ?? 500;
    const token = response.AuthenticationResult?.IdToken;

    if (statusCode === 200 && token) {
        const headers = { 'set-cookie': `token=${token}; SameSite=Strict; Secure; HttpOnly;` };
        const body = JSON.stringify({ message: 'signed in' });
        return { statusCode, body, headers };
    } else {
        return { statusCode, body: JSON.stringify({ message: 'signed in' }) };
    }

};
