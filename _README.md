## Deploy the sample application

```bash
sam build
sam deploy --guided
```

```bash
sam build
sam local start-api
```

```bash
sam delete --stack-name notes
```

The first command will build the source of your application. The second command
will package and deploy your application to AWS, with a series of prompts:

- **Stack Name**: The name of the stack to deploy to CloudFormation. This should
  be unique to your account and region, and a good starting point would be
  something matching your project name.
- **AWS Region**: The AWS region you want to deploy your app to.
- **Confirm changes before deploy**: If set to yes, any change sets will be
  shown to you before execution for manual review. If set to no, the AWS SAM CLI
  will automatically deploy application changes.
- **Allow SAM CLI IAM role creation**: Many AWS SAM templates, including this
  example, create AWS IAM roles required for the AWS Lambda function(s) included
  to access AWS services. By default, these are scoped down to minimum required
  permissions. To deploy an AWS CloudFormation stack which creates or modifies
  IAM roles, the `CAPABILITY_IAM` value for `capabilities` must be provided. If
  permission isn't provided through this prompt, to deploy this example you must
  explicitly pass `--capabilities CAPABILITY_IAM` to the `sam deploy` command.
- **Save arguments to samconfig.toml**: If set to yes, your choices will be
  saved to a configuration file inside the project, so that in the future you
  can just re-run `sam deploy` without parameters to deploy changes to your
  application.