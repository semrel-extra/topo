# @semrel-extra/topo

[![CI](https://github.com/semrel-extra/topo/actions/workflows/ci.yaml/badge.svg?branch=master&event=push)](https://github.com/semrel-extra/topo/actions/workflows/ci.yaml)
[![Maintainability](https://qlty.sh/gh/semrel-extra/projects/topo/maintainability.svg)](https://qlty.sh/gh/semrel-extra/projects/topo)
[![Code Coverage](https://qlty.sh/gh/semrel-extra/projects/topo/coverage.svg)](https://qlty.sh/gh/semrel-extra/projects/topo)

> Helpers to assist monorepo dependencies traversals

## Install
```shell
yarn add @semrel-extra/topo
```

## Usage
```ts
import { topo } from '@semrel-extra/topo'

const graph = await topo({
  workspaces: ['packages/*'],
  cwd: '/path/to/project/root'
})

{
  queue: ['pkg-a', 'pkg-b', 'pkg-z', 'pkg-y', 'pkg-x'],
  nodes: ['pkg-a', 'pkg-b', 'pkg-x', 'pkg-y', 'pkg-z'],
  edges: [
    ['pkg-a', 'pkg-b'],
    ['pkg-z', 'pkg-y'],
    ['pkg-y', 'pkg-x'],
  ],
  // packages entries map
  packages: {
    'pkg-a': {
      manifest: {
        name: 'pkg-a',
        dependencies: {}
      },
      manifestPath: '/path/to/project/root/packages/a/package.json',
      path: 'packages/a', // legacy
      relPath: 'packages/a',
      absPath: '/path/to/project/root/packages/a'
    },
    'pkg-b': {...},
    ...
  }
}
```

### `pkgFilter() / filter()`
Filter option is a function: gets `IPackageEntry` as argument, returns `boolean`
```ts
const graph = await topo({
  workspaces: ['packages/*'],
  cwd: '/path/to/project/root',
  filter: ({manifest}) => !manifest.name.startsWith('internal-') // omit internal packages
})
```

### `depFilter()`
Applies filter to any kind of pkg dependencies to omit them from the graph.
```ts
const graph = await topo({
  workspaces: ['packages/*'],
  cwd: '/path/to/project/root',
  depFilter: ({version}) => version.startsWith('workspace:') // include only workspace deps
})
```

### `workspacesExtra`
Injects extra pattern to the resolved `workspaces` value from `package.json` / `pnpm-workspace.yaml`
```ts
const graph = await topo({
  workspacesExtra: ['!packages/foo'],
  cwd: '/path/to/project/root'
})

```

### `traverseDeps()`
Iterates up to the pkg deps graph.
```ts
import {topo, traverseDeps} from '@semrel-extra/topo'
import type {IDepEntryEnriched} from '@semrel-extra/topo'

const {packages} = await topo({
  workspaces: ['packages/*'],
  cwd: '/path/to/project/root'
})
const pkg = packages['pkg-a']
const cb = async ({pkg}: IDepEntryEnriched) => {
  await traverseDeps({pkg, packages, cb})
}

await traverseDeps({packages, pkg, cb})
```

### `traverseQueue()`
Iterates over the queue of packages in the order of their dependencies.
```ts
import {topo, traverseQueue} from '@semrel-extra/topo'

const {queue, prev} = await topo({
  workspaces: ['packages/*'],
  cwd: '/path/to/project/root'
})
const cb = async (name: string) => {
  // some async action
}
await traverseQueue({ queue, prev, cb })
```

## Development

Use Node.js 26 and Yarn 1.22. The published CommonJS and ESM builds are tested on
Node.js 18, 20, 22, 24 and 26. Public exports and legacy package path fields are
preserved.

```sh
yarn install --frozen-lockfile
yarn build
yarn test
```

`yarn lint` runs Oxlint; `yarn format` applies Prettier. Tests check formatting
without changing files. The build uses TypeScript 7 for declarations and esbuild
for JavaScript. `js-yaml` stays on the maintained 4.x line to preserve parsing of
existing workspace files, including YAML merge keys.

## CI and publishing

The release job uses npm trusted publishing through GitHub OIDC. Configure a
trusted publisher for `@semrel-extra/topo` with:

- Organization: `semrel-extra`
- Repository: `topo`
- Workflow filename: `ci.yaml`
- Environment: `gh-cicd`
- Permission: `npm publish`

The first successful publication must happen within two days of creating the
publisher. An expired configuration must be deleted and recreated. See
[npm trusted publishing](https://docs.npmjs.com/trusted-publishers/).

Publishing uses the built-in `GITHUB_TOKEN`. Committer details can be set through
the `GIT_COMMITTER_NAME` and `GIT_COMMITTER_EMAIL` repository variables, and SSH
signing through the optional `GIT_SIGN_KEY` secret.

Coverage uploads use Qlty OIDC; enable the project in Qlty before the first upload.
CodeQL is configured in `codeql-analysis.yml` for JavaScript/TypeScript and GitHub
Actions. Keep GitHub's CodeQL default setup disabled while this workflow is in use.

## License
[MIT](./LICENSE)
