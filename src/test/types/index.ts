import { topo, traverseDeps, traverseQueue } from '@semrel-extra/topo'
import type {
  IDepEntryEnriched,
  IPackageEntry,
  ITopoContext,
  ITopoOptions
} from '@semrel-extra/topo'

const options: ITopoOptions = {
  cwd: '.',
  workspaces: ['packages/*'],
  filter: ({ path }) => path !== '.',
  depFilter: ({ version }) => version.startsWith('workspace:')
}

const context: ITopoContext = await topo(options)
const entry: IPackageEntry = context.packages['example']
const paths: string[] = [
  entry.path,
  entry.relPath,
  entry.absPath,
  entry.manifestPath
]

await traverseQueue({
  queue: context.queue,
  prev: context.prev,
  cb: async () => {}
})
await traverseDeps({
  packages: context.packages,
  pkg: entry,
  scopes: undefined,
  cb: async ({ pkg, parent, name }: IDepEntryEnriched) => {
    paths.push(pkg.path, parent.path, name)
  }
})
