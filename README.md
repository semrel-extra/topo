# Topo

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
  workspaces: ['packages/*']
})

{
  queue: ['plk-a', 'pkg-b', 'pkg-x', 'pkg-y', 'pkg-x']
}
```

## License
[MIT](./LICENSE)
