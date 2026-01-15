const Joi = require('joi');

module.exports.createAppSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  description: Joi.string().max(255).allow('', null),
  callbackUrl: Joi.string().uri().allow('', null),
});

module.exports.updateAppSchema = Joi.object({
  name: Joi.string().min(3).max(50),
  description: Joi.string().max(255).allow('', null),
  callbackUrl: Joi.string().uri().allow('', null),
});
