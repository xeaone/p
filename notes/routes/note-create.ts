import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyResult } from 'aws-lambda';
import { Note } from '../types';
import { region, TableName } from '../variables';
import { CognitoIdTokenPayload } from 'aws-jwt-verify/jwt-model';

export default async (data: Note, user: CognitoIdTokenPayload): Promise<APIGatewayProxyResult> => {

    if (typeof data.title !== 'string') {
        return { statusCode: 400, body: JSON.stringify({ message: 'note title not valid' }) };
    }

    if (typeof data.content !== 'string') {
        return { statusCode: 400, body: JSON.stringify({ message: 'note content not valid' }) };
    }

    try {
        const DynamoClient = new DynamoDBClient({ region });
        await DynamoClient.send(new PutItemCommand({
            TableName,
            Item: {
                user: { S: user.sub },
                note: { S: crypto.randomUUID() },
                title: { S: data.title },
                content: { S: data.content },
                created: { N: `${Date.now()}` },
                updated: { N: `${Date.now()}` },
            },
        }));
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify(error) };
    }

    return { statusCode: 200, body: JSON.stringify({ message: 'note created' }) };
};