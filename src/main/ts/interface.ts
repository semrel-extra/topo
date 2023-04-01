import { TDepMap, TGraph } from 'toposource'

export type IPackageDeps = Record<string, string>

export interface IPackageJson {
  name: string
  workspaces?: string[]
  dependencies?: IPackageDeps
  devDependencies?: IPackageDeps
  optionalDependencies?: IPackageDeps
  peerDependencies?: IPackageDeps
}

export interface IPackageEntry {
  name: string
  manifest: IPackageJson
  manifestPath: string
  path: string
  absPath: string
  relPath: string
}

export interface IDepEntry {
  name: string
  version: string
}

export type ITopoOptions = Partial<ITopoOptionsNormalized>

export type ITopoOptionsNormalized = {
  workspaces: string[]
  cwd: string
  filter: (entry: IPackageEntry) => boolean
  pkgFilter: (entry: IPackageEntry) => boolean
  depFilter: (entry: IDepEntry) => boolean
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
