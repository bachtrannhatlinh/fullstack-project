import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().min(1).max(100).required(),
  lastName: Joi.string().min(1).max(100).required(),
  phoneNumber: Joi.string().optional().allow(''),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(1).max(100).optional(),
  lastName: Joi.string().min(1).max(100).optional(),
  phoneNumber: Joi.string().optional().allow(''),
});

export const createAccountSchema = Joi.object({
  accountType: Joi.string().valid('CHECKING', 'SAVINGS', 'INVESTMENT', 'CREDIT').required(),
  currency: Joi.string().length(3).required(),
  initialDeposit: Joi.number().min(0).optional(),
});

export const createTransactionSchema = Joi.object({
  accountId: Joi.string().required(),
  amount: Joi.number().required(),
  type: Joi.string().valid('DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'PAYMENT', 'REFUND').required(),
  description: Joi.string().required(),
  category: Joi.string().optional(),
  reference: Joi.string().optional(),
});
