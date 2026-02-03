import { getBabelInputPlugin, getBabelOutputPlugin } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import serve from 'rollup-plugin-serve';

const dev = process.env.ROLLUP_WATCH;

const serveOptions = {
  contentBase: ['./dist'],
  host: '0.0.0.0',
  port: 5000,
  allowCrossOrigin: true,
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
};

const plugins = [
  typescript({
    declaration: false,
  }),
  nodeResolve(),
  json(),
  commonjs(),
  getBabelInputPlugin({
    babelHelpers: 'bundled',
  }),
  getBabelOutputPlugin({
    presets: [
      [
        '@babel/preset-env',
        {
          modules: false,
        },
      ],
    ],
    compact: true,
  }),
  ...(dev ? [serve(serveOptions)] : [terser()]),
];

export default [
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/hacs-humidifier.js',
      format: 'es',
      name: 'hacs-humidifier',
      inlineDynamicImports: true,
    },
    plugins,
    onwarn(warning, warn) {
      // Suppress 'this' has been rewritten to 'undefined' warnings from third-party deps
      if (warning.code === 'THIS_IS_UNDEFINED') return;
      warn(warning);
    },
  },
];
