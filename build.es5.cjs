const esbuild = require('esbuild')
const { nodeExternalsPlugin } = require('esbuild-node-externals')

esbuild.build({
  entryPoints: ['./src/main/ts/index.ts'],
  outfile: './target/es5/index.js',
  bundle: true,
  minify: false,
  platform: 'node',
  sourcemap: false,
  target: 'node10',
  format: 'cjs',
  plugins: [nodeExternalsPlugin()],
  tsconfig: './tsconfig.json',
})
  .catch(() => process.exit(1))
