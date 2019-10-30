"use strict";
const config = require('config');
const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

const getAllNotificationsByCustomerId = async(customerId) => {
  const params = {
    TableName : config.get('aws.dynamodb.notifications.table'),
    KeyConditionExpression : '#customerId = :customerId',
    IndexName : config.get('aws.dynamodb.notifications.customerIdIndex'),
    ExpressionAttributeValues : {
      ':customerId' : customerId
    },
    ExpressionAttributeNames : {
      '#customerId' : 'customerId'
    }
  };

  return await dynamo.query(params).promise()
    .then(result => result.Items);
};

const getNotificationById = async(notificationId) => {
  const params = {
    TableName : config.get('aws.dynamodb.notifications.table'),
    KeyConditionExpression : '#notificationId = :notificationId',
    ExpressionAttributeValues : {
      ':notificationId' : notificationId
    },
    ExpressionAttributeNames : {
      '#notificationId' : 'notificationId'
    }
  };

  return await dynamo.query(params).promise()
    .then(result => result.Items[0]);
};

const updateNotification = async (updateParams) => {
  const params = Object.assign(
    {
      TableName : config.get('aws.dynamodb.notifications.table'),
      ReturnValues : "ALL_NEW"
    },
    updateParams
  );

  return await dynamo.update(params).promise()
    .then(result => result.Attributes);
};

const createNotification = async(notification) => {
  const params = {
    TableName : config.get('aws.dynamodb.notifications.table'),
    Item : notification
  };

  return await dynamo.put(params).promise();
};

module.exports = {
  getAllNotificationsByCustomerId,
  createNotification,
  getNotificationById,
  updateNotification
};