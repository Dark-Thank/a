const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { S3Client } = require("@aws-sdk/client-s3");
const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");

require('dotenv').config();

const info = {
  region: "ap-southeast-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
};

const s3Client = new S3Client(info);
const dynamoDbClient = DynamoDBDocument.from(new DynamoDBClient(info));

module.exports = {
  s3Client,
  dynamoDbClient,
};


//AKIAQGZG3IEHN3XT77FD
//BqUusRPYH9UmAJ65UU/EtglJVUUm1wuISKk2+yYH
//Students
//bucketstudentdarkthank



