import * as Joi from 'joi';

export const createOrderSchema = Joi.object({
  userId: Joi.string().required(),
  items: Joi.array().required(),
  deliveryAddress: Joi.string().optional(),
  status: Joi.string()
    .valid('pending', 'shipped', 'delivered', 'canceled')
    .required(),
});

export const updateOrderSchema = Joi.object({
  userId: Joi.string().optional(),
  items: Joi.array().optional(),
  deliveryAddress: Joi.string().optional(),
  status: Joi.string()
    .valid('pending', 'shipped', 'delivered', 'canceled')
    .optional(),
}).min(1);

export const itemsOrderSchema = Joi.object({
  productId: Joi.string().required(),
  quantity: Joi.number().min(1).required(),
});
