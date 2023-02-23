import glob from 'fast-glob'
import { analyze } from 'toposource'
import { dirname, join, relative, resolve } from 'path'
import { promises as fs } from 'fs'

const readJsonFile = async (filepath: string) =>
  JSON.parse(await fs.readFile(filepath, 'utf8'))

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
  queue: string[]
  nodes: string[]
  edges: [string, string | undefined][]
  root: IPackageEntry
}

export const getPackages = async (
  options: ITopoOptionsNormalized
): Promise<Record<string, IPackageEntry>> => {
  const filter = options.filter || (_ => true)
  const manifestsPaths = await getManifestsPaths(options)
  const manifests: IPackageJson[] = await Promise.all(
    manifestsPaths.map(p => readJsonFile(p))
  )

  checkDuplicates(manifests)

  return manifests.reduce<Record<string, IPackageEntry>>((m, p, i) => {
    const absPath = dirname(manifestsPaths[i])
    const relPath = relative(options.cwd, absPath)
    const entry = {
      name: p.name,
      manifest: p,
      manifestPath: manifestsPaths[i],
      path: relPath, // legacy
      relPath,
      absPath
    }

    if (filter(entry)) {
      m[p.name] = entry
    }

    return m
  }, {})
}

const checkDuplicates = (manifests: IPackageJson[]): void => {
  const duplicates = manifests
    .map(m => m.name)
    .filter((e, i, a) => a.indexOf(e) !== i)
  if (duplicates.length > 0) {
    throw new Error(`Duplicated pkg names: ${duplicates.join(', ')}`)
  }
}

export const getRootPackage = async (cwd: string): Promise<IPackageEntry> => {
  const manifestPath = resolve(cwd, 'package.json')
  const manifest = await readJsonFile(manifestPath)

  return {
    name: manifest.name,
    manifest,
    manifestPath,
    path: '/',
    relPath: '/',
    absPath: dirname(manifestPath)
  }
}

export const topo = async (
  options: ITopoOptions = {}
): Promise<ITopoContext> => {
  const { cwd = process.cwd(), filter = _ => true } = options
  const root = await getRootPackage(cwd)
  const _options: ITopoOptionsNormalized = {
    cwd,
    filter,
    workspaces: options.workspaces || root.manifest.workspaces || []
  }
  const packages = await getPackages(_options)
  const { edges, nodes } = getGraph(
    Object.values(packages).map(p => p.manifest)
  )
  const queue = analyze([...edges, ...nodes.map<[string]>(n => [n])]).queue

  return {
    queue,
    packages,
    edges,
    nodes,
    root
  }
}

export const getGraph = (
  manifests: IPackageJson[]
): {
  nodes: string[]
  edges: [string, string][]
} => {
  const nodes = manifests.map(({ name }) => name).sort()
  const edges = manifests
    .reduce<[string, string][]>((edges, pkg) => {
      Object.keys({
        ...pkg.dependencies,
        ...pkg.devDependencies,
        ...pkg.optionalDependencies,
        ...pkg.peerDependencies
      }).forEach(
        _name => nodes.includes(_name) && edges.push([_name, pkg.name])
      )

      return edges
    }, [])
    .sort()

  return {
    edges,
    nodes
  }
}

export const getManifestsPaths = async ({
  workspaces,
  cwd
}: ITopoOptionsNormalized) =>
  await glob(
    workspaces.map(w => slash(join(w, 'package.json'))),
    {
      cwd,
      onlyFiles: true,
      absolute: true
    }
  )

// https://github.com/sindresorhus/slash/blob/b5cdd12272f94cfc37c01ac9c2b4e22973e258e5/index.js#L1
export const slash = (path: string): string => {
  const isExtendedLengthPath = /^\\\\\?\\/.test(path)
  const hasNonAscii = /[^\u0000-\u0080]+/.test(path) // eslint-disable-line no-control-regex

  if (isExtendedLengthPath || hasNonAscii) {
    return path
  }

  return path.replace(/\\/g, '/')
}
