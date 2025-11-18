const { nanoid } = require('nanoid');

const generateUserId = () => `user-${nanoid(12)}`;
const generateAlbumId = () => `album-${nanoid(16)}`;
const generateSongId = () => `song-${nanoid(16)}`;
const generatePlaylistId = () => `playlist-${nanoid(16)}`;
const generateCollabId = () => `collab-${nanoid(12)}`;
const generateActivityId = () => `activity-${nanoid(12)}`;

module.exports = {
  generateUserId,
  generateAlbumId,
  generateSongId,
  generatePlaylistId,
  generateCollabId,
  generateActivityId
};