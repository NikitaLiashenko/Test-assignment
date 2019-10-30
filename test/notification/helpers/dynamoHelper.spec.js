"use strict";
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const {use, expect} = require('chai');
const proxyquire = require('proxyquire').noCallThru();
const config = require('config');

use(require('chai-as-promised'));
use(sinonChai);

let sandbox,
  dynamoHelperMock,
  queryStub,
  updateStub,
  putStub;

describe('dynamoHelper test', () => {
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    queryStub = sandbox.stub();
    updateStub = sandbox.stub();
    putStub = sandbox.stub();

    dynamoHelperMock = proxyquire(
      '../../../src/notification/helpers/dynamoHelper.js',
      {
        'aws-sdk': {
          DynamoDB: {
            DocumentClient: sandbox.stub().returns({
              query: queryStub,
              update: updateStub,
              put: putStub,
            })
          }
        }
      }
    );
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('createNotification', () => {
    context('if params are ok', () => {
      it('should resolve', async() => {
        const testNotification = {
          someKey: 'someValue'
        };

        const testParams = {
          TableName : config.get('aws.dynamodb.notifications.table'),
          Item : testNotification
        };

        putStub.callsFake(params => {
          expect(params).to.deep.equal(testParams);

          return {
            promise: () => Promise.resolve()
          };
        });

        await dynamoHelperMock.createNotification(testNotification);
        expect(putStub).to.be.calledOnce;
      });
    });
  });

  describe('getAllNotificationsByCustomerId', () => {
    context('if params are ok', () => {
      it('should return Items', async () => {
        const testCustomerId = 'testCustomerId';
        const testParams = {
          TableName : config.get('aws.dynamodb.notifications.table'),
          KeyConditionExpression : '#customerId = :customerId',
          IndexName : config.get('aws.dynamodb.notifications.customerIdIndex'),
          ExpressionAttributeValues : {
            ':customerId' : testCustomerId
          },
          ExpressionAttributeNames : {
            '#customerId' : 'customerId'
          }
        };
        const testResult = {
          Items: [
            {
              someKey: 'someValue',
            }
          ],
        };

        queryStub.callsFake(params => {
          expect(params).to.deep.equal(testParams);

          return {
            promise: () => Promise.resolve(testResult)
          };
        });

        const result = await dynamoHelperMock.getAllNotificationsByCustomerId(testCustomerId);
        expect(result).to.deep.equal(testResult.Items);
        expect(queryStub).to.be.calledOnce;
      });
    });
  });

  describe('getNotificationById', () => {
    context('if params are ok', () => {
      it('should return first element', async () => {
        const testNotificationId = 'testNotificationId';
        const testParams = {
          TableName : config.get('aws.dynamodb.notifications.table'),
          KeyConditionExpression : '#notificationId = :notificationId',
          ExpressionAttributeValues : {
            ':notificationId' : testNotificationId
          },
          ExpressionAttributeNames : {
            '#notificationId' : 'notificationId'
          }
        };
        const testResult = {
          Items: [
            {
              someKey1: 'someValue1',
            },
            {
              someKey2: 'someValue2'
            }
          ],
        };

        queryStub.callsFake(params => {
          expect(params).to.deep.equal(testParams);

          return {
            promise: () => Promise.resolve(testResult)
          };
        });

        const result = await dynamoHelperMock.getNotificationById(testNotificationId);
        expect(result).to.deep.equal(testResult.Items[0]);
        expect(queryStub).to.be.calledOnce;
      });
    });
  });

  describe('updateNotification', () => {
    context('if params are ok', () => {
      it('should return Attributes', async () => {
        const testUpdateParams = {
          someParam: 'someParamValue'
        };
        const testParams = Object.assign(
          {
            TableName : config.get('aws.dynamodb.notifications.table'),
            ReturnValues : "ALL_NEW"
          },
          testUpdateParams
        );
        const testResult = {
          Attributes: {
            someKey: 'someValue'
          },
        };

        updateStub.callsFake(params => {
          expect(params).to.deep.equal(testParams);

          return {
            promise: () => Promise.resolve(testResult)
          };
        });

        const result = await dynamoHelperMock.updateNotification(testUpdateParams);
        expect(result).to.deep.equal(testResult.Attributes);
        expect(updateStub).to.be.calledOnce;
      });
    });
  });
});