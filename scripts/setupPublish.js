const path = require('path');
const fs = require('fs');
const pkg = require('../package.json');
const { has } = require('doumi');

const dist = path.resolve(__dirname, '..', 'dist');

// Create package.json
const deleteKeys = ['scripts', 'devDependencies', 'private'];
deleteKeys.forEach((key) => has(pkg, key) && delete pkg[key]);
fs.writeFileSync(
  path.join(dist, 'package.json'),
  JSON.stringify(pkg, null, 2),
  { encoding: 'utf-8' }
);

// Copy files
const copyFileList = ['CHANGELOG.md', 'README.md', 'LICENSE'];
copyFileList.forEach((file) => {
  fs.cpSync(path.resolve(__dirname, '..', file), path.join(dist, file));
});
