import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { dirname, join, resolve } from 'path'
import { fileURLToPath } from 'url'

import { getManifestsPaths, topo } from '../../main/ts/index'

const __dirname = dirname(fileURLToPath(import.meta.url))
const fixtures = resolve(__dirname, '../fixtures')

test('`getManifestsPaths` returns absolute package.json refs', async () => {
  const cwd = resolve(fixtures, 'regular-monorepo')
  const workspaces = ['packages/**/*/', '!packages/e']
  const result = (await getManifestsPaths({cwd, workspaces})).sort()
  const expected = ['a', 'c', 'd/d/d'].map(f => join(cwd, 'packages', f, 'package.json'))

  assert.equal(result, expected)
})

test('`topo` returns monorepo digest: release queue, deps graph, package manifests', async () => {
  const cwd = resolve(fixtures, 'regular-monorepo')
  const workspaces = ['packages/*']
  const result = await topo({cwd, workspaces})
  const expected = {
    queue: ['a', 'e', 'c'],
    nodes: ['a', 'c', 'e'],
    edges: [
      [ 'e', 'c' ]
    ],
    packages: {
      a: {
        manifest: {
          name: 'a'
        },
        manifestPath: join(cwd, 'packages/a/package.json'),
        path: 'packages/a'
      },
      c: {
        manifest: {
          name: 'c',
          dependencies: {
            e: '*'
          },
        },
        manifestPath: join(cwd, 'packages/c/package.json'),
        path: 'packages/c'
      },
      e: {
        manifest: {
          name: 'e'
        },
        manifestPath: join(cwd, 'packages/e/package.json'),
        path: 'packages/e'
      }
    }
  }

  assert.equal(result, expected)
})

test.run()
