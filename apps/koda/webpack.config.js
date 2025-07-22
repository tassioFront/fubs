const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

module.exports = {
  output: {
    path: join(__dirname, '../../dist/apps/sugarfoot'),
  },
  devServer: {
    port: 4000,
    host: 'localhost',
  },
  resolve: {
    alias: {
      '@fubs/shared': join(__dirname, '../../libs/shared/dist/index.js'),
    },
    conditionNames: ['production', 'import', 'default'],
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
    }),
  ],
};
