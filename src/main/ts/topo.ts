import glob from 'fast-glob'
import { analyze, TTopoResult } from 'toposource'
import { dirname, join, relative, resolve } from 'path'
import { promises as fs } from 'fs'

import {
  ITopoOptionsNormalized,
  IPackageEntry,
  IPackageJson,
  IPackageDeps,
  ITopoOptions,
  ITopoContext
} from './interface'

export * from './interface'

const defaultScopes = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies'
]

export const getPackages = async (
  options: ITopoOptionsNormalized
): Promise<Record<string, IPackageEntry>> => {
  const { pkgFilter } = options
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

    if (pkgFilter(entry)) {
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
  const {
    cwd = process.cwd(),
    filter = _ => true,
    pkgFilter = filter,
    depFilter = _ => true
  } = options
  const root = await getRootPackage(cwd)
  const _options: ITopoOptionsNormalized = {
    cwd,
    filter,
    depFilter,
    pkgFilter,
    workspaces: options.workspaces || root.manifest.workspaces || []
  }
  const packages = await getPackages(_options)
  const { edges, nodes } = getGraph(
    Object.values(packages).map(p => p.manifest),
    depFilter
  )
  const { queue, graphs, next, prev, sources } = analyze([
    ...edges,
    ...nodes.map<[string]>(n => [n])
  ])

  return {
    nodes,
    edges,
    queue,
    graphs,
    sources,
    prev,
    next,
    packages,
    root
  }
}

export const getGraph = (
  manifests: IPackageJson[],
  depFilter: ITopoOptionsNormalized['depFilter'],
  scopes = defaultScopes
): {
  nodes: string[]
  edges: [string, string][]
} => {
  const nodes = manifests.map(({ name }) => name).sort()
  const edges = manifests
    .reduce<[string, string][]>((edges, pkg) => {
      const m = new Set()
      iterateDeps(
        pkg,
        ({ name, version, scope }) => {
          if (
            !m.has(name) &&
            nodes.includes(name) &&
            depFilter({ name, version, scope })
          ) {
            m.add(name)
            edges.push([name, pkg.name])
          }
        },
        scopes
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

const readJsonFile = async (filepath: string) =>
  JSON.parse(await fs.readFile(filepath, 'utf8'))

// https://github.com/sindresorhus/slash/blob/b5cdd12272f94cfc37c01ac9c2b4e22973e258e5/index.js#L1
export const slash = (path: string): string => {
  const isExtendedLengthPath = /^\\\\\?\\/.test(path)
  const hasNonAscii = /[^\u0000-\u0080]+/.test(path) // eslint-disable-line no-control-regex

  if (isExtendedLengthPath || hasNonAscii) {
    return path
  }

  return path.replace(/\\/g, '/')
}

export const traverseQueue = async ({
  queue,
  prev,
  cb
}: {
  queue: TTopoResult['queue']
  prev: TTopoResult['prev']
  cb: (name: string) => any
}) => {
  const acc: Record<string, Promise<void>> = {}

  return Promise.all(
    queue.map(
      name =>
        (acc[name] = (async () => {
          await Promise.all((prev.get(name) || []).map(p => acc[p]))
          await cb(name)
        })())
    )
  )
}

export interface IDepEntry {
  name: string
  version: string
  scope: string
  deps: IPackageDeps
  parent: IPackageEntry
  pkg: IPackageEntry
}

export const traverseDeps = async ({
  packages,
  pkg: parent,
  scopes = defaultScopes,
  cb
}: {
  pkg: IPackageEntry
  packages: Record<string, IPackageEntry>
  scopes?: string[]
  cb(depEntry: IDepEntry): any
}) => {
  const { manifest } = parent
  const results: Promise<void>[] = []

  iterateDeps(
    manifest,
    ({ name, version, scope, deps }) => {
      const pkg = packages[name]
      if (!pkg) return
      results.push(
        Promise.resolve(cb({ name, version, scope, deps, pkg, parent }))
      )
    },
    scopes
  )

  await Promise.all(results)
}

const iterateDeps = (
  manifest: IPackageJson,
  cb: (ctx: {
    scope: string
    name: string
    version: string
    deps: IPackageDeps
  }) => any,
  scopes = defaultScopes
) => {
  for (const scope of scopes) {
    const deps = manifest[scope as keyof IPackageJson] as IPackageDeps
    if (!deps) continue

    for (let [name, version] of Object.entries(deps)) {
      cb({ name, version, deps, scope })
    }
  }
}
