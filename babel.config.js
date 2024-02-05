module.exports = (api, targets) => {
  const isTestEnv = api.env('test');

  return {
    babelrc: false,
    ignore: ['./node_modules'],
    presets: [
      [
        '@babel/preset-env',
        {
          targets: isTestEnv ? { node: 'current' } : targets,
        },
      ],
      '@babel/preset-typescript',
    ],
  };
};
