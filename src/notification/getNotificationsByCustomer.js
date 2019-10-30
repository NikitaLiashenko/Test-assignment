"use strict";
const logger = require('pino')();
const {getAllNotificationsByCustomerId} = require('./helpers/dynamoHelper.js');

module.exports.handler = async (event) => {
  const customerId = event.pathParameters.customerId;

  // This case will never happen if we will call our lambda from API Gateway
  // This might be helpful if we might call this Lambda from another Lambda
  if (!customerId || !customerId.trim()) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        message: 'CustomerId should be specified'
      })
    };
  }

  let notifications;
  try {
    notifications = await getAllNotificationsByCustomerId(customerId);
  } catch (dynamoError) {
    logger.error(dynamoError);

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        message: 'Internal error',
      })
    };
  }

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(notifications)
  };
};