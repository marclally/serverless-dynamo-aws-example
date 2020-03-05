"use strict";

const uuid = require("uuid");
const AWS = require("aws-sdk");

AWS.config.setPromisesDependency(require("bluebird"));

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.book = (event, context, callback) => {
  const params = {
    TableName: process.env.BOOKS_TABLE,
    Key: {
      id: event.pathParameters.bookUuid
    }
  };

  dynamoDb
    .get(params)
    .promise()
    .then(result => {
      const response = {
        statusCode: 200,
        body: JSON.stringify(result.Item)
      };
      callback(null, response);
    })
    .catch(error => {
      console.error(error);
      callback(new Error("Couldn't fetch book."));
      return;
    });
};
