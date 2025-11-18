const pool = require('../database/pool');
const { generateAlbumId } = require('../utils/idGenerator');
const ClientError = require('../exceptions/ClientError');

class AlbumsService {
  async addAlbum({ name, year }) {
    const id = generateAlbumId();
    const result = await pool.query('INSERT INTO albums(id,name,year) VALUES($1,$2,$3) RETURNING id', [id, name, year]);
    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const result = await pool.query('SELECT id,name,year FROM albums WHERE id=$1', [id]);
    if (!result.rowCount) throw new ClientError('Album tidak ditemukan', 404);
    return result.rows[0];
  }

  async editAlbumById(id, { name, year }) {
    const result = await pool.query('UPDATE albums SET name=$1, year=$2 WHERE id=$3 RETURNING id', [name, year, id]);
    if (!result.rowCount) throw new ClientError('Gagal memperbarui album. Id tidak ditemukan', 404);
  }

  async deleteAlbumById(id) {
    const result = await pool.query('DELETE FROM albums WHERE id=$1 RETURNING id', [id]);
    if (!result.rowCount) throw new ClientError('Album gagal dihapus. Id tidak ditemukan', 404);
  }
}

module.exports = AlbumsService;