const Joi = require('joi');

module.exports.registerSchema = Joi.object({
  fullName : Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(64).required(),
  username: Joi.string().min(3).max(30).pattern(/^[a-zA-Z0-9_]+$/).optional()
});

module.exports.usernameRegisterSchema = Joi.object({
  fullName: Joi.string().optional(),
  username: Joi.string().min(3).max(30).pattern(/^[a-zA-Z0-9_]+$/).required(),
  password: Joi.string().min(8).max(64).required(),
  email: Joi.string().email().optional()
});

module.exports.loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

module.exports.usernameLoginSchema = Joi.object({
  username: Joi.string().min(3).max(30).pattern(/^[a-zA-Z0-9_]+$/).required(),
  password: Joi.string().required(),
});
