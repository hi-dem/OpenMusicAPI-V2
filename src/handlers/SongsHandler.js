const autoBind = require('auto-bind');
const { validateSongPayload } = require('../validators/songs');

class SongsHandler {
  constructor(songsService) {
    this._songsService = songsService;
    autoBind(this);
  }

  async postSongHandler(request, h) {
    validateSongPayload(request.payload);
    const songId = await this._songsService.addSong(request.payload);
    const res = h.response({ status: 'success', data: { songId } });
    res.code(201);
    return res;
  }

  async getSongsHandler(request) {
    const { title, performer } = request.query;
    const songs = await this._songsService.getSongs({ title, performer });
    return { status: 'success', data: { songs } };
  }

  async getSongByIdHandler(request) {
    const { id } = request.params;
    const song = await this._songsService.getSongById(id);
    return { status: 'success', data: { song } };
  }

  async putSongByIdHandler(request) {
    const { id } = request.params;
    validateSongPayload(request.payload);
    await this._songsService.editSongById(id, request.payload);
    return { status: 'success', message: 'Lagu berhasil diperbarui' };
  }

  async deleteSongByIdHandler(request) {
    const { id } = request.params;
    await this._songsService.deleteSongById(id);
    return { status: 'success', message: 'Lagu berhasil dihapus' };
  }
}

module.exports = SongsHandler;