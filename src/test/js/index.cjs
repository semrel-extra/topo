const { topo } = require('@semrel-extra/topo')
const { test } = require('uvu')
const { resolve } = require('path')
const assert = require('uvu/assert')

const fixtures = resolve(__dirname, '../fixtures')

test('`topo` returns monorepo release queue', async () => {
  const cwd = resolve(fixtures, 'regular-monorepo')
  const workspaces = ['packages/*']
  const result = (await topo({ cwd, workspaces })).queue
  const expected = ['a', 'e', 'c']

  assert.equal(result, expected)
})

test.run()
