"use strict";

const AWS = require('aws-sdk');
const sns = new AWS.SNS();

const sendSMS = async ({phoneNumber, text, sender}) => {
  const params = {
    Message: text,
    PhoneNumber: phoneNumber
  };

  if (sender) {
    params.MessageAttributes = {
      'AWS.SNS.SMS.SenderID': {
        DataType: 'String',
        StringValue: sender,
      },
    };
  }

  return await sns.publish(params).promise();
};

module.exports = {
  sendSMS,
};