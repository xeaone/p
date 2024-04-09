import { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from 'aws-lambda';
import { DynamoDBClient, PutItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';

const user = 'alexelias';
const TableName = 'notes-NotesDatabase-1BJHU2YMGWU32';

const DynamoClient = new DynamoDBClient({
    region: 'us-east-1',
});

const createNote = async (data: Record<string, string>): Promise<APIGatewayProxyResult> => {

    if (!data.content) {
        return { statusCode: 400, body: JSON.stringify({ message: 'body content required' }) };
    }

    try {
        await DynamoClient.send(new PutItemCommand({
            TableName,
            Item: {
                user: { S: user },
                note: { S: crypto.randomUUID() },
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

export const main: Handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const method = event.httpMethod;
    const path = event.path;

    let body;
    try {
        body = JSON.parse(event.body || '{}');
    } catch {
        return { statusCode: 400, body: JSON.stringify({ message: 'body type not valid' }) };
    }

    if (method === 'POST' && path === '/note') {
        return createNote(body);
    } else {
        return {
            statusCode: 404,
            body: 'Not Found'
        };
    }
};
