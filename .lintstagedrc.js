module.exports = {
  '*': ['prettier --write --ignore-unknown'],
  'src/**/*.{js}': ['eslint --cache --fix'],
};
