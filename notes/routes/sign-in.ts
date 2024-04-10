import { CognitoIdentityProviderClient, InitiateAuthCommand, AuthFlowType } from '@aws-sdk/client-cognito-identity-provider';
import { APIGatewayProxyResult } from 'aws-lambda';

export default async (data: any): Promise<APIGatewayProxyResult> => {

    if (!data.email) return { statusCode: 400, body: JSON.stringify({ message: 'email required' }) };
    if (!data.password) return { statusCode: 400, body: JSON.stringify({ message: 'password required' }) };

    const region = 'us-east-1';
    const ClientId = '597jfj5s65em52ch5jdrjmkcv4';
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

    console.log(response);

    return { statusCode: 200, body: JSON.stringify(response) };
    // return { statusCode: 200, body: JSON.stringify({ message: 'signed in' }) };
};
