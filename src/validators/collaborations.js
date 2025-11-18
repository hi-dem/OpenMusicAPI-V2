const Joi = require('joi');
const ClientError = require('../exceptions/ClientError');

const schema = Joi.object({
  playlistId: Joi.string().required(),
  userId: Joi.string().required()
});

const validateCollaborationPayload = (payload) => {
  if (!payload || Object.keys(payload).length === 0) throw new ClientError('Payload tidak boleh kosong', 400);
  const { error } = schema.validate(payload, { abortEarly: true, errors: { wrap: { label: '' } } });
  if (error) throw new ClientError(error.details[0].message, 400);
};

module.exports = { validateCollaborationPayload };