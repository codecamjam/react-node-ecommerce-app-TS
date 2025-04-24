import { Joi, validate } from 'express-validation';

export const userSignupValidator = validate({
  body: Joi.object({
    name: Joi.string()
      .required()
      .messages({
        'any.required': 'Name is required'
      }),
    email: Joi.string()
      .email()
      .min(4)
      .max(32)
      .required()
      .messages({
        'string.email': 'Email must contain @',
        'string.min': 'Email must be at least 4 characters',
        'string.max': 'Email must not exceed 32 characters',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .min(6)
      .pattern(/\d/)
      .required()
      .messages({
        'string.min': 'Password must contain at least 6 characters',
        'string.pattern.base': 'Password must contain a number',
        'any.required': 'Password is required'
      })
  })
});
