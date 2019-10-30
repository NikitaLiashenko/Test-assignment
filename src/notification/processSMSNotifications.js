"use strict";
const _ = require('lodash');
const {sendSMS} = require('./helpers/smsHelper.js');
const {getNotificationById, updateNotification} = require('./helpers/dynamoHelper.js');
const {prepareObjectUpdateParams} = require('./helpers/utils.js');

// For both email and sms processing lambdas we have same logic, so we can reuse the code
// and use switch-case to decide whether we need to send email or sms.
// At the same time for simplicity I will leave them separately but almost identical.
// This also might be a good choice if we are going to have bigger difference in logic
// in the future.

module.exports.handler = async(event) => {
  // We will process messages 1 by 1, so we can be sure
  // that there is only one message in event
  const message = event.Records[0];
  const messageBody = JSON.parse(message.body);

  // We can omit validation here because producer of our messages is a
  // part of our system, so we can be sure about message structure.

  // We should not handle errors here.
  // By default there are 3 attempts for processing of queue message.
  // If we fail 3 times message will go to DLQ(dead letter queue).

  const result = await sendSMS(messageBody.smsConfig);

  const existingNotification = await getNotificationById(messageBody.notificationId);

  const newNotification = {
    ...existingNotification,
    status: 'SENT',
    messageId: result.MessageId
  };

  const {updateString, expressionAttributeNames, expressionAttributeValues} = prepareObjectUpdateParams(_.omit(newNotification, ['notificationId']));

  await updateNotification({
    UpdateExpression : updateString,
    ExpressionAttributeNames : expressionAttributeNames,
    ExpressionAttributeValues : expressionAttributeValues,
    Key : {
      notificationId: messageBody.notificationId
    }
  });
};