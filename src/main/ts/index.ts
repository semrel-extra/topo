import toposort from 'toposort'
import glob from 'fast-glob'
import {join} from 'path'
import {promises} from 'fs'

const {readFile} = promises

export type ITopoOtions = {
  workspaces: string[],
  cwd: string
}

export interface IPackageJson {
  name: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  optionalDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
}

export interface ITopoContext {
  queue: string[]
  nodes: string[]
  edges: [string, string | undefined][]
}

export const topo = async (otions: ITopoOtions): Promise<ITopoContext> => {
  const manifestsPaths = await getManifestsPaths(otions)
  const manifests = await Promise.all(manifestsPaths.map(p => readFile(p, 'utf-8').then(JSON.parse)))
  const { edges, nodes } = getGraph(manifests)

  return {
    queue: toposort.array(nodes, edges),
    edges,
    nodes,
  }
}

export const getGraph = (manifests: IPackageJson[]): {
  nodes: string[],
  edges: [string, string | undefined][]
} => {
  const nodes = manifests.map(({name}) => name)
  const edges = manifests.reduce<[string, string | undefined][]>((edges, pkg) => {
    Object.keys({
      ...pkg.dependencies,
      ...pkg.devDependencies,
      ...pkg.optionalDependencies,
      ...pkg.peerDependencies
    }).forEach(_name => nodes.includes(_name) && edges.push([_name, pkg.name]))

    return edges
  }, [])

  return {
    edges,
    nodes,
  }
}

export const getManifestsPaths = async ({workspaces, cwd}: ITopoOtions) =>
  (await glob(workspaces.map(w => slash(join(w, 'package.json'))), {
    cwd,
    onlyFiles: true,
    absolute: true,
  }))

// https://github.com/sindresorhus/slash/blob/b5cdd12272f94cfc37c01ac9c2b4e22973e258e5/index.js#L1
export const slash = (path: string): string => {
  const isExtendedLengthPath = /^\\\\\?\\/.test(path)
  const hasNonAscii = /[^\u0000-\u0080]+/.test(path) // eslint-disable-line no-control-regex

  if (isExtendedLengthPath || hasNonAscii) {
    return path
  }

  return path.replace(/\\/g, '/')
}
