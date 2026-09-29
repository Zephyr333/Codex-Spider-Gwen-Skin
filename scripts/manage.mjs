import { readFile, writeFile, mkdir, rename, lstat, unlink } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);
const command = args.shift() || 'inspect';
const option = name => { const index = args.indexOf(name); return index < 0 ? undefined : args[index + 1]; };
const targetDir = path.resolve(option('--target') || path.join(process.env.APPDATA || '', 'Codex++', 'user_scripts'));
const target = path.join(targetDir, 'spider-gwen-immersive.js');
const source = path.join(root, 'codex-plus-plus', 'spider-gwen-immersive.js');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const readOptional = async file => { try { return await readFile(file); } catch (e) { if (e.code === 'ENOENT') return null; throw e; } };
const version = bytes => bytes?.toString('utf8').match(/const VERSION = ["']([^"']+)["']/)?.[1] || null;
async function rejectLinks(file) {
  for (let current = path.resolve(file); ; current = path.dirname(current)) {
    try { if ((await lstat(current)).isSymbolicLink()) throw new Error(`Refusing link/junction: ${current}`); } catch (e) { if (e.code !== 'ENOENT') throw e; }
    if (current === path.dirname(current)) break;
  }
}
async function replace(file, bytes) {
  await rejectLinks(file);
  await mkdir(path.dirname(file), { recursive: true });
  const temporary = `${file}.${randomUUID()}.tmp`;
  try { await writeFile(temporary, bytes, { flag: 'wx' }); await rename(temporary, file); }
  finally { await unlink(temporary).catch(e => { if (e.code !== 'ENOENT') throw e; }); }
}
const wanted = await readFile(source);
const installed = await readOptional(target);
const status = { source, target, sourceVersion: version(wanted), installedVersion: version(installed),
  sourceSha256: hash(wanted), installedSha256: installed ? hash(installed) : null,
  sameCode: installed ? installed.toString().replace(/\r\n/g, '\n') === wanted.toString().replace(/\r\n/g, '\n') : false };
if (command === 'inspect') {
  console.log(JSON.stringify(status, null, 2));
} else if (command === 'deploy') {
  if (!args.includes('--apply')) { console.log(JSON.stringify({ ...status, dryRun: true, message: 'Add --apply to back up and replace only the user script. Theme/settings are untouched.' }, null, 2)); }
  else if (status.sameCode) { console.log(JSON.stringify({ ...status, unchanged: true }, null, 2)); }
  else {
    await rejectLinks(target);
    const backupDir = path.join(root, 'work', 'backups', new Date().toISOString().replace(/[:.]/g, '-') + '-' + randomUUID().slice(0, 8));
    await rejectLinks(backupDir);
    await mkdir(backupDir, { recursive: true });
    if (installed) await writeFile(path.join(backupDir, 'previous.js'), installed, { flag: 'wx' });
    const manifest = { schemaVersion: 1, target, previousSha256: status.installedSha256, deployedSha256: status.sourceSha256, createdAt: new Date().toISOString() };
    await writeFile(path.join(backupDir, 'manifest.json'), JSON.stringify(manifest, null, 2), { flag: 'wx' });
    const current = await readOptional(target);
    if ((current ? hash(current) : null) !== status.installedSha256) throw new Error('Installed script changed during backup; deployment stopped.');
    await replace(target, wanted);
    if (hash(await readFile(target)) !== hash(wanted)) throw new Error('Deployment hash check failed');
    console.log(JSON.stringify({ ...status, deployed: true, backupDir, message: 'Reload user scripts through Codex++. This tool does not enable the base skin.' }, null, 2));
  }
} else if (command === 'restore') {
  const supplied = option('--backup');
  if (!supplied) throw new Error('restore requires --backup <directory>');
  const backupDir = path.resolve(supplied);
  const manifest = JSON.parse(await readFile(path.join(backupDir, 'manifest.json'), 'utf8'));
  if (manifest.schemaVersion !== 1 || path.resolve(manifest.target) !== target) throw new Error('Backup target mismatch');
  if (!installed || hash(installed) !== manifest.deployedSha256) throw new Error('Installed script changed since deployment; refusing to overwrite newer work.');
  const previous = manifest.previousSha256 ? await readFile(path.join(backupDir, 'previous.js')) : null;
  if (previous && hash(previous) !== manifest.previousSha256) throw new Error('Backup hash mismatch');
  if (!args.includes('--apply')) console.log(JSON.stringify({ dryRun: true, target, backupDir }));
  else {
    await rejectLinks(target);
    if (previous) await replace(target, previous); else await unlink(target);
    console.log(JSON.stringify({ restored: true, target, version: version(previous), message: 'Reload user scripts through Codex++.' }));
  }
} else throw new Error('Use inspect, deploy [--apply], or restore --backup <directory> [--apply]');
