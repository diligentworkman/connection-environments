import { spawn } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const manifestUrl = import.meta.resolve('connection-environments/package.json')
const manifest = JSON.parse(await readFile(new URL(manifestUrl), 'utf8'))
const cliPath = fileURLToPath(
  new URL(manifest.bin['connection-environments'], manifestUrl),
)

const child = spawn(
  process.execPath,
  ['--watch', cliPath, 'start', '--dev'],
  { stdio: 'inherit' },
)

child.on('error', (error) => {
  console.error(error)
  process.exitCode = 1
})

child.on('exit', (code, signal) => {
  process.exitCode = code ?? (signal === 'SIGINT' ? 130 : signal === 'SIGTERM' ? 143 : 1)
})

process.on('SIGINT', () => child.kill('SIGINT'))
process.on('SIGTERM', () => child.kill('SIGTERM'))

