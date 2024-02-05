const path = require('path');

const aliasOptions = [
  { find: '@', replacement: path.resolve(__dirname, 'src') },
  { find: '@t', replacement: path.resolve(__dirname, 'types') },
];

module.exports = { aliasOptions };
