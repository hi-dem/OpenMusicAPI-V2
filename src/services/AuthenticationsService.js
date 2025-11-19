const pool = require('../database/pool');
const ClientError = require('../exceptions/ClientError');

class AuthenticationsService {
  async addRefreshToken(token) {
    try {
      // DIPERBAIKI: Safe check
      if (!token || typeof token !== 'string') {
        throw new ClientError('Token invalid', 400);
      }

      const trimmedToken = token.trim();
      
      if (trimmedToken === '') {
        throw new ClientError('Token kosong', 400);
      }

      console.log('[ADD TOKEN] Saving token, length:', trimmedToken.length);
      
      await pool.query(
        'INSERT INTO authentications(token) VALUES($1)',
        [trimmedToken]
      );
      
      console.log('[ADD TOKEN] ✅ Token saved');
    } catch (error) {
      if (error instanceof ClientError) throw error;
      console.error('[ADD TOKEN] Error:', error.message);
      throw new ClientError('Gagal menyimpan refresh token', 400);
    }
  }

  async verifyRefreshToken(token) {
    try {
      // DIPERBAIKI: Safe check
      if (!token || typeof token !== 'string') {
        throw new ClientError('Token invalid', 400);
      }

      const trimmedToken = token.trim();
      
      if (trimmedToken === '') {
        throw new ClientError('Token kosong', 400);
      }

      console.log('[VERIFY TOKEN] Checking token, length:', trimmedToken.length);
      
      const result = await pool.query(
        'SELECT token FROM authentications WHERE token = $1',
        [trimmedToken]
      );
      
      if (!result.rowCount) {
        console.log('[VERIFY TOKEN] Token NOT found in DB');
        throw new ClientError('Refresh token tidak valid', 400);
      }
      
      console.log('[VERIFY TOKEN] ✅ Token found in DB');
    } catch (error) {
      if (error instanceof ClientError) throw error;
      console.error('[VERIFY TOKEN] Error:', error.message);
      throw new ClientError('Refresh token tidak valid', 400);
    }
  }

  async deleteRefreshToken(token) {
    try {
      // DIPERBAIKI: Safe check
      if (!token || typeof token !== 'string') {
        throw new ClientError('Token invalid', 400);
      }

      const trimmedToken = token.trim();
      
      const result = await pool.query(
        'DELETE FROM authentications WHERE token = $1',
        [trimmedToken]
      );
      
      console.log('[DELETE TOKEN] Deleted, rows affected:', result.rowCount);
    } catch (error) {
      if (error instanceof ClientError) throw error;
      console.error('[DELETE TOKEN] Error:', error.message);
      throw new ClientError('Gagal menghapus refresh token', 400);
    }
  }
}

module.exports = AuthenticationsService;