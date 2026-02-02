const Joi = require('joi');

module.exports.registerSchema = Joi.object({
  fullName : Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(64).required(),
});

module.exports.loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});