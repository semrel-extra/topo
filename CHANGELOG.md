## [1.12.1](https://github.com/semrel-extra/topo/compare/v1.12.0...v1.12.1) (2023-05-24)

### Fixes & improvements
* fix: handle yarn `wokspaces.packages` directive ([979cc99](https://github.com/semrel-extra/topo/commit/979cc99c42fc2fd01fb85fcc7b5d9ef9b89e38f5))

## [1.12.0](https://github.com/semrel-extra/topo/compare/v1.11.0...v1.12.0) (2023-05-24)

### Features
* feat: add workspacesExtra option ([0a1c55c](https://github.com/semrel-extra/topo/commit/0a1c55ccd18dbe5c881b7a80b00881999133f355))

## [1.11.0](https://github.com/semrel-extra/topo/compare/v1.10.0...v1.11.0) (2023-05-24)

### Features
* feat: provide support for bolt and pnpm workspaces ([b23752c](https://github.com/semrel-extra/topo/commit/b23752cdf0f30b99c65442067fd96e73ce04b755))

## [1.10.0](https://github.com/semrel-extra/topo/compare/v1.9.2...v1.10.0) (2023-04-08)

### Features
* feat: add `manifestRaw` field to `IPackageEntry` ([a833ba9](https://github.com/semrel-extra/topo/commit/a833ba93fe4ed0a85836cfd36be12161ad4c084b))

## [1.9.2](https://github.com/semrel-extra/topo/compare/v1.9.1...v1.9.2) (2023-04-03)

### Fixes & improvements
* docs: tweak up usage examples ([5be06ba](https://github.com/semrel-extra/topo/commit/5be06bafde370e8be06b6f5e372d9cb516ef18ae))

## [1.9.1](https://github.com/semrel-extra/topo/compare/v1.9.0...v1.9.1) (2023-04-02)

### Fixes & improvements
* refactor: inner deps iterator ([d641f97](https://github.com/semrel-extra/topo/commit/d641f97113c8d6cd31ad940796d358f960352aff))

## [1.9.0](https://github.com/semrel-extra/topo/compare/v1.8.1...v1.9.0) (2023-04-02)

### Features
* feat: add `scope` field to `IDepEntry` ([0647fcc](https://github.com/semrel-extra/topo/commit/0647fcc40df0f872ac7368784de0b3412a2ec4b5))

## [1.8.1](https://github.com/semrel-extra/topo/compare/v1.8.0...v1.8.1) (2023-04-01)

### Fixes & improvements
* fix: add missing iface reexport ([57d391a](https://github.com/semrel-extra/topo/commit/57d391a39dbbcabfec1eb4d078920fc0b0674d4c))

## [1.8.0](https://github.com/semrel-extra/topo/compare/v1.7.0...v1.8.0) (2023-04-01)

### Features
* feat: add `traverseDeps` and `traverseQueue` helpers ([31c6c78](https://github.com/semrel-extra/topo/commit/31c6c785017eb46b1ff77606a3792e1f5aead187))

## [1.7.0](https://github.com/semrel-extra/topo/compare/v1.6.0...v1.7.0) (2023-03-28)

### Features
* feat: introduce `depFilter` option ([9a0eeec](https://github.com/semrel-extra/topo/commit/9a0eeec784cbc40efa2fc8a20a9c172d4cd686a5))

## [1.6.0](https://github.com/semrel-extra/topo/compare/v1.5.0...v1.6.0) (2023-03-16)

### Features
* feat: mix graph sources to result ([fb00824](https://github.com/semrel-extra/topo/commit/fb00824ec8ce469febeca302104190cd4f5693f3))

## [1.5.0](https://github.com/semrel-extra/topo/compare/v1.4.4...v1.5.0) (2023-02-24)

### Features
* feat: mix toposource `graphs` to result ([db00d12](https://github.com/semrel-extra/topo/commit/db00d128d584d57cea9012a7f475cbdcba515958))

## [1.4.4](https://github.com/semrel-extra/topo/compare/v1.4.3...v1.4.4) (2023-01-05)


### Bug Fixes

* update fast-glob to v3.2.12 ([d414511](https://github.com/semrel-extra/topo/commit/d414511f09142e194642330283718b1f6eb3fedd))

## [1.4.3](https://github.com/semrel-extra/topo/compare/v1.4.2...v1.4.3) (2022-07-29)


### Bug Fixes

* add missing `types` field to pkg.json ([ece19f3](https://github.com/semrel-extra/topo/commit/ece19f33148b98dbe50b36c64bcef4cb290dfee8)), closes [#13](https://github.com/semrel-extra/topo/issues/13)

## [1.4.2](https://github.com/semrel-extra/topo/compare/v1.4.1...v1.4.2) (2022-07-03)

## [1.4.1](https://github.com/semrel-extra/topo/compare/v1.4.0...v1.4.1) (2022-06-13)


### Bug Fixes

* **types:** let `workspaces` field be optional ([cfd5713](https://github.com/semrel-extra/topo/commit/cfd5713c1957640e9f6baddc61eac76c53d96390))

# [1.4.0](https://github.com/semrel-extra/topo/compare/v1.3.1...v1.4.0) (2022-06-13)


### Features

* add abs pkg path to entry data ([7271961](https://github.com/semrel-extra/topo/commit/727196118e028b6f7258e0d42787c1b362d38a37))
* add pkg name to entry ([f80aa8d](https://github.com/semrel-extra/topo/commit/f80aa8d16aeb4a55efa5fcd9acad959726e00817))
* add root pkg entry to context ([5d670cc](https://github.com/semrel-extra/topo/commit/5d670cccc2ba631a7650ee09cd1b1f186333cd4e))
* check pkg names duplicates ([6c18d81](https://github.com/semrel-extra/topo/commit/6c18d81e9cb96502e00dc02c0215f0d21c5ca932))

## [1.3.1](https://github.com/semrel-extra/topo/compare/v1.3.0...v1.3.1) (2022-06-01)


### Performance Improvements

* up deps ([4237a6c](https://github.com/semrel-extra/topo/commit/4237a6cba1ec7a3ec7942d3e76961aea3496b043))

# [1.3.0](https://github.com/semrel-extra/topo/compare/v1.2.0...v1.3.0) (2021-12-29)


### Features

* add packages filter ([c3e49f4](https://github.com/semrel-extra/topo/commit/c3e49f41889a14b7be21200853ba5ee0fc6e5bdd)), closes [#6](https://github.com/semrel-extra/topo/issues/6)

# [1.2.0](https://github.com/semrel-extra/topo/compare/v1.1.0...v1.2.0) (2021-12-27)


### Features

* add pkg manifests to topoContext ([117a0b2](https://github.com/semrel-extra/topo/commit/117a0b2a893d0d164f1db769776c10f8beda8644))

# [1.1.0](https://github.com/semrel-extra/topo/compare/v1.0.0...v1.1.0) (2021-12-26)


### Features

* add nodes and edges to topoContext ([18f60c0](https://github.com/semrel-extra/topo/commit/18f60c09cbaec005b9110b369ba77053246de3db))

# 1.0.0 (2021-12-25)


### Bug Fixes

* fix repo url in package.json ([a79a4b5](https://github.com/semrel-extra/topo/commit/a79a4b589f73747d0a51f07b1f74724b7c504d31))
* repo url fix ([5a7f2ca](https://github.com/semrel-extra/topo/commit/5a7f2ca8d6fc58268b27f217adb01f132327e8c4))


### Features

* add monorepo graph resolver `topo` ([2ae82fa](https://github.com/semrel-extra/topo/commit/2ae82fac7a68087f82492d0eb9d9e1d63f02fd37))
