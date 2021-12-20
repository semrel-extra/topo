# Topo
Helper to resolve monorepo dependencies graph by workspaces

## Install
```shell
yarn add @semrel-extra/topo
```

## Usage
```ts
import { topo } from '@semrel-extra/topo'

const graph = topo({
  workspaces: ['packages/*']
})

{
  queue: ['plk-a', 'pkg-b', 'pkg-x', 'pkg-y', 'pkg-x']
}
```

## License
[MIT](./LICENSE)
