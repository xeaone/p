import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { CognitoIdTokenPayload } from 'aws-jwt-verify/jwt-model';
import { APIGatewayProxyResult } from 'aws-lambda';
import { TableName } from '../variables';
import { Note } from '../types';

export default async (data: Note, user: CognitoIdTokenPayload): Promise<APIGatewayProxyResult> => {

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
        const DynamoClient = new DynamoDBClient({ region: 'us-east-1' });
        await DynamoClient.send(new UpdateItemCommand({
            TableName,
            Key: {
                user: { S: user.sub },
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