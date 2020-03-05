"use strict";

const uuid = require("uuid");
const AWS = require("aws-sdk");
const moment = require("moment");

AWS.config.setPromisesDependency(require("bluebird"));

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.add = (event, context, callback) => {
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

  addBook(bookInfo(name, releaseDate, authorName))
    .then(res => {
      callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: `Sucessfully submitted book with title ${name}`,
          bookUuid: res.id
        })
      });
    })
    .catch(err => {
      console.log(err);
      callback(null, {
        statusCode: 500,
        body: JSON.stringify({
          message: `Unable to submit book with title ${name}`
        })
      });
    });
};

const addBook = book => {
  const bookInfo = {
    TableName: process.env.BOOKS_TABLE,
    Item: book
  };
  return dynamoDb
    .put(bookInfo)
    .promise()
    .then(res => book);
};

const bookInfo = (name, releaseDate, authorName) => {
  const timestamp = new Date().getTime();
  return {
    id: uuid.v1(),
    title: name,
    releaseDate: releaseDate,
    authorName: authorName,
    submittedAt: timestamp,
    updatedAt: timestamp
  };
};
