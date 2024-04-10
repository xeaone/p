import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyResult } from 'aws-lambda';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { User, Note } from '../types';

export default async (user: User): Promise<APIGatewayProxyResult> => {

    let items: Note[] = [];
    try {
        const DynamoClient = new DynamoDBClient({ region: 'us-east-1' });
        const result = await DynamoClient.send(new QueryCommand({
            TableName: 'notes',
            ExpressionAttributeValues: {
                ':u': { S: user }
            },
            ExpressionAttributeNames: {
                '#u': 'user',
            },
            KeyConditionExpression:'#u = :u',
        }));

        if (result.Items) {
            items = result.Items.map(i => unmarshall(i) as Note)
        }

    } catch (error) {
        return { statusCode: 500, body: JSON.stringify(error) };
    }

    return { statusCode: 200, body: JSON.stringify(items) };
};