import { DeleteItemCommand, DynamoDBClient, PutItemCommand, QueryCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from 'aws-lambda';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { User, Note } from './types';

import path from 'path';
import fs from 'fs';

const TableName = 'notes-NotesDatabase-1BJHU2YMGWU32';
const DynamoClient = new DynamoDBClient({ region: 'us-east-1' });

const noteQuery = async (user: User): Promise<Note[]> => {

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
        return result.Items.map(i => unmarshall(i) as Note)
    } else {
        return [];
    }
};

const createNote = async (user: User, data: Note): Promise<APIGatewayProxyResult> => {

    if (typeof data.title !== 'string') {
        return { statusCode: 400, body: JSON.stringify({ message: 'note title not valid' }) };
    }

    if (typeof data.content !== 'string') {
        return { statusCode: 400, body: JSON.stringify({ message: 'note content not valid' }) };
    }

    try {
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

const readNotes = async (user: User): Promise<APIGatewayProxyResult> => {

    let items: Note[];
    try {
        items = await noteQuery(user);
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify(error) };
    }

    return { statusCode: 200, body: JSON.stringify(items) };
};

const updateNote = async (user: User, data: Note): Promise<APIGatewayProxyResult> => {

    if (!data.note) {
        return { statusCode: 400, body: JSON.stringify({ message: 'note id required' }) };
    }

    if (typeof data.title !== 'string') {
        return { statusCode: 400, body: JSON.stringify({ message: 'note title not valid' }) };
    }

    if (typeof data.content !== 'string') {
        return { statusCode: 400, body: JSON.stringify({ message: 'note content not valid' }) };
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
                ':title': { S: data.title },
                ':content': { S: data.content },
            },
            ExpressionAttributeNames: {
                '#u': 'user',
                '#n': 'note',
                '#title': 'title',
                '#content': 'content',
                '#updated': 'updated',
            },
            UpdateExpression: 'SET #title = :title, #content = :content, #updated = :updated',
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

const rootPage = async () => {
    return {
        statusCode: 200,
        headers: { 'content-type': 'text/html' },
        body: /*html*/`
            <html lang="en">
            <head>

                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="color-scheme" content="light dark" />
                <script type="module" src="./client.js" defer></script>
                <link rel="stylesheet" href="./client.css" />
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css" />
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.colors.min.css" />
                <title>Notes</title>
            </head>
            <body>
                <main class="container"></main>
            </body>
        </html>
    `
    };
};

const clientJs = async () => {
    try {
        const body = await fs.promises.readFile(path.resolve('./client.js'), { encoding: 'utf8' });
        return { statusCode: 200, headers: { 'content-type': 'text/javascript' }, body };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify(error) };
    }
};

const clientCss = async () => {
    try {
        const body = await fs.promises.readFile(path.resolve('./client.css'), { encoding: 'utf8' });
        return { statusCode: 200, headers: { 'content-type': 'text/css' }, body };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify(error) };
    }
};

export const main: Handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const method = event.httpMethod;
    const pathname = event.path;
    const user = 'alexelias';

    let body;
    try {
        body = JSON.parse(event.body || '{}');
    } catch {
        return { statusCode: 400, body: JSON.stringify({ message: 'body not valid' }) };
    }

    if (method === 'GET' && pathname === '/') {
        return rootPage();
    } else if (method === 'GET' && pathname === '/client.js') {
        return clientJs();
    } else if (method === 'GET' && pathname === '/client.css') {
        return clientCss();
    } else if (method === 'POST' && pathname === '/note') {
        return createNote(user, body);
    } else if (method === 'GET' && pathname === '/notes') {
        return readNotes(user);
    } else if (method === 'PUT' && pathname === '/note') {
        return updateNote(user, body);
    } else if (method === 'DELETE' && pathname === '/note') {
        return deleteNote(user, body);
    } else {
        return { statusCode: 404, body: JSON.stringify({ message: 'Not Found' }) };
    }
};
