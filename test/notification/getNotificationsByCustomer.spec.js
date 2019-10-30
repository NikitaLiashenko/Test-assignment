const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const {use, expect} = require('chai');
const proxyquire = require('proxyquire').noCallThru();

use(sinonChai);
use(require('chai-as-promised'));

describe('getNotificationsByCustomer', () => {
  let sandbox,
    getAllNotificationsByCustomerIdStub,
    getAllNotificationsByCustomer;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    getAllNotificationsByCustomerIdStub = sandbox.stub();

    getAllNotificationsByCustomer = proxyquire(
      '../../src/notification/getNotificationsByCustomer.js',
      {
        './helpers/dynamoHelper.js': {
          getAllNotificationsByCustomerId: getAllNotificationsByCustomerIdStub,
        },
      }
    ).handler;
  });

  afterEach(() => {
    sandbox.restore();
  });

  context('if there is no customerId in path', () => {
    it('should return 400', async() => {
      const testEvent = {
        pathParameters: {}
      };

      const testResponse = {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({
          message: 'CustomerId should be specified'
        })
      };

      const response = await getAllNotificationsByCustomer(testEvent);
      expect(response).to.deep.equal(testResponse);
    });
  });

  context('if customerId is emtpy string', () => {
    it('should return 400', async() => {
      const testEvent = {
        pathParameters: {
          customerId : ''
        }
      };

      const testResponse = {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({
          message: 'CustomerId should be specified'
        })
      };

      const response = await getAllNotificationsByCustomer(testEvent);
      expect(response).to.deep.equal(testResponse);
    });
  });

  context('if error occurred during dynamo read', () => {
    it('should return 500', async() => {
      const testCustomerId = 'testCustomerId';
      const testEvent = {
        pathParameters: {
          customerId : testCustomerId
        }
      };

      const testError = new Error('Something happen during dynamo read');

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

      getAllNotificationsByCustomerIdStub.callsFake(customerId => {
        expect(customerId).to.equal(testCustomerId);

        throw testError;
      });

      const response = await getAllNotificationsByCustomer(testEvent);
      expect(response).to.deep.equal(testResponse);
      expect(getAllNotificationsByCustomerIdStub).to.be.calledOnce;
    });
  });

  context('if everything is ok', () => {
    it('should return 200', async() => {
      const testCustomerId = 'testCustomerId';
      const testEvent = {
        pathParameters: {
          customerId : testCustomerId
        }
      };

      const testNotifications = [
        {
          someKey: 'someValue'
        }
      ];

      const testResponse = {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify(testNotifications)
      };

      getAllNotificationsByCustomerIdStub.callsFake(customerId => {
        expect(customerId).to.equal(testCustomerId);

        return Promise.resolve(testNotifications);
      });

      const response = await getAllNotificationsByCustomer(testEvent);
      expect(response).to.deep.equal(testResponse);
      expect(getAllNotificationsByCustomerIdStub).to.be.calledOnce;
    });
  });
});