const esbuild = require('esbuild')
const { nodeExternalsPlugin } = require('esbuild-node-externals')

esbuild.build({
  entryPoints: ['./src/main/ts/index.ts'],
  outfile: './target/es6/index.js',
  bundle: true,
  minify: false,
  platform: 'node',
  sourcemap: false,
  target: 'ES2020',
  format: 'esm',
  plugins: [nodeExternalsPlugin()],
  tsconfig: './tsconfig.json'
})
  .catch(() => process.exit(1))
