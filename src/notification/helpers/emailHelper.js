"use strict";

const AWS = require('aws-sdk');
const ses = new AWS.SES();

const sendEmail = async({email, content, sender, subject}) => {
  // We can do some nice email based on HTML document, but for simplicity I will
  // send plain text.
  const params = {
    Destination: {
      ToAddresses: [email]
    },
    Message: {
      Body: {
        Text: {
          Data: content,
        },
      },
      Subject: {
        Data: subject,
      }
    },
    Source: sender,
  };

  return ses.sendEmail(params).promise();
};

module.exports = {
  sendEmail
};