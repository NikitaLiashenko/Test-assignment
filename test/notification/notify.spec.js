const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const {use, expect} = require('chai');
const proxyquire = require('proxyquire').noCallThru();

use(sinonChai);
use(require('chai-as-promised'));

describe('notify', () => {
  let sandbox,
    sendMessageStub,
    createNotificationStub,
    notify;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sendMessageStub = sandbox.stub();
    createNotificationStub = sandbox.stub();

    notify = proxyquire(
      '../../src/notification/notify.js',
      {
        './helpers/dynamoHelper.js': {
          createNotification: createNotificationStub,
        },
        './helpers/sqsHelper.js': {
          sendMessage: sendMessageStub,
        }
      }
    ).handler;
  });

  afterEach(() => {
    sandbox.restore();
  });

  context('if body validation failed', () => {
    it('should return 400', async() => {
      const testBody = {
        someKey: 'someValue'
      };
      const testEvent = {
        body: JSON.stringify(testBody)
      };

      const testResponse = {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({
          message: 'Validation error'
        })
      };

      const response = await notify(testEvent);
      expect(response).to.deep.equal(testResponse);
    });
  });

  context('if email should be sent and error happen during sending', () => {
    it('should return 500', async() => {
      const testCustomerId = 'testCustomerId';
      const testEmail = 'test@email.com';
      const testContent = 'testContent';
      const testSender = 'testSender';
      const testSubject = 'testSubject';
      const testEmailConfig = {
        email: testEmail,
        content: testContent,
        sender: testSender,
        subject: testSubject
      };
      const testBody = {
        customerId: testCustomerId,
        emailConfig: testEmailConfig,
        notifyEmail: true,
      };
      const testEvent = {
        body: JSON.stringify(testBody)
      };
      const testError = new Error('Something happen during email sending');

      const testResponse = {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({
          message: 'Internal error'
        })
      };

      sendMessageStub.callsFake((queue, messagePayload) => {
        expect(queue).to.equal(process.env.EMAIL_QUEUE);
        expect(messagePayload).to.have.property('notificationId').that.is.a('string');
        expect(messagePayload.emailConfig).to.deep.equal(testEmailConfig);

        throw testError;
      });

      const response = await notify(testEvent);
      expect(response).to.deep.equal(testResponse);
    });
  });

  context('if email should be sent and error happen during dynamo write', () => {
    it('should return 500', async() => {
      const testCustomerId = 'testCustomerId';
      const testEmail = 'test@email.com';
      const testContent = 'testContent';
      const testSender = 'testSender';
      const testSubject = 'testSubject';
      const testEmailConfig = {
        email: testEmail,
        content: testContent,
        sender: testSender,
        subject: testSubject
      };
      const testBody = {
        customerId: testCustomerId,
        emailConfig: testEmailConfig,
        notifyEmail: true,
      };
      const testEvent = {
        body: JSON.stringify(testBody)
      };
      const testError = new Error('Something happen during dynamo write');

      const testResponse = {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({
          message: 'Internal error'
        })
      };

      sendMessageStub.callsFake((queue, messagePayload) => {
        expect(queue).to.equal(process.env.EMAIL_QUEUE);
        expect(messagePayload).to.have.property('notificationId').that.is.a('string');
        expect(messagePayload.emailConfig).to.deep.equal(testEmailConfig);

        return Promise.resolve();
      });

      createNotificationStub.callsFake(notification => {
        expect(notification.type).to.equal('EMAIL');
        expect(notification.status).to.equal('ACCEPTED');
        expect(notification.emailConfig).to.deep.equal(testEmailConfig);
        expect(notification.customerId).to.equal(testCustomerId);
        expect(notification).to.have.property('notificationId').that.is.a('string');

        throw testError;
      });

      const response = await notify(testEvent);
      expect(response).to.deep.equal(testResponse);
    });
  });

  context('if email should be sent and everything is ok', () => {
    it('should return 202', async() => {
      const testCustomerId = 'testCustomerId';
      const testEmail = 'test@email.com';
      const testContent = 'testContent';
      const testSender = 'testSender';
      const testSubject = 'testSubject';
      const testEmailConfig = {
        email: testEmail,
        content: testContent,
        sender: testSender,
        subject: testSubject
      };
      const testBody = {
        customerId: testCustomerId,
        emailConfig: testEmailConfig,
        notifyEmail: true,
      };
      const testEvent = {
        body: JSON.stringify(testBody)
      };

      const testResponse = {
        statusCode: 202,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({
          message: 'Notification was sent for processing'
        })
      };

      sendMessageStub.callsFake((queue, messagePayload) => {
        expect(queue).to.equal(process.env.EMAIL_QUEUE);
        expect(messagePayload).to.have.property('notificationId').that.is.a('string');
        expect(messagePayload.emailConfig).to.deep.equal(testEmailConfig);

        return Promise.resolve();
      });

      createNotificationStub.callsFake(notification => {
        expect(notification.type).to.equal('EMAIL');
        expect(notification.status).to.equal('ACCEPTED');
        expect(notification.emailConfig).to.deep.equal(testEmailConfig);
        expect(notification.customerId).to.equal(testCustomerId);
        expect(notification).to.have.property('notificationId').that.is.a('string');

        return Promise.resolve();
      });

      const response = await notify(testEvent);
      expect(response).to.deep.equal(testResponse);
    });
  });

  context('if sms should be sent and error happen during sending', () => {
    it('should return 500', async() => {
      const testCustomerId = 'testCustomerId';
      const testPhoneNumber = 'testPhoneNumber';
      const testText = 'testText';
      const testSender = 'testSender';
      const testSMSConfig = {
        phoneNumber: testPhoneNumber,
        text: testText,
        sender: testSender
      };
      const testBody = {
        customerId: testCustomerId,
        smsConfig: testSMSConfig,
        notifySMS: true,
      };
      const testEvent = {
        body: JSON.stringify(testBody)
      };
      const testError = new Error('Something happen during sms sending');

      const testResponse = {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({
          message: 'Internal error'
        })
      };

      sendMessageStub.callsFake((queue, messagePayload) => {
        expect(queue).to.equal(process.env.SMS_QUEUE);
        expect(messagePayload).to.have.property('notificationId').that.is.a('string');
        expect(messagePayload.smsConfig).to.deep.equal(testSMSConfig);

        throw testError;
      });

      const response = await notify(testEvent);
      expect(response).to.deep.equal(testResponse);
    });
  });

  context('if sms should be sent and error happen during dynamo write', () => {
    it('should return 500', async() => {
      const testCustomerId = 'testCustomerId';
      const testPhoneNumber = 'testPhoneNumber';
      const testText = 'testText';
      const testSender = 'testSender';
      const testSMSConfig = {
        phoneNumber: testPhoneNumber,
        text: testText,
        sender: testSender
      };
      const testBody = {
        customerId: testCustomerId,
        smsConfig: testSMSConfig,
        notifySMS: true,
      };
      const testEvent = {
        body: JSON.stringify(testBody)
      };
      const testError = new Error('Something happen during dynamo write');

      const testResponse = {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({
          message: 'Internal error'
        })
      };

      sendMessageStub.callsFake((queue, messagePayload) => {
        expect(queue).to.equal(process.env.SMS_QUEUE);
        expect(messagePayload).to.have.property('notificationId').that.is.a('string');
        expect(messagePayload.smsConfig).to.deep.equal(testSMSConfig);

        return Promise.resolve();
      });

      createNotificationStub.callsFake(notification => {
        expect(notification.type).to.equal('SMS');
        expect(notification.status).to.equal('ACCEPTED');
        expect(notification.smsConfig).to.deep.equal(testSMSConfig);
        expect(notification.customerId).to.equal(testCustomerId);
        expect(notification).to.have.property('notificationId').that.is.a('string');

        throw testError;
      });

      const response = await notify(testEvent);
      expect(response).to.deep.equal(testResponse);
    });
  });

  context('if sms should be sent and everything is ok', () => {
    it('should return 202', async() => {
      const testCustomerId = 'testCustomerId';
      const testPhoneNumber = 'testPhoneNumber';
      const testText = 'testText';
      const testSender = 'testSender';
      const testSMSConfig = {
        phoneNumber: testPhoneNumber,
        text: testText,
        sender: testSender
      };
      const testBody = {
        customerId: testCustomerId,
        smsConfig: testSMSConfig,
        notifySMS: true,
      };
      const testEvent = {
        body: JSON.stringify(testBody)
      };

      const testResponse = {
        statusCode: 202,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({
          message: 'Notification was sent for processing'
        })
      };

      sendMessageStub.callsFake((queue, messagePayload) => {
        expect(queue).to.equal(process.env.SMS_QUEUE);
        expect(messagePayload).to.have.property('notificationId').that.is.a('string');
        expect(messagePayload.smsConfig).to.deep.equal(testSMSConfig);

        return Promise.resolve();
      });

      createNotificationStub.callsFake(notification => {
        expect(notification.type).to.equal('SMS');
        expect(notification.status).to.equal('ACCEPTED');
        expect(notification.smsConfig).to.deep.equal(testSMSConfig);
        expect(notification.customerId).to.equal(testCustomerId);
        expect(notification).to.have.property('notificationId').that.is.a('string');

        return Promise.resolve();
      });

      const response = await notify(testEvent);
      expect(response).to.deep.equal(testResponse);
    });
  });
});