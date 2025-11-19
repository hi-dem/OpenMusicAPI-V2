require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');

const UsersService = require('./services/UsersService');
const AuthenticationsService = require('./services/AuthenticationsService');
const AlbumsService = require('./services/AlbumsService');
const SongsService = require('./services/SongsService');
const CollaborationsService = require('./services/CollaborationsService');
const PlaylistsService = require('./services/PlaylistsService');

const UsersHandler = require('./handlers/UsersHandler');
const AuthenticationsHandler = require('./handlers/AuthenticationsHandler');
const AlbumsHandler = require('./handlers/AlbumsHandler');
const SongsHandler = require('./handlers/SongsHandler');
const CollaborationsHandler = require('./handlers/CollaborationsHandler');
const PlaylistsHandler = require('./handlers/PlaylistsHandler');

const routes = require('./routes');
const ClientError = require('./exceptions/ClientError');

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 5000,
    host: process.env.HOST || 'localhost',
    routes: { cors: { origin: ['*'] } }
  });

  await server.register(Jwt);

  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: Number(process.env.ACCESS_TOKEN_AGE || 3600)
    },
    validate: (artifacts) => {
      return {
        isValid: true,
        credentials: { id: artifacts.decoded.payload.userId }
      };
    }
  });

  // services
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const collaborationsService = new CollaborationsService();
  const playlistsService = new PlaylistsService(collaborationsService);

  // handlers
  const usersHandler = new UsersHandler(usersService);
  const authenticationsHandler = new AuthenticationsHandler({ usersService, authenticationsService });
  const albumsHandler = new AlbumsHandler(albumsService);
  const songsHandler = new SongsHandler(songsService);
  const collaborationsHandler = new CollaborationsHandler(collaborationsService, playlistsService);
  const playlistsHandler = new PlaylistsHandler(playlistsService);

  server.route(routes({
    usersHandler,
    authenticationsHandler,
    albumsHandler,
    songsHandler,
    playlistsHandler,
    collaborationsHandler
  }));

  // global error handling via onPreResponse
  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      // Handle ClientError
      if (response instanceof ClientError) {
        const res = h.response({ 
          status: 'fail', 
          message: response.message 
        });
        res.code(response.statusCode || 400);
        return res;
      }

      // Handle Boom/Joi validation error
      if (response.isBoom) {
        const res = h.response({
          status: 'fail',
          message: response.message
        });
        res.code(response.output.statusCode);
        return res;
      }

      // Handle other errors
      if (!response.isServer) return h.continue;

      console.error('[SERVER ERROR]', response);
      const res = h.response({ 
        status: 'error', 
        message: 'Maaf, terjadi kegagalan pada server kami.' 
      });
      res.code(500);
      return res;
    }
    return h.continue;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1);
});

init();