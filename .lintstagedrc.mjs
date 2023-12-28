export default {
  '*': ['prettier --write --ignore-unknown'],
  'src/**/*.{js}': ['eslint --cache --fix'],
};
