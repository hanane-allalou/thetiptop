// scripts/build-ssr.mjs
import { build } from 'esbuild';
import { sassPlugin } from 'esbuild-sass-plugin';
import path from 'path';
import { mkdirSync } from 'fs';

const entry = path.resolve('src/ssr/entry-server.jsx');
const outdir = path.resolve('build-ssr');
mkdirSync(outdir, { recursive: true });

await build({
  entryPoints: [entry],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  target: ['node20'],
  outfile: path.join(outdir, 'entry-server.cjs'),
  plugins: [sassPlugin({ type: 'css' })],
  jsx: 'automatic',
  jsxImportSource: 'react',
  inject: [path.resolve('scripts/react-inject.js')],
  loader: {
    '.js': 'jsx',
    '.jsx': 'jsx',
    '.ts': 'ts',
    '.tsx': 'tsx',
    '.css': 'css',
    '.svg': 'dataurl',
    '.png': 'dataurl',
    '.jpg': 'dataurl',
    '.jpeg': 'dataurl',
    '.gif': 'dataurl',
    '.webp': 'dataurl',
    '.woff': 'file',
    '.woff2': 'file',
    '.ttf': 'file',
    '.eot': 'file'
  },
  resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],

 
  define: { 'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production') },
  minify: process.env.NODE_ENV === 'production',
  legalComments: 'none',
  logLevel: 'info',
  sourcemap: process.env.NODE_ENV !== 'production' ? 'inline' : false,
});

console.log('✅ SSR bundle prêt : build-ssr/entry-server.cjs');