import { CognitoIdTokenPayload } from 'aws-jwt-verify/jwt-model';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { ClientId, UserPoolId } from './variables';
import { APIGatewayProxyEvent } from 'aws-lambda';

const verifier = CognitoJwtVerifier.create({
    userPoolId: UserPoolId,
    tokenUse: 'id',
    clientId: ClientId,
});

export default async (event: APIGatewayProxyEvent): Promise<CognitoIdTokenPayload | void> => {

    const cookieEntries = event.multiValueHeaders.Cookie?.map(cookie => cookie.split('=')) ?? [];
    const cookies = Object.fromEntries(cookieEntries);
    const { token } = cookies;

    if (!token) {
        return;
    }

    try {
        const payload = await verifier.verify(token);
        return payload;
    } catch {
        return;
    }
}