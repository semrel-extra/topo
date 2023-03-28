import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { dirname, join, resolve } from 'path'
import { fileURLToPath } from 'url'
import micromatch from 'micromatch'

import { getManifestsPaths, ITopoOptions, topo } from '../../main/ts/topo'

const __dirname = dirname(fileURLToPath(import.meta.url))
const fixtures = resolve(__dirname, '../fixtures')

test('`getManifestsPaths` returns absolute package.json refs', async () => {
  const cwd = resolve(fixtures, 'regular-monorepo')
  const workspaces = ['packages/**/*/', '!packages/e']
  const result = (
    await getManifestsPaths({
      cwd,
      workspaces,
      filter: () => true,
      depFilter: () => true,
      pkgFilter: () => true
    })
  ).sort()
  const expected = ['a', 'c', 'd/d/d'].map(f =>
    join(cwd, 'packages', f, 'package.json')
  )

  assert.equal(result, expected)
})

test('`topo` returns monorepo digest: release queue, deps graph, package manifests', async () => {
  const cwd = resolve(fixtures, 'regular-monorepo')
  const workspaces = ['packages/*']
  const result = await topo({ cwd, workspaces })
  const expected = {
    queue: ['a', 'e', 'c'],
    nodes: ['a', 'c', 'e'],
    edges: [['e', 'c']],
    sources: ['a', 'e'],
    packages: {
      a: {
        name: 'a',
        manifest: {
          name: 'a',
          private: true
        },
        manifestPath: join(cwd, 'packages/a/package.json'),
        path: 'packages/a',
        relPath: 'packages/a',
        absPath: resolve(cwd, 'packages/a')
      },
      c: {
        name: 'c',
        manifest: {
          name: 'c',
          dependencies: {
            e: '*'
          }
        },
        manifestPath: join(cwd, 'packages/c/package.json'),
        path: 'packages/c',
        relPath: 'packages/c',
        absPath: resolve(cwd, 'packages/c')
      },
      e: {
        name: 'e',
        manifest: {
          name: 'e'
        },
        manifestPath: join(cwd, 'packages/e/package.json'),
        path: 'packages/e',
        relPath: 'packages/e',
        absPath: resolve(cwd, 'packages/e')
      }
    },
    root: {
      name: 'root',
      manifest: {
        name: 'root'
      },
      manifestPath: join(cwd, 'package.json'),
      path: '/',
      relPath: '/',
      absPath: resolve(cwd)
    },
    graphs: [
      {
        nodes: new Set(['a']),
        sources: ['a']
      },
      {
        nodes: new Set(['c', 'e']),
        sources: ['e']
      }
    ],
    next: new Map([['e', ['c']]]),
    prev: new Map([['c', ['e']]])
  }

  assert.equal(result, expected)
})

test('`topo` applies filter/pkgFilter', async () => {
  const cwd = resolve(fixtures, 'regular-monorepo')
  const workspaces = ['packages/*']
  const filter: ITopoOptions['filter'] = ({ path }) =>
    !micromatch.isMatch(path, ['packages/a', 'packages/d/d'])
  const result = await topo({ cwd, workspaces, filter })

  const expected = {
    queue: ['e', 'c'],
    nodes: ['c', 'e'],
    edges: [['e', 'c']],
    sources: ['e'],
    packages: {
      c: {
        name: 'c',
        manifest: {
          name: 'c',
          dependencies: {
            e: '*'
          }
        },
        manifestPath: join(cwd, 'packages/c/package.json'),
        path: 'packages/c',
        relPath: 'packages/c',
        absPath: resolve(cwd, 'packages/c')
      },
      e: {
        name: 'e',
        manifest: {
          name: 'e'
        },
        manifestPath: join(cwd, 'packages/e/package.json'),
        path: 'packages/e',
        relPath: 'packages/e',
        absPath: resolve(cwd, 'packages/e')
      }
    },
    root: {
      name: 'root',
      manifest: {
        name: 'root'
      },
      manifestPath: join(cwd, 'package.json'),
      path: '/',
      relPath: '/',
      absPath: resolve(cwd)
    },
    graphs: [
      {
        nodes: new Set(['c', 'e']),
        sources: ['e']
      }
    ],
    next: new Map([['e', ['c']]]),
    prev: new Map([['c', ['e']]])
  }

  assert.equal(result, expected)
})

test('`topo` applies depFilter', async () => {
  const cwd = resolve(fixtures, 'regular-monorepo')
  const workspaces = ['packages/*']
  const depFilter: ITopoOptions['depFilter'] = () => false
  const result = await topo({ cwd, workspaces, depFilter })

  const expected = {
    queue: ['a', 'c', 'e'],
    nodes: ['a', 'c', 'e'],
    edges: [],
    sources: ['a', 'c', 'e'],
    packages: {
      a: {
        name: 'a',
        manifest: {
          name: 'a',
          private: true
        },
        manifestPath: join(cwd, 'packages/a/package.json'),
        path: 'packages/a',
        relPath: 'packages/a',
        absPath: resolve(cwd, 'packages/a')
      },
      c: {
        name: 'c',
        manifest: {
          name: 'c',
          dependencies: {
            e: '*'
          }
        },
        manifestPath: join(cwd, 'packages/c/package.json'),
        path: 'packages/c',
        relPath: 'packages/c',
        absPath: resolve(cwd, 'packages/c')
      },
      e: {
        name: 'e',
        manifest: {
          name: 'e'
        },
        manifestPath: join(cwd, 'packages/e/package.json'),
        path: 'packages/e',
        relPath: 'packages/e',
        absPath: resolve(cwd, 'packages/e')
      }
    },
    root: {
      name: 'root',
      manifest: {
        name: 'root'
      },
      manifestPath: join(cwd, 'package.json'),
      path: '/',
      relPath: '/',
      absPath: resolve(cwd)
    },
    graphs: [
      {
        nodes: new Set(['a']),
        sources: ['a']
      },
      {
        nodes: new Set(['c']),
        sources: ['c']
      },
      {
        nodes: new Set(['e']),
        sources: ['e']
      }
    ],
    next: new Map(),
    prev: new Map()
  }

  assert.equal(result, expected)
})

test('`topo` throws error on duplicated pkg names', async () => {
  const cwd = resolve(fixtures, 'broken-monorepo')
  const workspaces = ['packages/*']

  try {
    await topo({ cwd, workspaces })
    assert.unreachable()
  } catch (err: any) {
    assert.instance(err, Error)
    assert.match(err.message, 'Duplicated pkg names: a')
  }
})

test.run()
