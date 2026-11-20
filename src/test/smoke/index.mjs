import { topo, traverseDeps, traverseQueue } from '@semrel-extra/topo'
import { test } from 'node:test'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import assert from 'node:assert/strict'

const __dirname = dirname(fileURLToPath(import.meta.url))
const fixtures = resolve(__dirname, '../fixtures')

test('package exposes the ESM API', () => {
  for (const fn of [topo, traverseDeps, traverseQueue]) {
    assert.equal(typeof fn, 'function')
  }
})

test('ESM API analyzes and traverses a monorepo', async () => {
  const cwd = resolve(fixtures, 'regular-monorepo')
  const workspaces = ['packages/*']
  const { queue, prev, packages } = await topo({ cwd, workspaces })
  const expected = ['a', 'e', 'c']
  assert.deepEqual(queue, expected)

  const visited = []
  await traverseQueue({ queue, prev, cb: name => visited.push(name) })
  assert.deepEqual(visited, expected)

  const deps = []
  await traverseDeps({
    packages,
    pkg: packages.c,
    cb: ({ name }) => deps.push(name)
  })
  assert.deepEqual(deps, ['e'])
})
