const prepareObjectUpdateParams = (inputObject) => {
  let updateString = 'set ';
  const expressionAttributeValues = {};
  const expressionAttributeNames = {};

  Object.keys(inputObject).forEach(key => {
    updateString += `#${key}= :${key},`;
    expressionAttributeValues[`:${key}`] = inputObject[key];
    expressionAttributeNames[`#${key}`] = key;
  });

  updateString = updateString.slice(0, -1);

  return {
    updateString,
    expressionAttributeValues,
    expressionAttributeNames
  };
};

module.exports = {
  prepareObjectUpdateParams,
};