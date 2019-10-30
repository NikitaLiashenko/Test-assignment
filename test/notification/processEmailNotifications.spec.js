const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const {use, expect} = require('chai');
const proxyquire = require('proxyquire').noCallThru();

use(sinonChai);
use(require('chai-as-promised'));

describe('processEmailNotification', () => {
  let sandbox,
    sendEmailStub,
    getNotificationByIdStub,
    updateNotificationStub,
    prepareObjectUpdateParamsStub,
    processEmailNotifications;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sendEmailStub = sandbox.stub();
    getNotificationByIdStub = sandbox.stub();
    updateNotificationStub = sandbox.stub();
    prepareObjectUpdateParamsStub = sandbox.stub();

    processEmailNotifications = proxyquire(
      '../../src/notification/processEmailNotifications.js',
      {
        './helpers/dynamoHelper.js': {
          getNotificationById: getNotificationByIdStub,
          updateNotification: updateNotificationStub
        },
        './helpers/utils.js': {
          prepareObjectUpdateParams: prepareObjectUpdateParamsStub
        },
        './helpers/emailHelper.js': {
          sendEmail: sendEmailStub
        },
      }
    ).handler;
  });

  afterEach(() => {
    sandbox.restore();
  });

  context('if everything is ok', () => {
    it('should send email', async() => {
      const testNotificationId = 'testNotificationId';
      const testEmailConfig = {
        someKey: 'someValue'
      };
      const testBody = {
        notificationId: testNotificationId,
        emailConfig: testEmailConfig,
      };
      const testEvent = {
        Records: [
          {
            body: JSON.stringify(testBody)
          }
        ]
      };

      const testExistingNotification = {
        status: 'ACCEPTED'
      };

      const testMessageId = 'testMessageId';
      const testResult = {
        MessageId: testMessageId
      };

      const testNewNotification = {
        status: 'SENT',
        messageId: testMessageId
      };

      const testUpdateString = 'testUpdateString';
      const testExpressionAttributeNames = {
        someKey: 'someValue'
      };
      const testExpressionAttributeValues = {
        someKey: 'someValue'
      };

      const testUpdateParams = {
        updateString: testUpdateString,
        expressionAttributeNames: testExpressionAttributeNames,
        expressionAttributeValues: testExpressionAttributeValues,
      };

      const testFinalUpdateParams = {
        UpdateExpression : testUpdateString,
        ExpressionAttributeNames : testExpressionAttributeNames,
        ExpressionAttributeValues : testExpressionAttributeValues,
        Key : {
          notificationId: testNotificationId,
        }
      };

      getNotificationByIdStub.callsFake(notificationId => {
        expect(notificationId).to.equal(testNotificationId);

        return Promise.resolve(testExistingNotification);
      });

      sendEmailStub.callsFake(emailConfig => {
        expect(emailConfig).to.deep.equal(testEmailConfig);

        return Promise.resolve(testResult);
      });

      prepareObjectUpdateParamsStub.callsFake(newNotification => {
        expect(newNotification).to.deep.equal(testNewNotification);

        return testUpdateParams;
      });

      updateNotificationStub.callsFake(updateParams => {
        expect(updateParams).to.deep.equal(testFinalUpdateParams);

        return Promise.resolve();
      });

      await processEmailNotifications(testEvent);
    });
  });
});