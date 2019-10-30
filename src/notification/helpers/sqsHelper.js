"use strict";

const AWS = require('aws-sdk');
const logger = require('pino')();
const sqs = new AWS.SQS();

const sendMessage = async (queue, messageBody) => {
  if (!messageBody){
    logger.error('Message body should be specified');
    throw new Error('Message body should be specified');
  }

  const params = {
    QueueUrl : queue,
    MessageBody : JSON.stringify(messageBody)
  };

  return await sqs.sendMessage(params).promise();
};

module.exports = {
  sendMessage
};