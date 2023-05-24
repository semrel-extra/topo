# @semrel-extra/topo

[![CI](https://github.com/semrel-extra/topo/workflows/CI/badge.svg)](https://github.com/semrel-extra/topo/actions)
[![Maintainability](https://api.codeclimate.com/v1/badges/48b31cd38b905b729beb/maintainability)](https://codeclimate.com/github/semrel-extra/topo/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/48b31cd38b905b729beb/test_coverage)](https://codeclimate.com/github/semrel-extra/topo/test_coverage)

Helper to resolve monorepo dependencies graph by package workspaces

## Install
```shell
yarn add @semrel-extra/topo
```

## Usage
```ts
import { topo } from '@semrel-extra/topo'

const graph = topo({
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
const graph = topo({
  workspaces: ['packages/*'],
  cwd: '/path/to/project/root',
  filter: ({manifest}) => !manifest.private // to omit private packages from graph
})
```

### `depFilter()`
Applies filter to any kind of pkg dependencies to omit them from the graph.
```ts
const gpaph = topo({
  workspaces: ['packages/*'],
  cwd: '/path/to/project/root',
  depFilter: ({version}) => version.startsWith('workspace:') // include only workspace deps
})
```

### `workspacesExtra`
Injects extra pattern to the resolved `workspaces` value from `package.json` / `pnpm-workspace.yaml`
```ts
const gpaph = topo({
  workspacesExtra: ['!packages/foo'],
  cwd: '/path/to/project/root'
})

```

### `traverseDeps()`
Iterates up to the pkg deps graph.
```ts
import {topo, traverseDeps} from '@semrel-extra/topo'

const {packages} = topo({
  workspaces: ['packages/*'],
  cwd: '/path/to/project/root'
})
const pkg = packages['pkg-a']
const cb = async ({name, pkg}: IDepEntry) => {
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

## License
[MIT](./LICENSE)
