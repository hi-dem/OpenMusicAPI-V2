const pool = require('../database/pool');
const { generateSongId } = require('../utils/idGenerator');
const ClientError = require('../exceptions/ClientError');

class SongsService {
  async addSong({ title, year, performer, genre, duration, albumId }) {
    const id = generateSongId();
    try {
      const result = await pool.query(
        'INSERT INTO songs(id,title,year,performer,genre,duration,album_id) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id',
        [id, title, year, performer, genre, duration || null, albumId || null]
      );
      return result.rows[0].id;
    } catch (error) {
      console.error('Database error in addSong:', error.message);
      throw new ClientError('Gagal membuat lagu', 400);
    }
  }

  async getSongs({ title, performer } = {}) {
    try {
      const conditions = [];
      const values = [];
      let idx = 1;
      
      if (title) {
        conditions.push(`title ILIKE $${idx++}`);
        values.push(`%${title}%`);
      }
      if (performer) {
        conditions.push(`performer ILIKE $${idx++}`);
        values.push(`%${performer}%`);
      }
      
      const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
      const result = await pool.query(
        `SELECT id,title,performer FROM songs ${where}`,
        values
      );
      return result.rows;
    } catch (error) {
      console.error('Database error in getSongs:', error.message);
      throw new ClientError('Gagal mengambil lagu', 500);
    }
  }

  async getSongById(id) {
    try {
      const result = await pool.query(
        'SELECT id,title,year,performer,genre,duration,album_id FROM songs WHERE id=$1',
        [id]
      );
      if (!result.rowCount) {
        throw new ClientError('Lagu tidak ditemukan', 404);
      }
      const row = result.rows[0];
      return {
        id: row.id,
        title: row.title,
        year: row.year,
        performer: row.performer,
        genre: row.genre,
        duration: row.duration,
        albumId: row.album_id
      };
    } catch (error) {
      if (error instanceof ClientError) throw error;
      console.error('Database error in getSongById:', error.message);
      throw new ClientError('Gagal mengambil lagu', 500);
    }
  }

  async editSongById(id, { title, year, performer, genre, duration, albumId }) {
    try {
      const result = await pool.query(
        'UPDATE songs SET title=$1, year=$2, performer=$3, genre=$4, duration=$5, album_id=$6 WHERE id=$7 RETURNING id',
        [title, year, performer, genre, duration || null, albumId || null, id]
      );
      if (!result.rowCount) {
        throw new ClientError('Lagu tidak ditemukan', 404);
      }
    } catch (error) {
      if (error instanceof ClientError) throw error;
      console.error('Database error in editSongById:', error.message);
      throw new ClientError('Gagal mengupdate lagu', 500);
    }
  }

  async deleteSongById(id) {
    try {
      const result = await pool.query('DELETE FROM songs WHERE id=$1 RETURNING id', [id]);
      if (!result.rowCount) {
        throw new ClientError('Lagu tidak ditemukan', 404);
      }
    } catch (error) {
      if (error instanceof ClientError) throw error;
      console.error('Database error in deleteSongById:', error.message);
      throw new ClientError('Gagal menghapus lagu', 500);
    }
  }
}

module.exports = SongsService;