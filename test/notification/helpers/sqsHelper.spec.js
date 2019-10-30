"use strict";
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const {use, expect} = require('chai');
const proxyquire = require('proxyquire').noCallThru();

use(require('chai-as-promised'));
use(sinonChai);

let sandbox,
  sqsHelperMock,
  sendMessageStub;

describe('sqsHelper test', () => {
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sendMessageStub = sandbox.stub();

    sqsHelperMock = proxyquire(
      '../../../src/notification/helpers/sqsHelper.js',
      {
        'aws-sdk': {
          SQS: sandbox.stub().returns({
            sendMessage: sendMessageStub
          })
        }
      }
    );
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('sendMessage', () => {
    context('if there is no messageBody', () => {
      it('should throw', async() => {
        const testQueue = 'testQueue';

        try {
          await sqsHelperMock.sendMessage(testQueue);
        } catch (error) {
          expect(error.message).to.equal('Message body should be specified');
          expect(sendMessageStub).not.to.be.called;
        }
      });
    });

    context('if params are ok', () => {
      it('should resolve', async() => {
        const testQueue = 'testQueue';
        const testMessageBody = {
          someKey: 'someValue'
        };

        const testMessageParams = {
          QueueUrl : testQueue,
          MessageBody : JSON.stringify(testMessageBody)
        };

        sendMessageStub.callsFake(messageParams => {
          expect(messageParams).to.deep.equal(testMessageParams);

          return {
            promise: () => Promise.resolve()
          };
        });

        await sqsHelperMock.sendMessage(testQueue, testMessageBody);
        expect(sendMessageStub).to.be.calledOnce;
      });
    });
  });
});