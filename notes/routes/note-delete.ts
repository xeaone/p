import { DeleteItemCommand, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyResult } from 'aws-lambda';
import { User, Note } from '../types';

export default async (user: User, data: Note): Promise<APIGatewayProxyResult> => {

    if (!data.note) return { statusCode: 400, body: JSON.stringify({ message: 'note required' }) };

    try {
        const DynamoClient = new DynamoDBClient({ region: 'us-east-1' });
        await DynamoClient.send(new DeleteItemCommand({
            TableName: 'notes',
            Key: {
                user: { S: user },
                note: { S: data.note },
            }
        }));
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify(error) };
    }

    return { statusCode: 200, body: JSON.stringify({ message: 'note deleted' }) };
};