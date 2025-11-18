module.exports = ({ usersHandler, authenticationsHandler, albumsHandler, songsHandler, playlistsHandler, collaborationsHandler }) => [
  // users
  { method: 'POST', path: '/users', handler: usersHandler.postUserHandler.bind(usersHandler) },
  { method: 'GET', path: '/users/{id}', handler: usersHandler.getUserByIdHandler.bind(usersHandler) },

  // authentications
  { method: 'POST', path: '/authentications', handler: authenticationsHandler.postAuthenticationHandler.bind(authenticationsHandler) },
  { method: 'PUT', path: '/authentications', handler: authenticationsHandler.putAuthenticationHandler.bind(authenticationsHandler) },
  { method: 'DELETE', path: '/authentications', handler: authenticationsHandler.deleteAuthenticationHandler.bind(authenticationsHandler) },

  // albums
  { method: 'POST', path: '/albums', handler: albumsHandler.postAlbumHandler.bind(albumsHandler) },
  { method: 'GET', path: '/albums/{id}', handler: albumsHandler.getAlbumByIdHandler.bind(albumsHandler) },
  { method: 'PUT', path: '/albums/{id}', handler: albumsHandler.putAlbumByIdHandler.bind(albumsHandler) },
  { method: 'DELETE', path: '/albums/{id}', handler: albumsHandler.deleteAlbumByIdHandler.bind(albumsHandler) },

  // songs
  { method: 'POST', path: '/songs', handler: songsHandler.postSongHandler.bind(songsHandler) },
  { method: 'GET', path: '/songs', handler: songsHandler.getSongsHandler.bind(songsHandler) },
  { method: 'GET', path: '/songs/{id}', handler: songsHandler.getSongByIdHandler.bind(songsHandler) },
  { method: 'PUT', path: '/songs/{id}', handler: songsHandler.putSongByIdHandler.bind(songsHandler) },
  { method: 'DELETE', path: '/songs/{id}', handler: songsHandler.deleteSongByIdHandler.bind(songsHandler) },

  // playlists (protected)
  { method: 'POST', path: '/playlists', handler: playlistsHandler.postPlaylistHandler.bind(playlistsHandler), options: { auth: 'openmusic_jwt' } },
  { method: 'GET', path: '/playlists', handler: playlistsHandler.getPlaylistsHandler.bind(playlistsHandler), options: { auth: 'openmusic_jwt' } },
  { method: 'DELETE', path: '/playlists/{id}', handler: playlistsHandler.deletePlaylistHandler.bind(playlistsHandler), options: { auth: 'openmusic_jwt' } },

  // playlist songs (protected)
  { method: 'POST', path: '/playlists/{id}/songs', handler: playlistsHandler.postSongToPlaylistHandler.bind(playlistsHandler), options: { auth: 'openmusic_jwt' } },
  { method: 'GET', path: '/playlists/{id}/songs', handler: playlistsHandler.getPlaylistSongsHandler.bind(playlistsHandler), options: { auth: 'openmusic_jwt' } },
  { method: 'DELETE', path: '/playlists/{id}/songs', handler: playlistsHandler.deleteSongFromPlaylistHandler.bind(playlistsHandler), options: { auth: 'openmusic_jwt' } },

  // collaborations (protected)
  { method: 'POST', path: '/collaborations', handler: collaborationsHandler.postCollaborationHandler.bind(collaborationsHandler), options: { auth: 'openmusic_jwt' } },
  { method: 'DELETE', path: '/collaborations', handler: collaborationsHandler.deleteCollaborationHandler.bind(collaborationsHandler), options: { auth: 'openmusic_jwt' } }
];