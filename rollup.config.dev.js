import { getBabelInputPlugin, getBabelOutputPlugin } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import serve from 'rollup-plugin-serve';

export default {
  input: ['src/index.ts'],
  output: {
    file: 'dist/hacs-humidifier.js',
    format: 'es',
    name: 'hacs-humidifier',
    inlineDynamicImports: true,
  },
  plugins: [
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
    terser(),
    serve({
      contentBase: './dist',
      host: '0.0.0.0',
      port: 5000,
      allowCrossOrigin: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    }),
  ],
};
