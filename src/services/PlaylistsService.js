const pool = require('../database/pool');
const { generatePlaylistId } = require('../utils/idGenerator');
const { nanoid } = require('nanoid');
const ClientError = require('../exceptions/ClientError');

class PlaylistsService {
  constructor(collaborationsService) {
    this._collaborationsService = collaborationsService;
  }

  async addPlaylist({ name, owner }) {
    const id = generatePlaylistId();
    await pool.query('INSERT INTO playlists(id,name,owner) VALUES($1,$2,$3)', [id, name, owner]);
    return id;
  }

  async getPlaylistsByUser(userId) {
    const result = await pool.query(
      `SELECT p.id, p.name, u.username
       FROM playlists p
       JOIN users u ON p.owner = u.id
       WHERE p.owner = $1
       UNION
       SELECT p.id, p.name, u.username
       FROM collaborations c
       JOIN playlists p ON c.playlist_id = p.id
       JOIN users u ON p.owner = u.id
       WHERE c.user_id = $1`,
      [userId]
    );
    return result.rows;
  }

  async verifyPlaylistOwner(playlistId, owner) {
    const result = await pool.query('SELECT id FROM playlists WHERE id=$1 AND owner=$2', [playlistId, owner]);
    if (!result.rowCount) {
      const playlistExists = await pool.query('SELECT id FROM playlists WHERE id=$1', [playlistId]);
      if (!playlistExists.rowCount) {
        throw new ClientError('Playlist tidak ditemukan', 404);
      }
      throw new ClientError('Anda bukan pemilik playlist ini', 403);
    }
  }

  async verifyPlaylistExists(playlistId) {
    const result = await pool.query('SELECT id FROM playlists WHERE id=$1', [playlistId]);
    if (!result.rowCount) throw new ClientError('Playlist tidak ditemukan', 404);
  }

  async verifyPlaylistAccess(playlistId, userId) {
    const q = await pool.query('SELECT id FROM playlists WHERE id=$1 AND owner=$2', [playlistId, userId]);
    if (q.rowCount) return;
    
    const playlistExists = await pool.query('SELECT id FROM playlists WHERE id=$1', [playlistId]);
    if (!playlistExists.rowCount) {
      throw new ClientError('Playlist tidak ditemukan', 404);
    }
    
    await this._collaborationsService.verifyCollaborator(playlistId, userId);
  }

  async deletePlaylist(playlistId) {
    const res = await pool.query('DELETE FROM playlists WHERE id=$1 RETURNING id', [playlistId]);
    if (!res.rowCount) throw new ClientError('Playlist gagal dihapus. Id tidak ditemukan', 404);
  }

  async addSongToPlaylist(playlistId, songId, userId) {
    await this.verifyPlaylistExists(playlistId);

    const songCheck = await pool.query('SELECT id FROM songs WHERE id = $1', [songId]);
    if (!songCheck.rowCount) {
      throw new ClientError('Lagu tidak ditemukan', 404);
    }

    const id = `ps-${nanoid(12)}`;
    await pool.query('INSERT INTO playlist_songs(id,playlist_id,song_id) VALUES($1,$2,$3)', [id, playlistId, songId]);
    
    // DIPERBAIKI: Insert activity
    if (userId) {
      const activityId = `activity-${nanoid(12)}`;
      await pool.query(
        'INSERT INTO playlist_song_activities(id,playlist_id,song_id,user_id,action) VALUES($1,$2,$3,$4,$5)',
        [activityId, playlistId, songId, userId, 'add']
      );
    }
    
    return id;
  }

  async getPlaylistSongs(playlistId) {
    const result = await pool.query(
      `SELECT p.id as playlist_id, p.name as playlist_name, u.username as owner, s.id as song_id, s.title, s.performer
       FROM playlists p
       JOIN users u ON p.owner = u.id
       LEFT JOIN playlist_songs ps ON p.id = ps.playlist_id
       LEFT JOIN songs s ON ps.song_id = s.id
       WHERE p.id = $1`,
      [playlistId]
    );
    if (!result.rowCount) throw new ClientError('Playlist tidak ditemukan', 404);
    const res0 = result.rows[0];
    const songs = result.rows.filter(r => r.song_id).map(r => ({ id: r.song_id, title: r.title, performer: r.performer }));
    return {
      id: playlistId,
      name: res0.playlist_name,
      username: res0.owner,
      songs
    };
  }

  async removeSongFromPlaylist(playlistId, songId, userId) {
    await this.verifyPlaylistExists(playlistId);
    
    const res = await pool.query('DELETE FROM playlist_songs WHERE playlist_id=$1 AND song_id=$2 RETURNING id', [playlistId, songId]);
    if (!res.rowCount) throw new ClientError('Lagu gagal dihapus dari playlist. Id tidak ditemukan', 404);
    
    // DIPERBAIKI: Insert activity
    if (userId) {
      const activityId = `activity-${nanoid(12)}`;
      await pool.query(
        'INSERT INTO playlist_song_activities(id,playlist_id,song_id,user_id,action) VALUES($1,$2,$3,$4,$5)',
        [activityId, playlistId, songId, userId, 'remove']
      );
    }
  }

  async getPlaylistActivities(playlistId) {
    await this.verifyPlaylistExists(playlistId);

    const result = await pool.query(
      `SELECT psa.id, psa.user_id as userId, u.username, psa.action, psa.time
       FROM playlist_song_activities psa
       JOIN users u ON psa.user_id = u.id
       WHERE psa.playlist_id = $1
       ORDER BY psa.time DESC`,
      [playlistId]
    );
    return result.rows;
  }
}

module.exports = PlaylistsService;