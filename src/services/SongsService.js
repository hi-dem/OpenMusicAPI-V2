const pool = require('../database/pool');
const { generateSongId } = require('../utils/idGenerator');
const ClientError = require('../exceptions/ClientError');

class SongsService {
  async addSong({ title, year, performer, genre, duration, albumId }) {
    const id = generateSongId();
    const result = await pool.query(
      'INSERT INTO songs(id,title,year,performer,genre,duration,album_id) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id',
      [id, title, year, performer, genre, duration || null, albumId || null]
    );
    return result.rows[0].id;
  }

  async getSongs({ title, performer } = {}) {
    const conditions = [];
    const values = [];
    let idx = 1;
    if (title) { conditions.push(`title ILIKE $${idx++}`); values.push(`%${title}%`); }
    if (performer) { conditions.push(`performer ILIKE $${idx++}`); values.push(`%${performer}%`); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await pool.query(`SELECT id,title,performer FROM songs ${where}`, values);
    return result.rows;
  }

  async getSongById(id) {
    const result = await pool.query('SELECT id,title,year,performer,genre,duration,album_id FROM songs WHERE id=$1', [id]);
    if (!result.rowCount) throw new ClientError('Lagu tidak ditemukan', 404);
    const r = result.rows[0];
    return {
      id: r.id,
      title: r.title,
      year: r.year,
      performer: r.performer,
      genre: r.genre,
      duration: r.duration,
      albumId: r.album_id
    };
  }

  async editSongById(id, { title, year, performer, genre, duration, albumId }) {
    const result = await pool.query('UPDATE songs SET title=$1, year=$2, performer=$3, genre=$4, duration=$5, album_id=$6 WHERE id=$7 RETURNING id', [title, year, performer, genre, duration || null, albumId || null, id]);
    if (!result.rowCount) throw new ClientError('Gagal memperbarui lagu. Id tidak ditemukan', 404);
  }

  async deleteSongById(id) {
    const result = await pool.query('DELETE FROM songs WHERE id=$1 RETURNING id', [id]);
    if (!result.rowCount) throw new ClientError('Lagu gagal dihapus. Id tidak ditemukan', 404);
  }
}

module.exports = SongsService;