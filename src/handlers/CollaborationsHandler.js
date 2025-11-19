const { default: autoBind } = require('auto-bind');
const { validateCollaborationPayload } = require('../validators/collaborations');

class CollaborationsHandler {
  constructor(collaborationsService, playlistsService) {
    this._collaborationsService = collaborationsService;
    this._playlistsService = playlistsService;
    autoBind(this);
  }

  async postCollaborationHandler(request, h) {
    validateCollaborationPayload(request.payload);
    const { playlistId, userId } = request.payload;
    const { id: owner } = request.auth.credentials;
    await this._playlistsService.verifyPlaylistOwner(playlistId, owner);
    const collaborationId = await this._collaborationsService.addCollaboration(playlistId, userId);
    const res = h.response({ status: 'success', data: { collaborationId } });
    res.code(201);
    return res;
  }

  async deleteCollaborationHandler(request) {
    validateCollaborationPayload(request.payload);
    const { playlistId, userId } = request.payload;
    const { id: owner } = request.auth.credentials;
    await this._playlistsService.verifyPlaylistOwner(playlistId, owner);
    await this._collaborationsService.deleteCollaboration(playlistId, userId);
    return { status: 'success', message: 'Kolaborasi berhasil dihapus' };
  }
}

module.exports = CollaborationsHandler;