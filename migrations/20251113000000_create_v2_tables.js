exports.shorthands = undefined;

exports.up = (pgm) => {
  // users
  pgm.createTable('users', {
    id: { type: 'text', primaryKey: true },
    username: { type: 'text', notNull: true, unique: true },
    password: { type: 'text', notNull: true },
    fullname: { type: 'text', notNull: true }
  });

  // authentications (store refresh tokens)
  pgm.createTable('authentications', {
    token: { type: 'text', notNull: true, primaryKey: true }
  });

  // albums
  pgm.createTable('albums', {
    id: { type: 'text', primaryKey: true },
    name: { type: 'text', notNull: true },
    year: { type: 'integer', notNull: true }
  });

  // songs
  pgm.createTable('songs', {
    id: { type: 'text', primaryKey: true },
    title: { type: 'text', notNull: true },
    year: { type: 'integer', notNull: true },
    performer: { type: 'text', notNull: true },
    genre: { type: 'text', notNull: true },
    duration: { type: 'integer' },
    album_id: { type: 'text', references: 'albums(id)', onDelete: 'SET NULL' }
  });

  // playlists
  pgm.createTable('playlists', {
    id: { type: 'text', primaryKey: true },
    name: { type: 'text', notNull: true },
    owner: { type: 'text', notNull: true, references: 'users(id)' }
  });

  // playlist_songs
  pgm.createTable('playlist_songs', {
    id: { type: 'text', primaryKey: true },
    playlist_id: { type: 'text', references: 'playlists(id)', onDelete: 'CASCADE' },
    song_id: { type: 'text', references: 'songs(id)', onDelete: 'CASCADE' }
  });

  // collaborations (optional)
  pgm.createTable('collaborations', {
    id: { type: 'text', primaryKey: true },
    playlist_id: { type: 'text', references: 'playlists(id)', onDelete: 'CASCADE' },
    user_id: { type: 'text', references: 'users(id)', onDelete: 'CASCADE' }
  });

  // DIPERBAIKI: Tambahkan unique constraint untuk mencegah duplicate collaboration
  pgm.addConstraint('collaborations', 'unique_playlist_user', {
    unique: ['playlist_id', 'user_id']
  });

  // optional activities table
  pgm.createTable('playlist_song_activities', {
    id: { type: 'text', primaryKey: true },
    playlist_id: { type: 'text', references: 'playlists(id)', onDelete: 'CASCADE' },
    song_id: { type: 'text', references: 'songs(id)', onDelete: 'CASCADE' },
    user_id: { type: 'text', references: 'users(id)', onDelete: 'CASCADE' },
    action: { type: 'text', notNull: true },
    time: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') }
  });
};

exports.down = (pgm) => {
  pgm.dropTable('playlist_song_activities');
  pgm.dropTable('collaborations');
  pgm.dropTable('playlist_songs');
  pgm.dropTable('playlists');
  pgm.dropTable('songs');
  pgm.dropTable('albums');
  pgm.dropTable('authentications');
  pgm.dropTable('users');
};