const { default: autoBind } = require('auto-bind');
const jwt = require('jsonwebtoken');
const { validateLoginPayload, validateRefreshPayload } = require('../validators/authentications');
const ClientError = require('../exceptions/ClientError');

class AuthenticationsHandler {
  constructor({ usersService, authenticationsService }) {
    this._usersService = usersService;
    this._authenticationsService = authenticationsService;
    autoBind(this);
  }

  async postAuthenticationHandler(request, h) {
    try {
      validateLoginPayload(request.payload);
      const { username, password } = request.payload;
      const userId = await this._usersService.verifyUserCredential(username, password);

      // generate tokens
      const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_KEY, { algorithm: 'HS256' });
      const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_KEY, { algorithm: 'HS256' });

      console.log('[LOGIN] Generated refresh token:', refreshToken.substring(0, 30) + '...');

      // store refresh token
      await this._authenticationsService.addRefreshToken(refreshToken);

      const res = h.response({ status: 'success', data: { accessToken, refreshToken } });
      res.code(201);
      return res;
    } catch (error) {
      console.error('[LOGIN] Error:', error);
      throw error;
    }
  }

  async putAuthenticationHandler(request) {
    try {
      validateRefreshPayload(request.payload);
      const { refreshToken } = request.payload;

      // DIPERBAIKI: Safe trim (check tipe dulu)
      if (typeof refreshToken !== 'string') {
        throw new ClientError('Refresh token harus string', 400);
      }

      const trimmedToken = refreshToken.trim();

      console.log('[REFRESH] Received token length:', trimmedToken.length);

      // verify token is stored in DB
      await this._authenticationsService.verifyRefreshToken(trimmedToken);

      // verify JWT signature
      const decoded = jwt.verify(trimmedToken, process.env.REFRESH_TOKEN_KEY);
      const { userId } = decoded;

      console.log('[REFRESH] ✅ Token verified');

      // generate new access token
      const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_KEY, { algorithm: 'HS256' });

      return { status: 'success', data: { accessToken } };
    } catch (e) {
      console.error('[REFRESH] Error:', e.message);
      throw new ClientError('Refresh token tidak valid', 400);
    }
  }

  async deleteAuthenticationHandler(request) {
    try {
      validateRefreshPayload(request.payload);
      const { refreshToken } = request.payload;

      // DIPERBAIKI: Safe trim
      if (typeof refreshToken !== 'string') {
        throw new ClientError('Refresh token harus string', 400);
      }

      const trimmedToken = refreshToken.trim();

      await this._authenticationsService.verifyRefreshToken(trimmedToken);
      await this._authenticationsService.deleteRefreshToken(trimmedToken);
      
      return { status: 'success', message: 'Refresh token berhasil dihapus' };
    } catch (error) {
      console.error('[DELETE AUTH] Error:', error);
      throw error;
    }
  }
}

module.exports = AuthenticationsHandler;