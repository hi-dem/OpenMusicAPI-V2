const Joi = require('joi');
const ClientError = require('../exceptions/ClientError');

const playlistSchema = Joi.object({
  name: Joi.string().required()
});

const playlistSongSchema = Joi.object({
  songId: Joi.string().required()
});

const validatePlaylistPayload = (payload) => {
  if (!payload || Object.keys(payload).length === 0) throw new ClientError('Payload tidak boleh kosong', 400);
  const { error } = playlistSchema.validate(payload, { abortEarly: true, errors: { wrap: { label: '' } } });
  if (error) throw new ClientError(error.details[0].message, 400);
};

const validatePlaylistSongPayload = (payload) => {
  if (!payload || Object.keys(payload).length === 0) throw new ClientError('Payload tidak boleh kosong', 400);
  const { error } = playlistSongSchema.validate(payload, { abortEarly: true, errors: { wrap: { label: '' } } });
  if (error) throw new ClientError(error.details[0].message, 400);
};

module.exports = { validatePlaylistPayload, validatePlaylistSongPayload };