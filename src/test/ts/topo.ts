import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import micromatch from 'micromatch'

import {
  getManifestsPaths,
  topo,
  traverseQueue,
  traverseDeps,
  ITopoOptions,
  IDepEntry,
  IPackageEntry,
  IDepEntryEnriched
} from '../../main/ts/topo'

const __dirname = dirname(fileURLToPath(import.meta.url))
const fixtures = resolve(__dirname, '../fixtures')

test('`getManifestsPaths` returns absolute package.json refs', async () => {
  const cwd = resolve(fixtures, 'regular-monorepo')
  const workspaces = ['packages/**/*/', '!packages/e']
  const result = (
    await getManifestsPaths({
      cwd,
      workspaces,
      workspacesExtra: [],
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
        manifestRaw: '{\n  "name": "a",\n  "private": true\n}\n',
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
        manifestRaw: fs.readFileSync(join(cwd, 'packages/c/package.json'), {
          encoding: 'utf8'
        }),
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
        manifestRaw: fs.readFileSync(join(cwd, 'packages/e/package.json'), {
          encoding: 'utf8'
        }),
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
      manifestRaw: fs.readFileSync(join(cwd, 'package.json'), {
        encoding: 'utf8'
      }),
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
        manifestRaw: fs.readFileSync(join(cwd, 'packages/c/package.json'), {
          encoding: 'utf8'
        }),
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
        manifestRaw: fs.readFileSync(join(cwd, 'packages/e/package.json'), {
          encoding: 'utf8'
        }),
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
      manifestRaw: fs.readFileSync(join(cwd, 'package.json'), {
        encoding: 'utf8'
      }),
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
        manifestRaw: fs.readFileSync(join(cwd, 'packages/a/package.json'), {
          encoding: 'utf8'
        }),
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
        manifestRaw: fs.readFileSync(join(cwd, 'packages/c/package.json'), {
          encoding: 'utf8'
        }),
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
        manifestRaw: fs.readFileSync(join(cwd, 'packages/e/package.json'), {
          encoding: 'utf8'
        }),
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
      manifestRaw: fs.readFileSync(join(cwd, 'package.json'), {
        encoding: 'utf8'
      }),
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

test('`topo` processes pnpm monorepos', async () => {
  const cwd = resolve(fixtures, 'pnpm-monorepo')
  const result = await topo({ cwd })
  assert.equal(result.nodes, ['c', 'e']) // see pnpm-workspace.yaml filter
})

test('`topo` processes bolt monorepos', async () => {
  const cwd = resolve(fixtures, 'bolt-monorepo')
  const result = await topo({ cwd })
  assert.equal(result.nodes, ['a', 'c', 'e'])
})

test('`topo` injects packages to workspaces via workspacesExtra', async () => {
  const cwd = resolve(fixtures, 'regular-monorepo')
  const workspaces = ['packages/*']
  const workspacesExtra = ['!packages/e']
  const result = await topo({ cwd, workspacesExtra, workspaces })
  assert.equal(result.nodes, ['a', 'c'])
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

test('`traverseQueue` applies cb to each pkg topologically', async () => {
  const cwd = resolve(fixtures, 'regular-monorepo')
  const workspaces = ['packages/*']
  const { queue, prev } = await topo({ cwd, workspaces })
  const result: string[] = []
  const cb = (name: string) => {
    result.push(name)
  }
  await traverseQueue({ queue, prev, cb })

  const expected = ['a', 'e', 'c']
  assert.equal(result, expected)
})

test('`traversDeps` applies cb up to the deps tree', async () => {
  const packages = {
    a: {
      name: 'a',
      manifest: {
        name: 'a',
        version: '0.0.0'
      }
    },
    b: {
      name: 'b',
      manifest: {
        name: 'b',
        version: '0.0.0',
        dependencies: {
          a: '*'
        }
      }
    },
    c: {
      name: 'c',
      manifest: {
        name: 'c',
        version: '0.0.0',
        devDependencies: {
          b: '*'
        }
      }
    },
    d: {
      name: 'd',
      manifest: {
        name: 'd',
        version: '0.0.0',
        optionalDependencies: {
          b: '*'
        }
      }
    }
  } as unknown as Record<string, IPackageEntry>
  const pkg = packages['d']
  const result: string[] = []
  const cb = async ({ name, pkg }: IDepEntryEnriched) => {
    result.push(name)
    await traverseDeps({ pkg, packages, cb })
  }

  await traverseDeps({ packages, pkg, cb })

  const expected = ['b', 'a']
  assert.equal(result, expected)
})

test.run()
