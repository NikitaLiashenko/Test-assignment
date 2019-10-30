"use strict";
global.fetch = require('node-fetch');
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');

module.exports.handler = (event) => {
  const { email, password } = JSON.parse(event.body);

  const poolData = {
    UserPoolId : process.env.USER_POOL_ID,
    ClientId : process.env.CLIENT_ID
  };

  const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

  const userData = {
    Username : email,
    Pool : userPool
  };

  const authenticationData = {
    Username : email,
    Password : password
  };

  const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

  const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);

  return new Promise((resolve, reject) => {
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess : result => {
        console.log(result);

        return resolve({
          statusCode : 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
          },
          body : JSON.stringify({
            token : result.accessToken.jwtToken,
          })
        });
      },
      onFailure : signinError => {
        console.error(signinError);

        return reject({
          statusCode : 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
          },
          body : JSON.stringify({
            message : `Error occurred during signing in`
          })
        })
      }
    });
  });
};