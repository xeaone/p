import { AdminConfirmSignUpCommand, CognitoIdentityProviderClient, SignUpCommand } from '@aws-sdk/client-cognito-identity-provider';
import { APIGatewayProxyResult } from 'aws-lambda';

export default async (data: any): Promise<APIGatewayProxyResult> => {

    if (!data.email) return { statusCode: 400, body: JSON.stringify({ message: 'email required' }) };
    if (!data.password) return { statusCode: 400, body: JSON.stringify({ message: 'password required' }) };

    if (typeof data.email !== 'string') return { statusCode: 400, body: JSON.stringify({ message: 'email not valid' }) };
    if (typeof data.password !== 'string') return { statusCode: 400, body: JSON.stringify({ message: 'password not valid' }) };

    const region = 'us-east-1';
    const UserPoolId = 'us-east-1_k43mwMzDC';
    const ClientId = '597jfj5s65em52ch5jdrjmkcv4';
    const client = new CognitoIdentityProviderClient({ region });

    const signUpCommand = new SignUpCommand({
        ClientId,
        Username: data.email,
        Password: data.password,
        UserAttributes: [ { Name: 'email', Value: data.email } ],
    });
    const signUpResponse = await client.send(signUpCommand);
    console.log(signUpResponse);

    const confirmSignUpCommand = new AdminConfirmSignUpCommand({
        UserPoolId,
        Username: data.email,
    });
    const confirmSignUpResponse = await client.send(confirmSignUpCommand);
    console.log(confirmSignUpResponse);

    return { statusCode: 200, body: JSON.stringify({ message: 'signed up' }) };
};
