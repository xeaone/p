import { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from 'aws-lambda';
import noteDelete from './routes/note-delete';
import noteCreate from './routes/note-create';
import noteUpdate from './routes/note-update';
import noteRead from './routes/note-read';
import signUp from './routes/sign-up';
import signIn from './routes/sign-in';
import validate from './validate';
import path from 'path';
import fs from 'fs';

const rootPage = async () => {
    return {
        statusCode: 200,
        headers: { 'content-type': 'text/html' },
        body: /*html*/`
        <html lang="en">
            <head>
                <base href="/Stage/">
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
        `,
    };
};

let clientJsFile: string;
const clientJs = async () => {
    try {
        clientJsFile = clientJsFile ?? await fs.promises.readFile(path.resolve('./client.js'), { encoding: 'utf8' });
        return { statusCode: 200, headers: { 'content-type': 'text/javascript' }, body: clientJsFile };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify(error) };
    }
};

let clientCssFile: string;
const clientCss = async () => {
    try {
        clientCssFile = clientCssFile ?? await fs.promises.readFile(path.resolve('./client.css'), { encoding: 'utf8' });
        return { statusCode: 200, headers: { 'content-type': 'text/css' }, body: clientCssFile };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify(error) };
    }
};

export const main: Handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const method = event.httpMethod;
    const pathname = event.path.replace(/\/(Stage|Pro)\/?/, '/');

    let body;
    try {
        body = JSON.parse(event.body || '{}');
    } catch {
        return { statusCode: 400, body: JSON.stringify({ message: 'body not valid' }) };
    }

    try {
        if (
            method === 'GET' &&
            pathname === '/' || pathname === '/sign-up' || pathname === '/sign-in'
        ) {
            return rootPage();
        } else if (method === 'GET' && pathname === '/client.js') {
            return clientJs();
        } else if (method === 'GET' && pathname === '/client.css') {
            return clientCss();
        } else if (method === 'POST' && pathname === '/api/sign-up') {
            return signUp(body);
        } else if (method === 'POST' && pathname === '/api/sign-in') {
            return signIn(body);
        } else {
            const credential = await validate(event);
            if (credential) {
                if (method === 'POST' && pathname === '/api/note') {
                    return noteCreate(body, credential);
                } else if (method === 'GET' && pathname === '/api/note') {
                    return noteRead(body, credential);
                } else if (method === 'PUT' && pathname === '/api/note') {
                    return noteUpdate(body, credential);
                } else if (method === 'DELETE' && pathname === '/api/note') {
                    return noteDelete(body, credential);
                } else {
                    return { statusCode: 404, body: JSON.stringify({ message: 'Not Found' }) };
                }
            } else {
                return { statusCode: 401, body: JSON.stringify({ message: 'Unauthorized' }) };
            }
        }
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify(error) };
    }

};
