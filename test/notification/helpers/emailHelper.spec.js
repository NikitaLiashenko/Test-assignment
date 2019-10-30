"use strict";
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const {use, expect} = require('chai');
const proxyquire = require('proxyquire').noCallThru();

use(require('chai-as-promised'));
use(sinonChai);

let sandbox,
  emailHelperMock,
  sendEmailStub;

describe('emailHelper test', () => {
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sendEmailStub = sandbox.stub();

    emailHelperMock = proxyquire(
      '../../../src/notification/helpers/emailHelper.js',
      {
        'aws-sdk': {
          SES: sandbox.stub().returns({
            sendEmail: sendEmailStub
          })
        }
      }
    );
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('sendEmail', () => {
    context('if params are ok', () => {
      it('should resolve', async() => {
        const testEmail = 'testEmail';
        const testContent = 'testContent';
        const testSender = 'testSender';
        const testSubject = 'testSubject';
        const testParams = {
          email: testEmail,
          content: testContent,
          sender: testSender,
          subject: testSubject
        };

        const testEmailParams = {
          Destination: {
            ToAddresses: [testEmail]
          },
          Message: {
            Body: {
              Text: {
                Data: testContent,
              },
            },
            Subject: {
              Data: testSubject,
            }
          },
          Source: testSender,
        };

        sendEmailStub.callsFake(emailParams => {
          expect(emailParams).to.deep.equal(testEmailParams);

          return {
            promise: () => Promise.resolve()
          };
        });

        await emailHelperMock.sendEmail(testParams);
        expect(sendEmailStub).to.be.calledOnce;
      });
    });
  });
});