# Notes App

https://me4mfu1hfc.execute-api.us-east-1.amazonaws.com/Stage/

This is a Notes application that has the ability to Sign Up a User, Sign In a
User, Create Notes, Read Notes, Update Notes, and Delete Notes. The backend uses
AWS API Gateway, Lambada, Cognito, and Dynamodb. The frontend uses React and
Pico. For authentication/authorization Cognito generated IDTokens are stored in
Cookies and validated on in the `notes/validation.ts` using
[aws-jwt-verify](https://github.com/awslabs/aws-jwt-verify).

- No cache optimizations.
- Sign up requires an email address and password of 6 characters or more.

### Architecture

- AWS API Gateway
- AWS Lambada
- AWS Cognito
- AWS Dynamodb
  - Data Model
    - PrimaryKey: user
    - SortKey: note

### Deploy

This app is deployed at this URL. If you self deploy you will need will receive
a output log with a new URL.

- https://me4mfu1hfc.execute-api.us-east-1.amazonaws.com/Stage/

```bash
sh deploy.sh
```

### Test

If you self deploy you will need to modify to variables `UserPoolId` and
`ClientId` in the notes/variables.ts

- http://localhost:3000/Stage/

```bash
sh test.sh
```

### Build

Bundles and transpiles `notes/server.ts` and `notes/client.tsx`. Then sam
validates, and sam builds.

```bash
sh build.sh
```

### Delete

```bash
sam delete --stack-name notes
```
