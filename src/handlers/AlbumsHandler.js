const { default: autoBind } = require('auto-bind');
const { validateAlbumPayload } = require('../validators/albums');

class AlbumsHandler {
  constructor(albumsService) {
    this._albumsService = albumsService;
    autoBind(this);
  }

  async postAlbumHandler(request, h) {
    try {
      validateAlbumPayload(request.payload);
      const { name, year } = request.payload;
      const albumId = await this._albumsService.addAlbum({ name, year });
      const res = h.response({ status: 'success', data: { albumId } });
      res.code(201);
      return res;
    } catch (error) {
      console.error('Error in postAlbumHandler:', error);
      throw error;
    }
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params;
    const album = await this._albumsService.getAlbumById(id);
    return { status: 'success', data: { album } };
  }

  async putAlbumByIdHandler(request) {
    try {
      validateAlbumPayload(request.payload);
      const { id } = request.params;
      const { name, year } = request.payload;
      await this._albumsService.editAlbumById(id, { name, year });
      return { status: 'success', message: 'Album berhasil diperbarui' };
    } catch (error) {
      console.error('Error in putAlbumByIdHandler:', error);
      throw error;
    }
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;
    await this._albumsService.deleteAlbumById(id);
    return { status: 'success', message: 'Album berhasil dihapus' };
  }
}

module.exports = AlbumsHandler;