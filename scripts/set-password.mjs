import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash, randomBytes } from 'node:crypto';
import readline from 'node:readline/promises';
import { Writable } from 'node:stream';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let current = {};
try { current = JSON.parse(await fs.readFile(path.join(root, 'login.config.json'), 'utf8')); } catch {}
const generated = process.argv.includes('--generate');
let username = current.username || 'liber301';
let password;
if (generated) {
  password = randomBytes(12).toString('base64url');
} else {
  if (!process.stdin.isTTY) throw new Error('请在本地终端运行 npm run set-password，密码不会回显。');
  let muted = false;
  const output = new Writable({ write(chunk, encoding, callback) { if (!muted) process.stdout.write(chunk, encoding); callback(); } });
  const prompt = readline.createInterface({ input: process.stdin, output, terminal: true });
  prompt.on('SIGINT', () => { process.stdout.write('\n已取消。\n'); prompt.close(); process.exit(130); });
  try {
    username = (await prompt.question(`账号（回车保留 ${username}）：`)).trim() || username;
    process.stdout.write('新密码（至少 8 位，不回显）：');
    muted = true;
    password = await prompt.question('');
    process.stdout.write('\n再次输入密码：');
    const confirmation = await prompt.question('');
    muted = false;
    process.stdout.write('\n');
    if (password.length < 8) throw new Error('密码至少需要 8 位。');
    if (password !== confirmation) throw new Error('两次密码不一致，配置未修改。');
  } finally { prompt.close(); }
}
const salt = randomBytes(16).toString('hex');
const passwordHash = createHash('sha256').update(`${salt}:${password}`).digest('hex');
await fs.writeFile(path.join(root, 'login.config.json'), JSON.stringify({ username, salt, passwordHash }, null, 2) + '\n');
const localPath = path.join(root, '.local/login-credentials.txt');
await fs.mkdir(path.dirname(localPath), { recursive: true });
if (generated) {
  await fs.writeFile(localPath, `博客初始登录信息（仅本机保存，不提交 Git）\n\n网址：https://liber301.github.io/\n账号：${username}\n初始密码：${password}\n\n修改账号和密码：在项目目录运行 npm run set-password，之后构建、提交并推送。\n这只是前端界面登录，GitHub Pages 上的源码、文章及静态资源仍然公开。\n`, { mode: 0o600 });
  console.log('初始账号密码已保存到 .local/login-credentials.txt（Git 已忽略）。');
} else {
  await fs.writeFile(localPath, `账号：${username}\n密码已由你重新设置，此文件不再保存旧密码。\n`, { mode: 0o600 });
  console.log('login.config.json 已更新；重新构建、提交并推送后生效。');
}
console.log('提示：前端登录仅控制界面显示，不能保护公开源码或静态文件。');
