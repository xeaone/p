# Note App Aws Cloud

- https://g2g4il80hb.execute-api.us-east-1.amazonaws.com/Stage
- https://aws.amazon.com/blogs/database/choosing-the-right-dynamodb-partition-key/
- https://medium.com/@dimi_2011/developing-and-debugging-lambda-functions-with-dynamodb-locally-e8e1ee35fbb6

### Deploy

```bash
sam build && sam deploy --guided
```

### Run Locally

```bash
# need for first time if not started on system
sudo service docker start
sam build && sam local start-api
```

### Delete

```bash
sam delete --stack-name notes
```
