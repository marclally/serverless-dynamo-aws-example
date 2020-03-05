"use strict";

const uuid = require("uuid");
const AWS = require("aws-sdk");

AWS.config.setPromisesDependency(require("bluebird"));

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.list = (event, context, callback) => {
  const params = {
    TableName: process.env.BOOKS_TABLE,
    ProjectionExpression: "id, title, releaseDate, authorName"
  };

  console.log("Loading Books table.");
  const onLoad = (err, data) => {
    if (err) {
      console.log(
        "Failed to load data. Error JSON:",
        JSON.stringify(err, null, 2)
      );
      callback(err);
    } else {
      console.log("Success.");
      return callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          books: data.Items
        })
      });
    }
  };

  dynamoDb.scan(params, onLoad);
};
