import { DeleteItemCommand, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { CognitoIdTokenPayload } from 'aws-jwt-verify/jwt-model';
import { APIGatewayProxyResult } from 'aws-lambda';
import { TableName } from '../variables';
import { Note } from '../types';

export default async (data: Note, user: CognitoIdTokenPayload): Promise<APIGatewayProxyResult> => {

    if (!data.note) return { statusCode: 400, body: JSON.stringify({ message: 'note required' }) };

    try {
        const DynamoClient = new DynamoDBClient({ region: 'us-east-1' });
        await DynamoClient.send(new DeleteItemCommand({
            TableName,
            Key: {
                user: { S: user.sub },
                note: { S: data.note },
            }
        }));
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify(error) };
    }

    return { statusCode: 200, body: JSON.stringify({ message: 'note deleted' }) };
};