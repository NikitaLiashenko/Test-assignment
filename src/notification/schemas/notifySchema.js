const Joi = require('@hapi/joi');

// This validation should be reviewed in case if it is a real life app
const body = Joi.object({
  emailConfig: Joi.object({
    email: Joi.string().email().required(),
    content: Joi.string().required(),
    sender: Joi.string().required(),
    subject: Joi.string().optional(),
  }),
  smsConfig: Joi.object({
    phoneNumber: Joi.string().required(),
    text: Joi.string().required(),
    sender: Joi.string().optional(),
  }),
  notifyEmail: Joi.boolean(),
  notifySMS: Joi.boolean(),
  customerId: Joi.string().required(),
})
  .with('notifyEmail', 'emailConfig')
  .with('notifySMS', 'smsConfig');

module.exports = {
  body,
};