"use strict";

const uuid = require("uuid");
const AWS = require("aws-sdk");
const moment = require("moment");

AWS.config.setPromisesDependency(require("bluebird"));

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.update = (event, context, callback) => {
  const timestamp = new Date().getTime();
  const requestBody = JSON.parse(event.body);
  const name = requestBody.name;
  const releaseDate = requestBody.releaseDate;
  const authorName = requestBody.authorName;

  const formats = [
    "YYYY-MM-DD LT",
    "YYYY-MM-DD h:mm:ss A",
    "YYYY-MM-DD HH:mm:ss",
    "YYYY-MM-DD HH:mm",
    "DD-MM-YYYY LT",
    "DD-MM-YYYY h:mm:ss A",
    "DD-MM-YYYY HH:mm:ss",
    "DD-MM-YYYY HH:mm"
  ];

  const validDate = releaseDate => {
    return moment(releaseDate, formats, true).isValid();
  };

  if (
    typeof name !== "string" ||
    typeof authorName !== "string" ||
    validDate(releaseDate) !== true
  ) {
    callback(null, {
      statusCode: 500,
      body: JSON.stringify({
        message: `Validation Error`
      })
    });
  }

  const params = {
    TableName: process.env.BOOKS_TABLE,
    Key: {
      id: event.pathParameters.bookUuid
    },
    ExpressionAttributeValues: {
      ":name": name,
      ":releaseDate": releaseDate,
      ":authorName": authorName,
      ":updatedAt": timestamp
    },
    UpdateExpression:
      "SET title = :name, releaseDate = :releaseDate, authorName = :authorName, updatedAt = :updatedAt",
    ReturnValues: "ALL_NEW"
  };

  dynamoDb
    .update(params)
    .promise()
    .then(result => {
      const response = {
        statusCode: 200,
        body: JSON.stringify(result.Attributes)
      };
      callback(null, response);
    })
    .catch(error => {
      console.error(error);
      callback(new Error("Couldn't update book."));
      return;
    });
};
