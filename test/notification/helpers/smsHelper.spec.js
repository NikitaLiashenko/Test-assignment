"use strict";
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const {use, expect} = require('chai');
const proxyquire = require('proxyquire').noCallThru();

use(require('chai-as-promised'));
use(sinonChai);

let sandbox,
  smsHelperMock,
  publishStub;

describe('emailHelper test', () => {
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    publishStub = sandbox.stub();

    smsHelperMock = proxyquire(
      '../../../src/notification/helpers/smsHelper.js',
      {
        'aws-sdk': {
          SNS: sandbox.stub().returns({
            publish: publishStub
          })
        }
      }
    );
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('sendSMS', () => {
    context('if params are ok and sender presented', () => {
      it('should resolve', async() => {
        const testPhoneNumber = 'testPhoneNumber';
        const testText = 'testText';
        const testSender = 'testSender';
        const testParams = {
          phoneNumber: testPhoneNumber,
          text: testText,
          sender: testSender
        };

        const testSMSParams = {
          Message: testText,
          PhoneNumber: testPhoneNumber,
          MessageAttributes: {
            'AWS.SNS.SMS.SenderID': {
              DataType: 'String',
              StringValue: testSender,
            }
          }
        };

        publishStub.callsFake(smsParams => {
          expect(smsParams).to.deep.equal(testSMSParams);

          return {
            promise: () => Promise.resolve()
          };
        });

        await smsHelperMock.sendSMS(testParams);
        expect(publishStub).to.be.calledOnce;
      });
    });

    context('if params are ok and no sender presented', () => {
      it('should resolve', async() => {
        const testPhoneNumber = 'testPhoneNumber';
        const testText = 'testText';
        const testParams = {
          phoneNumber: testPhoneNumber,
          text: testText
        };

        const testSMSParams = {
          Message: testText,
          PhoneNumber: testPhoneNumber
        };

        publishStub.callsFake(smsParams => {
          expect(smsParams).to.deep.equal(testSMSParams);

          return {
            promise: () => Promise.resolve()
          };
        });

        await smsHelperMock.sendSMS(testParams);
        expect(publishStub).to.be.calledOnce;
      });
    });
  });
});