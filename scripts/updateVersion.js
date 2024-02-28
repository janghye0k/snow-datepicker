const fs = require('fs');
const path = require('path');
const pkg = require('../package.json');
const { exec } = require('child_process');

const pkgPath = path.resolve(__dirname, '..', 'package.json');
const nextVersion = process.argv[2];
pkg.version = nextVersion;

fs.writeFileSync(pkgPath, JSON.stringify(pkg));
exec('npx prettier package.json --write');
