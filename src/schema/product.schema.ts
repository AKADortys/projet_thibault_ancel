import * as Joi from 'joi';

export const CreateProductSchema = Joi.object({
  label: Joi.string().min(3).required(),
  price: Joi.number().required(),
  stock: Joi.number().required(),
  description: Joi.string().min(30),
  category: Joi.string().min(3),
});

export const UpdateProductSchema = Joi.object({
  label: Joi.string().min(3).optional(),
  price: Joi.number().optional(),
  stock: Joi.number().optional(),
  description: Joi.string().min(30).optional(),
  category: Joi.string().min(3).optional(),
}).min(1);
