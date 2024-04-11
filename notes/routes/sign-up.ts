import { AdminConfirmSignUpCommand, CognitoIdentityProviderClient, SignUpCommand } from '@aws-sdk/client-cognito-identity-provider';
import { APIGatewayProxyResult } from 'aws-lambda';
import { ClientId, region, UserPoolId } from '../variables';

export default async (data: any): Promise<APIGatewayProxyResult> => {

    if (!data.email) return { statusCode: 400, body: JSON.stringify({ message: 'email required' }) };
    if (!data.password) return { statusCode: 400, body: JSON.stringify({ message: 'password required' }) };

    if (typeof data.email !== 'string') return { statusCode: 400, body: JSON.stringify({ message: 'email not valid' }) };
    if (typeof data.password !== 'string') return { statusCode: 400, body: JSON.stringify({ message: 'password not valid' }) };

    const client = new CognitoIdentityProviderClient({ region });

    const signUpCommand = new SignUpCommand({
        ClientId,
        Username: data.email,
        Password: data.password,
        UserAttributes: [ { Name: 'email', Value: data.email } ],
    });

    const signUpResponse = await client.send(signUpCommand);

    // should improve handling of errors
    if (signUpResponse.$metadata.httpStatusCode !== 200) {
        const statusCode = signUpResponse.$metadata.httpStatusCode ?? 500;
        return { statusCode, body: JSON.stringify({ message: 'sign up error' }) };
    }

    // this might not be required with the updated template.yaml AutoVerifiedAttributes
    const confirmSignUpCommand = new AdminConfirmSignUpCommand({
        UserPoolId,
        Username: data.email,
    });

    const confirmSignUpResponse = await client.send(confirmSignUpCommand);

    // should improve handling of errors
    if (confirmSignUpResponse.$metadata.httpStatusCode !== 200) {
        const statusCode = confirmSignUpResponse.$metadata.httpStatusCode ?? 500;
        return { statusCode, body: JSON.stringify({ message: 'confirm sign up error' }) };
    }

    return { statusCode: 200, body: JSON.stringify({ message: 'signed up' }) };
};
