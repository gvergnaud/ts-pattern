import { terser } from 'rollup-plugin-terser';
import pluginTypescript from '@rollup/plugin-typescript';
import pluginCommonjs from '@rollup/plugin-commonjs';
import pluginNodeResolve from '@rollup/plugin-node-resolve';
import { babel } from '@rollup/plugin-babel';
import * as path from 'path';
import pkg from './package.json';

const moduleName = pkg.name;
const inputFileName = 'src/index.ts';
const author = pkg.author;
const banner = `/**
 * @license
 * author: ${author}
 * ${moduleName} v${pkg.version}
 * Released under the ${pkg.license} license.
 */`;

const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.devDependencies || {}),
];

export default [
  // ES
  {
    input: inputFileName,
    output: [
      {
        file: pkg.module,
        format: 'es',
        banner,
        exports: 'named',
      },
      {
        file: pkg.module.replace('.mjs', '.min.mjs'),
        format: 'es',
        banner,
        exports: 'named',
        plugins: [terser()],
      },
    ],
    external,
    plugins: [
      pluginTypescript({ tsconfig: './tsconfig.json' }),
      pluginCommonjs({
        extensions: ['.js', '.ts'],
      }),
      babel({
        babelHelpers: 'bundled',
        configFile: path.resolve(__dirname, '.babelrc.js'),
      }),
      pluginNodeResolve({
        browser: false,
      }),
    ],
  },

  // CommonJS
  {
    input: inputFileName,
    output: [
      {
        file: pkg.main,
        format: 'cjs',
        banner,
      },
      {
        file: pkg.main.replace('.js', '.min.js'),
        format: 'cjs',
        banner,
        plugins: [terser()],
      },
    ],
    external,
    plugins: [
      pluginTypescript({ tsconfig: './tsconfig.json' }),
      pluginCommonjs({
        extensions: ['.js', '.ts'],
      }),
      babel({
        babelHelpers: 'bundled',
        configFile: path.resolve(__dirname, '.babelrc.js'),
      }),
      pluginNodeResolve({
        browser: false,
      }),
    ],
  },
];
