import { build } from 'esbuild';

export const reactTask = async () => {
  await build({
    entryPoints: ['./src/react/main.jsx'],
    bundle: true,
    outfile: './dist/js/react-bundle.js',
    loader: { '.js': 'jsx', '.jsx': 'jsx' },
    sourcemap: true,
    define: {
      'process.env.NODE_ENV': '"development"',
    },
  });
};
