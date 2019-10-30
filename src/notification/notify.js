"use strict";
const logger = require('pino')();
const uuid = require('uuid/v4');
const {sendMessage} = require('./helpers/sqsHelper.js');
const {createNotification} = require('./helpers/dynamoHelper.js');
const notifySchema = require('./schemas/notifySchema.js');

module.exports.handler = async(event) => {
  const body = JSON.parse(event.body);

  try {
    await notifySchema.body.validate(body);
  } catch (validationError) {
    logger.error(validationError);

    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        message: 'Validation error'
      })
    };
  }

  // This part should be reviewed to separate email and sms sending or do parallel
  // In terms of code if we have more than 2 types of notifications we should review
  // if statements and do some better algo

  // Also I do sending message and then creating notification.
  // It can be changed to create notification, send it, update notification status.
  // This will affect performance but will be better for tracing, so might be a
  // point of discussion.
  if (body.notifyEmail) {
    const notificationId = uuid();

    const messagePayload = {
      notificationId,
      emailConfig: body.emailConfig,
    };

    try {
      await sendMessage(process.env.EMAIL_QUEUE, messagePayload);
    } catch (sqsEmailError) {
      logger.error(sqsEmailError);

      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({
          message: 'Internal error'
        })
      };
    }

    const notification = {
      notificationId,
      type: 'EMAIL',
      status: 'ACCEPTED',
      emailConfig: body.emailConfig,
      customerId: body.customerId,
    };

    try {
      await createNotification(notification);
    } catch (dynamoCreationError) {
      logger.error(dynamoCreationError);

      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({
          message: 'Internal error'
        })
      };
    }

  }

  if (body.notifySMS) {
    const notificationId = uuid();

    const messagePayload = {
      notificationId,
      smsConfig: body.smsConfig,
    };

    try {
      await sendMessage(process.env.SMS_QUEUE, messagePayload);
    } catch (sqsSMSError) {
      logger.error(sqsSMSError);

      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({
          message: 'Internal error'
        })
      };
    }

    const notification = {
      notificationId,
      type: 'SMS',
      status: 'ACCEPTED',
      smsConfig: body.smsConfig,
      customerId: body.customerId,
    };

    try {
      await createNotification(notification);
    } catch (dynamoCreationError) {
      logger.error(dynamoCreationError);

      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({
          message: 'Internal error'
        })
      };
    }
  }

  return {
    statusCode: 202,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      message: 'Notification was sent for processing'
    })
  };

};