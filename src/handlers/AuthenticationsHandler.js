const autoBind = require('auto-bind');
const Jwt = require('@hapi/jwt');
const { validateLoginPayload, validateRefreshPayload } = require('../validators/authentications');
const ClientError = require('../exceptions/ClientError');

class AuthenticationsHandler {
  constructor({ usersService, authenticationsService }) {
    this._usersService = usersService;
    this._authenticationsService = authenticationsService;
    autoBind(this);
  }

  async postAuthenticationHandler(request, h) {
    validateLoginPayload(request.payload);
    const { username, password } = request.payload;
    const userId = await this._usersService.verifyUserCredential(username, password);

    // generate tokens
    const accessToken = Jwt.token.generate({ userId }, { key: process.env.ACCESS_TOKEN_KEY, algorithm: 'HS256' });
    const refreshToken = Jwt.token.generate({ userId }, { key: process.env.REFRESH_TOKEN_KEY, algorithm: 'HS256' });

    // store refresh token
    await this._authenticationsService.addRefreshToken(refreshToken);

    const res = h.response({ status: 'success', data: { accessToken, refreshToken } });
    res.code(201);
    return res;
  }

  async putAuthenticationHandler(request, h) {
    validateRefreshPayload(request.payload);
    const { refreshToken } = request.payload;

    // verify signature of refresh token
    try {
      Jwt.token.verify(refreshToken, process.env.REFRESH_TOKEN_KEY);
    } catch (e) {
      // DIPERBAIKI: Throw ClientError bukan Error biasa
      throw new ClientError('Refresh token tidak valid', 400);
    }

    // verify token is stored
    await this._authenticationsService.verifyRefreshToken(refreshToken);

    const artifacts = Jwt.token.decode(refreshToken);
    const { userId } = artifacts.decoded.payload;

    const accessToken = Jwt.token.generate({ userId }, { key: process.env.ACCESS_TOKEN_KEY, algorithm: 'HS256' });

    return { status: 'success', data: { accessToken } };
  }

  async deleteAuthenticationHandler(request) {
    validateRefreshPayload(request.payload);
    const { refreshToken } = request.payload;
    await this._authenticationsService.verifyRefreshToken(refreshToken);
    await this._authenticationsService.deleteRefreshToken(refreshToken);
    return { status: 'success', message: 'Refresh token berhasil dihapus' };
  }
}

module.exports = AuthenticationsHandler;