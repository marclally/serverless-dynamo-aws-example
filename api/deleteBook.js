"use strict";

const uuid = require("uuid");
const AWS = require("aws-sdk");

AWS.config.setPromisesDependency(require("bluebird"));

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.delete = (event, context, callback) => {
  const params = {
    TableName: process.env.BOOKS_TABLE,
    Key: {
      id: event.pathParameters.bookUuid
    }
  };

  dynamoDb
    .delete(params)
    .promise()
    .then(result => {
      const response = {
        statusCode: 200,
        body: JSON.stringify(params.Key.id)
      };
      callback(null, response);
    })
    .catch(error => {
      console.error(error);
      callback(new Error("Couldn't delete book."));
      return;
    });
};
