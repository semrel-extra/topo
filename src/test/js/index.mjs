import { topo } from '@semrel-extra/topo'
import { test } from 'uvu'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import * as assert from 'uvu/assert'

const __dirname = dirname(fileURLToPath(import.meta.url))
const fixtures = resolve(__dirname, '../fixtures')

test('`topo` returns monorepo release queue', async () => {
  const cwd = resolve(fixtures, 'regular-monorepo')
  const workspaces = ['packages/*']
  const result = (await topo({ cwd, workspaces })).queue
  const expected = ['a', 'e', 'c']

  assert.equal(result, expected)
})

test.run()
