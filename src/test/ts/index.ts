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

test('`topo` returns monorepo release queue', async () => {
  const cwd = resolve(fixtures, 'regular-monorepo')
  const workspaces = ['packages/*']
  const result = await topo({cwd, workspaces})
  const expected = {
    queue: ['a', 'e', 'c'],
    nodes: ['a', 'c', 'e'],
    edges: [
      [ 'e', 'c' ]
    ],
  }

  assert.equal(result, expected)
})

test.run()
