# Notes App
AWS Cloud 

### Resources

- https://aws.amazon.com/blogs/database/choosing-the-right-dynamodb-partition-key/
- https://medium.com/@dimi_2011/developing-and-debugging-lambda-functions-with-dynamodb-locally-e8e1ee35fbb6

### Deploy

- https://g2g4il80hb.execute-api.us-east-1.amazonaws.com/Stage

```bash
sh deploy.sh
```

### Watch

- http://localhost:3000/Stage/

```bash
sh watch.sh
```

### Delete

```bash
sam delete --stack-name notes
```
