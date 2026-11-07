#!/usr/bin/env node
// 发布 dist/ 到 GitHub Pages。
// 本项目位于 learningNotes 仓库内部，因此所有 git 操作都在临时目录中进行，
// 绝不在项目目录里执行 git，以免落入父级笔记仓库。
import { execFileSync, spawnSync } from 'node:child_process'
import { cpSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const REPO = process.env.AGV_REPO ?? 'dby321/anime-games-vendors'
const BRANCH = process.env.AGV_BRANCH ?? 'gh-pages'
const REPO_URL = `https://github.com/${REPO}.git`
const SITE_URL = `https://${REPO.split('/')[0]}.github.io/${REPO.split('/')[1]}/`

const say = (msg) => process.stdout.write(`${msg}\n`)

function git(args, cwd) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim()
}

say('> npm run build')
execFileSync('npm', ['run', 'build'], { cwd: ROOT, stdio: 'inherit' })

const work = join(tmpdir(), `agv-publish-${process.pid}`)
rmSync(work, { recursive: true, force: true })
mkdirSync(work, { recursive: true })

const clone = spawnSync(
  'git',
  ['clone', '--quiet', '--depth', '1', '--single-branch', '--branch', BRANCH, REPO_URL, work],
  { encoding: 'utf8' },
)
if (clone.status === 0) {
  say(`> 已拉取远端 ${BRANCH} 分支`)
} else {
  say(`> 远端 ${BRANCH} 分支不存在，初始化为空分支`)
  git(['init', '-q', '-b', BRANCH], work)
  git(['remote', 'add', 'origin', REPO_URL], work)
}

for (const name of readdirSync(work)) {
  if (name !== '.git') rmSync(join(work, name), { recursive: true, force: true })
}
cpSync(join(ROOT, 'dist'), work, { recursive: true })
writeFileSync(join(work, '.nojekyll'), '')
git(['add', '-A'], work)

const changed = spawnSync('git', ['diff', '--cached', '--quiet'], { cwd: work }).status !== 0
if (!changed) {
  rmSync(work, { recursive: true, force: true })
  say('> 构建产物与线上一致，无需推送')
  process.exit(0)
}

git(['commit', '-q', '-m', `deploy: ${new Date().toISOString().slice(0, 10)} 更新站点`], work)
execFileSync('git', ['push', '--quiet', 'origin', `HEAD:${BRANCH}`], { cwd: work, stdio: 'inherit' })
rmSync(work, { recursive: true, force: true })

say(`> 已推送 ${BRANCH}，GitHub 构建约需 1 分钟`)
say(`> ${SITE_URL}`)
