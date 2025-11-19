const pool = require('../database/pool');
const bcrypt = require('bcrypt');
const { generateUserId } = require('../utils/idGenerator');
const ClientError = require('../exceptions/ClientError');

class UsersService {
  async addUser({ username, password, fullname }) {
    // Check if username is unique
    const result = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (result.rowCount) {
      throw new ClientError('Username sudah terdaftar', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const id = generateUserId();
    try {
      const res = await pool.query(
        'INSERT INTO users(id, username, password, fullname) VALUES($1, $2, $3, $4) RETURNING id',
        [id, username, hashedPassword, fullname]
      );
      return res.rows[0].id;
    } catch (error) {
      console.error('Database error in addUser:', error.message);
      throw new ClientError('Gagal menambahkan user', 400);
    }
  }

  async getUserById(id) {
    const result = await pool.query(
      'SELECT id, username, fullname FROM users WHERE id = $1',
      [id]
    );

    if (!result.rowCount) {
      throw new ClientError('User tidak ditemukan', 404);
    }

    return result.rows[0];
  }

  async verifyUserCredential(username, password) {
    const result = await pool.query(
      'SELECT id, password FROM users WHERE username = $1',
      [username]
    );

    if (!result.rowCount) {
      throw new ClientError('Kredensial yang Anda berikan salah', 401);
    }

    const { id, password: hashedPassword } = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, hashedPassword);

    if (!isValidPassword) {
      throw new ClientError('Kredensial yang Anda berikan salah', 401);
    }

    return id;
  }
}

module.exports = UsersService;