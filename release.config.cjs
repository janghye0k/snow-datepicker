/**
 * @type {import('semantic-release').GlobalConfig}
 */
module.exports = {
  branches: ['release'],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/changelog',
      {
        changelogTitle: '# Change Log',
        changelogFile: 'CHANGELOG.md',
      },
    ],
    [
      '@semantic-release/git',
      {
        assets: [
          'CHANGELOG.md',
          'package.json',
          'package-lock.json',
          'pnpm-lock.yaml',
        ],
        message: 'chore(release): ${nextRelease.version}',
      },
    ],
    [
      '@semantic-release/exec',
      {
        generateNotesCmd:
          'node ./scripts/updateVersion.js ${nextRelease.version}',
        publishCmd: 'pnpm build && node ./scripts/createZip.js',
      },
    ],
    [
      '@semantic-release/github',
      {
        assets: [
          { path: 'dist_zip/datepicker.zip', label: 'DatePicker build files' },
        ],
      },
    ],
    [
      '@semantic-release/npm',
      {
        pkgRoot: 'dist',
      },
    ],
  ],
};
