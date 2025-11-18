const pool = require('../database/pool');
const { nanoid } = require('nanoid');
const ClientError = require('../exceptions/ClientError');

class AuthenticationsService {
  async addRefreshToken(token) {
    const result = await pool.query('INSERT INTO authentications(token) VALUES($1) RETURNING token', [token]);
    return result.rows[0].token;
  }

  async verifyRefreshToken(token) {
    const result = await pool.query('SELECT token FROM authentications WHERE token = $1', [token]);
    if (!result.rowCount) {
      throw new ClientError('Refresh token tidak valid', 400);
    }
  }

  async deleteRefreshToken(token) {
    const result = await pool.query('DELETE FROM authentications WHERE token = $1 RETURNING token', [token]);
    if (!result.rowCount) {
      throw new ClientError('Refresh token gagal dihapus', 400);
    }
    return result.rows[0].token;
  }
}

module.exports = AuthenticationsService;