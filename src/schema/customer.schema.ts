import * as Joi from 'joi';

const phoneRegex = /^(\+32|0032|0)(4[5-9]\d{7}|[1-9]\d{1,2}\d{6})$/;

export const createCustomerSchema = Joi.object({
  firstName: Joi.string().min(2).required(),
  lastName: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  phone: Joi.string().pattern(phoneRegex).optional(),
});

export const updateCustomerSchema = Joi.object({
  firstName: Joi.string().min(2).optional(),
  lastName: Joi.string().min(2).optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(8).optional(),
  phone: Joi.string().pattern(phoneRegex).optional(),
  role: Joi.string().valid('client', 'admin').optional(),
}).min(1); // Au moins un champ est requis
