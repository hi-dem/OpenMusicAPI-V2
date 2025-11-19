const { default: autoBind } = require('auto-bind');
const { validatePlaylistPayload, validatePlaylistSongPayload } = require('../validators/playlists');

class PlaylistsHandler {
  constructor(playlistsService) {
    this._playlistsService = playlistsService;
    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    validatePlaylistPayload(request.payload);
    const { name } = request.payload;
    const { id: owner } = request.auth.credentials;
    const playlistId = await this._playlistsService.addPlaylist({ name, owner });
    const res = h.response({ status: 'success', data: { playlistId } });
    res.code(201);
    return res;
  }

  async getPlaylistsHandler(request) {
    const { id } = request.auth.credentials;
    const playlists = await this._playlistsService.getPlaylistsByUser(id);
    return { status: 'success', data: { playlists } };
  }

  async deletePlaylistHandler(request) {
    const { id } = request.params;
    const { id: owner } = request.auth.credentials;
    await this._playlistsService.verifyPlaylistOwner(id, owner);
    await this._playlistsService.deletePlaylist(id);
    return { status: 'success', message: 'Playlist berhasil dihapus' };
  }

  async postSongToPlaylistHandler(request, h) {
    validatePlaylistSongPayload(request.payload);
    const { id: playlistId } = request.params;
    const { songId } = request.payload;
    const { id: userId } = request.auth.credentials;
    await this._playlistsService.verifyPlaylistAccess(playlistId, userId);
    // DIPERBAIKI: Pass userId ke service
    await this._playlistsService.addSongToPlaylist(playlistId, songId, userId);
    const res = h.response({ status: 'success', message: 'Lagu berhasil ditambahkan ke playlist' });
    res.code(201);
    return res;
  }

  async getPlaylistSongsHandler(request) {
    const { id } = request.params;
    const { id: userId } = request.auth.credentials;
    await this._playlistsService.verifyPlaylistAccess(id, userId);
    const playlist = await this._playlistsService.getPlaylistSongs(id);
    return { status: 'success', data: { playlist } };
  }

  async deleteSongFromPlaylistHandler(request) {
    validatePlaylistSongPayload(request.payload);
    const { id: playlistId } = request.params;
    const { songId } = request.payload;
    const { id: userId } = request.auth.credentials;
    await this._playlistsService.verifyPlaylistAccess(playlistId, userId);
    // DIPERBAIKI: Pass userId ke service
    await this._playlistsService.removeSongFromPlaylist(playlistId, songId, userId);
    return { status: 'success', message: 'Lagu berhasil dihapus dari playlist' };
  }

  async getPlaylistActivitiesHandler(request) {
    const { id } = request.params;
    const { id: userId } = request.auth.credentials;
    await this._playlistsService.verifyPlaylistOwner(id, userId);
    const activities = await this._playlistsService.getPlaylistActivities(id);
    return { 
      status: 'success', 
      data: { 
        playlistId: id, 
        activities: Array.isArray(activities) ? activities : [] 
      } 
    };
  }
}

module.exports = PlaylistsHandler;