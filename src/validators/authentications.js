const Joi = require('joi');
const ClientError = require('../exceptions/ClientError');

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required()
});

const validateLoginPayload = (payload) => {
  if (!payload || Object.keys(payload).length === 0) throw new ClientError('Payload tidak boleh kosong', 400);
  const { error } = loginSchema.validate(payload, { abortEarly: true, errors: { wrap: { label: '' } } });
  if (error) throw new ClientError(error.details[0].message, 400);
};

const validateRefreshPayload = (payload) => {
  if (!payload || Object.keys(payload).length === 0) throw new ClientError('Payload tidak boleh kosong', 400);
  const { error } = refreshSchema.validate(payload, { abortEarly: true, errors: { wrap: { label: '' } } });
  if (error) throw new ClientError(error.details[0].message, 400);
};

module.exports = { validateLoginPayload, validateRefreshPayload };