#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import { access, mkdtemp, readFile, rm } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const sourceRoot = resolve(import.meta.dirname, '..')
const temporary = await mkdtemp(resolve(sourceRoot, '.package-smoke-'))
try {
  const output = execFileSync('npm', [
    'pack', '--json', '--ignore-scripts', '--pack-destination', temporary,
  ], {
    cwd: sourceRoot,
    encoding: 'utf8',
    env: {
      ...process.env,
      npm_config_cache: resolve(temporary, '.npm-cache'),
      npm_config_ignore_scripts: 'true',
    },
  })
  const jsonStart = output.lastIndexOf('\n[')
  const packed = JSON.parse(output.slice(jsonStart < 0 ? 0 : jsonStart + 1))
  const filename = packed?.[0]?.filename
  if (typeof filename !== 'string') throw new Error('package smoke: npm pack returned no artifact')
  execFileSync('tar', ['-xzf', resolve(temporary, filename), '-C', temporary])

  const packageRoot = resolve(temporary, 'package')
  const manifest = JSON.parse(await readFile(resolve(packageRoot, 'package.json'), 'utf8'))
  for (const key of ['.', './client', './invariant']) {
    const target = manifest.exports?.[key]?.default
    const types = manifest.exports?.[key]?.types
    if (typeof target !== 'string' || typeof types !== 'string') {
      throw new Error(`package smoke: incomplete export ${key}`)
    }
    await access(resolve(packageRoot, target))
    await access(resolve(packageRoot, types))
  }
  for (const [dependency, range] of Object.entries(manifest.peerDependencies ?? {})) {
    if (dependency.startsWith('@deepseek-ai/dsh-') && range !== '^0.1.2-alpha.5') {
      throw new Error(`package smoke: ${dependency} does not use the alpha.5 peer baseline`)
    }
  }
  if (manifest.peerDependencies?.['@deepseek-ai/cordis'] !== '^4.0.2') {
    throw new Error('package smoke: Cordis peer baseline is not alpha.5-coherent')
  }

  const patch = await readFile(resolve(packageRoot, 'cordis.patch.yml'), 'utf8')
  if (!patch.includes('id: ui-tool-result-images') || !patch.includes("name: 'dsh-ui-tool-result-images'")) {
    throw new Error('package smoke: bundle patch lacks the plugin row')
  }
  const host = await import(pathToFileURL(resolve(packageRoot, manifest.exports['.'].default)).href)
  if (typeof host.apply !== 'function' || host.name !== 'dsh-ui-tool-result-images') {
    throw new Error('package smoke: Host anchor exports are incomplete')
  }
  const invariant = await import(pathToFileURL(resolve(packageRoot, manifest.exports['./invariant'].default)).href)
  if (invariant.IMAGE_RESULT_NODE_KIND !== 'tool-result-images') {
    throw new Error('package smoke: invariant export is incomplete')
  }
  const clientSource = await readFile(resolve(packageRoot, manifest.exports['./client'].default), 'utf8')
  if (!clientSource.includes('window.__ModuleLoader__.load')
    || !clientSource.includes('dsh-ui-tool-result-images')) {
    throw new Error('package smoke: Client bundle is not loader-compatible')
  }
} finally {
  await rm(temporary, { recursive: true, force: true })
}
