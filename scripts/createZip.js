const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const outputDir = path.resolve(__dirname, '..', 'dist_zip');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
const output = fs.createWriteStream(path.join(outputDir, 'datepicker.zip'));

const archive = archiver('zip', { zlib: { level: 9 } });
archive.pipe(output);
archive.directory('dist', '');

archive.finalize();
