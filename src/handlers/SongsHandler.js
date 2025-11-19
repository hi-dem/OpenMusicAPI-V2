const { default: autoBind } = require('auto-bind');
const { validateSongPayload } = require('../validators/songs');

class SongsHandler {
  constructor(songsService) {
    this._songsService = songsService;
    autoBind(this);
  }

  async postSongHandler(request, h) {
    try {
      validateSongPayload(request.payload);
      const songId = await this._songsService.addSong(request.payload);
      const res = h.response({ status: 'success', data: { songId } });
      res.code(201);
      return res;
    } catch (error) {
      console.error('Error in postSongHandler:', error);
      throw error;
    }
  }

  async getSongsHandler(request) {
    try {
      const { title, performer } = request.query;
      const songs = await this._songsService.getSongs({ title, performer });
      return { status: 'success', data: { songs } };
    } catch (error) {
      console.error('Error in getSongsHandler:', error);
      throw error;
    }
  }

  async getSongByIdHandler(request) {
    try {
      const { id } = request.params;
      const song = await this._songsService.getSongById(id);
      return { status: 'success', data: { song } };
    } catch (error) {
      console.error('Error in getSongByIdHandler:', error);
      throw error;
    }
  }

  async putSongByIdHandler(request) {
    try {
      const { id } = request.params;
      validateSongPayload(request.payload);
      await this._songsService.editSongById(id, request.payload);
      return { status: 'success', message: 'Lagu berhasil diperbarui' };
    } catch (error) {
      console.error('Error in putSongByIdHandler:', error);
      throw error;
    }
  }

  async deleteSongByIdHandler(request) {
    try {
      const { id } = request.params;
      await this._songsService.deleteSongById(id);
      return { status: 'success', message: 'Lagu berhasil dihapus' };
    } catch (error) {
      console.error('Error in deleteSongByIdHandler:', error);
      throw error;
    }
  }
}

module.exports = SongsHandler;