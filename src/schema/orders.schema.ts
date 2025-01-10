import * as Joi from 'joi';

export const createOrderSchema = Joi.object({
  userId: Joi.number().required(),
  item: Joi.array().required(),
  deliveryAddress: Joi.string().optional(),
  price: Joi.number().required(),
  status: Joi.string()
    .valid('pending', 'shipped', 'delivered', 'canceled')
    .required(),
});

export const updateOrderSchema = Joi.object({
  userId: Joi.number().optional(),
  item: Joi.array().optional(),
  deliveryAddress: Joi.string().optional(),
  price: Joi.number().optional(),
  status: Joi.string()
    .valid('pending', 'shipped', 'delivered', 'canceled')
    .optional(),
}).min(1);
