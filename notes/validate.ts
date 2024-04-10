import { APIGatewayProxyEvent } from 'aws-lambda';

export default (event: APIGatewayProxyEvent) => {
    console.log(event);
}