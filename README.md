# p

- https://g2g4il80hb.execute-api.us-east-1.amazonaws.com/Stage
- https://aws.amazon.com/blogs/database/choosing-the-right-dynamodb-partition-key/
- https://medium.com/@dimi_2011/developing-and-debugging-lambda-functions-with-dynamodb-locally-e8e1ee35fbb6

- Alternative to SAM https://docs.aws.amazon.com/cdk/v2/guide/home.html

- Install Dynamodb Local
  https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.DownloadingAndRunning.html
  - Start DB
    `java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb`


- Build and start the app `sam build && sam local start-api`
