import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyResult } from 'aws-lambda';
import { User, Note } from '../types';

export default async (user: User, data: Note): Promise<APIGatewayProxyResult> => {

    if (typeof data.title !== 'string') {
        return { statusCode: 400, body: JSON.stringify({ message: 'note title not valid' }) };
    }

    if (typeof data.content !== 'string') {
        return { statusCode: 400, body: JSON.stringify({ message: 'note content not valid' }) };
    }

    try {
        const TableName = 'notes';
        const DynamoClient = new DynamoDBClient({ region: 'us-east-1' });
        await DynamoClient.send(new PutItemCommand({
            TableName,
            Item: {
                user: { S: user },
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