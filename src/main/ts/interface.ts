import { TDepMap, TGraph } from 'toposource'

export type IPackageDeps = Record<string, string>

export interface IPackageJson {
  name: string
  version: string
  workspaces?: string[] | { packages?: string[] }
  bolt?: {
    workspaces?: string[]
  }
  dependencies?: IPackageDeps
  devDependencies?: IPackageDeps
  optionalDependencies?: IPackageDeps
  peerDependencies?: IPackageDeps
}

export interface IPackageEntry {
  name: string
  manifest: IPackageJson
  manifestRaw: string
  manifestPath: string
  manifestRelPath: string
  manifestAbsPath: string
  path: string
  absPath: string
  relPath: string
}

export interface IDepEntry {
  name: string
  version: string
  scope: string
}

export interface IDepEntryEnriched extends IDepEntry {
  deps: IPackageDeps
  parent: IPackageEntry
  pkg: IPackageEntry
}

export type ITopoOptions = Partial<ITopoOptionsNormalized>

export type ITopoOptionsNormalized = {
  workspaces: string[]
  workspacesExtra: string[]
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
