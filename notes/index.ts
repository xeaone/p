import { DeleteItemCommand, DynamoDBClient, PutItemCommand, QueryCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from 'aws-lambda';
import { unmarshall } from '@aws-sdk/util-dynamodb';

type User = string;
interface Note {
    // user: string,
    note: string,
    content: string,
    created: number,
    updated: number,
}

const TableName = 'notes-NotesDatabase-1BJHU2YMGWU32';
const DynamoClient = new DynamoDBClient({ region: 'us-east-1' });

const createNote = async (user: User, data: Note): Promise<APIGatewayProxyResult> => {

    if (typeof data.content !== 'string') {
        return { statusCode: 400, body: JSON.stringify({ message: 'note content not valid' }) };
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

const readNotes = async (user: User): Promise<APIGatewayProxyResult> => {

    const items: Note[] = [];
    try {
        const result = await DynamoClient.send(new QueryCommand({
            TableName,
            ExpressionAttributeValues: {
                ':u': { S: user }
            },
            ExpressionAttributeNames: {
                '#u': 'user',
            },
            KeyConditionExpression:'#u = :u',
        }));

        if (result.Items) {
            items.push(...result.Items.map(i => unmarshall(i) as Note));
        }
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify(error) };
    }

    return { statusCode: 200, body: JSON.stringify(items) };
};

const updateNote = async (user: User, data: Note): Promise<APIGatewayProxyResult> => {

    if (!data.note) {
        return { statusCode: 400, body: JSON.stringify({ message: 'note id required' }) };
    }

    if (typeof data.content !== 'string') {
        return { statusCode: 400, body: JSON.stringify({ message: 'note type not valid' }) };
    }

    try {
        await DynamoClient.send(new UpdateItemCommand({
            TableName,
            Key: {
                user: { S: user },
                note: { S: data.note },
            },
            ExpressionAttributeValues: {
                ':updated': { N: `${Date.now()}` },
                ':content': { S: data.content },
            },
            ExpressionAttributeNames: {
                '#u': 'user',
                '#n': 'note',
                '#updated': 'updated',
                '#content': 'content',
            },
            UpdateExpression: 'SET #updated = :updated, #content = :content',
            ConditionExpression: 'attribute_exists(#u) AND attribute_exists(#n)',
        }));
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify(error) };
    }

    return { statusCode: 200, body: JSON.stringify({ message: 'updated note' }) };
};

const deleteNote = async (user: User, data: Note): Promise<APIGatewayProxyResult> => {

    if (!data.note) return { statusCode: 400, body: JSON.stringify({ message: 'note required' }) };

    try {
        await DynamoClient.send(new DeleteItemCommand({
            TableName,
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

export const main: Handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const method = event.httpMethod;
    const path = event.path;
    const user = 'alexelias';

    let body;
    try {
        body = JSON.parse(event.body || '{}');
    } catch {
        return { statusCode: 400, body: JSON.stringify({ message: 'body not valid' }) };
    }

    if (method === 'POST' && path === '/note') {
        return createNote(user, body);
    } else if (method === 'GET' && path === '/notes') {
        return readNotes(user);
    } else if (method === 'PUT' && path === '/note') {
        return updateNote(user, body);
    } else if (method === 'DELETE' && path === '/note') {
        return deleteNote(user, body);
    } else {
        return { statusCode: 404, body: JSON.stringify({ message: 'Not Found' }) };
    }
};
