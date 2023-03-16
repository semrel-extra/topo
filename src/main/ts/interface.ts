import { TDepMap, TGraph } from 'toposource'

export interface IPackageJson {
  name: string
  workspaces?: string[]
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  optionalDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
}

export interface IPackageEntry {
  name: string
  manifest: IPackageJson
  manifestPath: string
  path: string
  absPath: string
  relPath: string
}

export type ITopoOptions = Partial<ITopoOptionsNormalized>

export type ITopoOptionsNormalized = {
  workspaces: string[]
  cwd: string
  filter: (entry: IPackageEntry) => boolean
}

export interface ITopoContext {
  packages: Record<string, IPackageEntry>
  root: IPackageEntry
  nodes: string[]
  edges: [string, string | undefined][]
  queue: string[]
  sources: string[]
  graphs: TGraph[]
  next: TDepMap
  prev: TDepMap
}
