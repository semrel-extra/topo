const { topo, traverseDeps, traverseQueue } = require('@semrel-extra/topo')
const { test } = require('node:test')
const { resolve } = require('node:path')
const assert = require('node:assert/strict')

const fixtures = resolve(__dirname, '../fixtures')

test('package exposes the CommonJS API', () => {
  for (const fn of [topo, traverseDeps, traverseQueue]) {
    assert.equal(typeof fn, 'function')
  }
})

test('CommonJS API analyzes and traverses a monorepo', async () => {
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
