const pool = require('../database/pool');
const { generateAlbumId } = require('../utils/idGenerator');
const ClientError = require('../exceptions/ClientError');

class AlbumsService {
  async addAlbum({ name, year }) {
    const id = generateAlbumId();
    try {
      const result = await pool.query(
        'INSERT INTO albums(id,name,year) VALUES($1,$2,$3) RETURNING id',
        [id, name, year]
      );
      return result.rows[0].id;
    } catch (error) {
      console.error('Database error in addAlbum:', error.message);
      throw new ClientError('Gagal membuat album', 400);
    }
  }

  async getAlbumById(id) {
    try {
      const result = await pool.query(
        `SELECT a.id, a.name, a.year, 
                json_agg(json_build_object('id', s.id, 'title', s.title, 'performer', s.performer, 'genre', s.genre, 'duration', s.duration, 'albumId', s.album_id)) 
                FILTER (WHERE s.id IS NOT NULL) as songs
         FROM albums a
         LEFT JOIN songs s ON a.id = s.album_id
         WHERE a.id = $1
         GROUP BY a.id`,
        [id]
      );
      if (!result.rowCount) {
        throw new ClientError('Album tidak ditemukan', 404);
      }
      const row = result.rows[0];
      return {
        id: row.id,
        name: row.name,
        year: row.year,
        songs: row.songs || []
      };
    } catch (error) {
      if (error instanceof ClientError) throw error;
      console.error('Database error in getAlbumById:', error.message);
      throw new ClientError('Gagal mengambil album', 500);
    }
  }

  async editAlbumById(id, { name, year }) {
    try {
      const result = await pool.query(
        'UPDATE albums SET name=$1, year=$2 WHERE id=$3 RETURNING id',
        [name, year, id]
      );
      if (!result.rowCount) {
        throw new ClientError('Album tidak ditemukan', 404);
      }
    } catch (error) {
      if (error instanceof ClientError) throw error;
      console.error('Database error in editAlbumById:', error.message);
      throw new ClientError('Gagal mengupdate album', 500);
    }
  }

  async deleteAlbumById(id) {
    try {
      const result = await pool.query('DELETE FROM albums WHERE id=$1 RETURNING id', [id]);
      if (!result.rowCount) {
        throw new ClientError('Album tidak ditemukan', 404);
      }
    } catch (error) {
      if (error instanceof ClientError) throw error;
      console.error('Database error in deleteAlbumById:', error.message);
      throw new ClientError('Gagal menghapus album', 500);
    }
  }
}

module.exports = AlbumsService;