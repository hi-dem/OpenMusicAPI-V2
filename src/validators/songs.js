const Joi = require('joi');
const ClientError = require('../exceptions/ClientError');

const schema = Joi.object({
  title: Joi.string().required(),
  year: Joi.number().integer().min(1900).max(new Date().getFullYear()).required(),
  genre: Joi.string().required(),
  performer: Joi.string().required(),
  duration: Joi.number().integer().min(0).optional().allow(null),
  albumId: Joi.string().optional().allow(null)
});

const validateSongPayload = (payload) => {
  if (!payload || Object.keys(payload).length === 0) throw new ClientError('Payload tidak boleh kosong', 400);
  const { error } = schema.validate(payload, { abortEarly: true, errors: { wrap: { label: '' } } });
  if (error) throw new ClientError(error.details[0].message, 400);
};

module.exports = { validateSongPayload };