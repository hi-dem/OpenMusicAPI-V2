const pool = require('../database/pool');
const { generateCollabId } = require('../utils/idGenerator');
const ClientError = require('../exceptions/ClientError');

class CollaborationsService {
  async addCollaboration(playlistId, userId) {
    // DIPERBAIKI: Validate user exists sebelum menambahkan kolaborasi
    const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [userId]);
    if (!userCheck.rowCount) {
      throw new ClientError('User tidak ditemukan', 404);
    }

    const id = generateCollabId();
    await pool.query('INSERT INTO collaborations(id,playlist_id,user_id) VALUES($1,$2,$3)', [id, playlistId, userId]);
    return id;
  }

  async verifyCollaborator(playlistId, userId) {
    const result = await pool.query('SELECT id FROM collaborations WHERE playlist_id=$1 AND user_id=$2', [playlistId, userId]);
    if (!result.rowCount) throw new ClientError('Anda tidak memiliki akses kolaborator', 403);
  }

  async deleteCollaboration(playlistId, userId) {
    const result = await pool.query('DELETE FROM collaborations WHERE playlist_id=$1 AND user_id=$2 RETURNING id', [playlistId, userId]);
    if (!result.rowCount) throw new ClientError('Kolaborasi gagal dihapus', 404);
  }
}

module.exports = CollaborationsService;