"use strict";
const {expect} = require('chai');
const utils = require('../../../src/notification/helpers/utils.js');

describe('utils test', () => {
  describe('prepareObjectUpdateParams test', () => {
    it('should prepare proper string and object', () => {
      const testObject = {
        testPrimitive : 'testValue',
        testObject : {
          testKey1 : 'testValue1'
        },
        testArray : [
          {
            testKey2 : 'testValue2'
          }
        ]
      };

      const testUpdateString = 'set #testPrimitive= :testPrimitive,#testObject= :testObject,#testArray= :testArray';
      const testExpressionValues = {
        ':testPrimitive' : testObject.testPrimitive,
        ':testObject' : testObject.testObject,
        ':testArray' : testObject.testArray
      };

      const testExpressionNames = {
        '#testPrimitive' : 'testPrimitive',
        '#testObject' : 'testObject',
        '#testArray' : 'testArray'
      };

      const result = utils.prepareObjectUpdateParams(testObject);
      expect(result.updateString).to.equal(testUpdateString);
      expect(result.expressionAttributeValues).to.deep.equal(testExpressionValues);
      expect(result.expressionAttributeNames).to.deep.equal(testExpressionNames);
    });
  });
});
