# @semrel-extra/topo

[![CI](https://github.com/semrel-extra/topo/workflows/CI/badge.svg)](https://github.com/semrel-extra/topo/actions)
[![Maintainability](https://api.codeclimate.com/v1/badges/48b31cd38b905b729beb/maintainability)](https://codeclimate.com/github/semrel-extra/topo/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/48b31cd38b905b729beb/test_coverage)](https://codeclimate.com/github/semrel-extra/topo/test_coverage)

Helper to resolve monorepo dependencies graph by workspaces

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

### `filter()`
Filter option is a function: gets `IPackageEntry` as argument, returns `boolean`
```ts
const graph = topo({
  workspaces: ['packages/*'],
  cwd: '/path/to/project/root',
  filter: ({manifest}) => !manifest.private // to omit private packages from graph
})
```

## License
[MIT](./LICENSE)
