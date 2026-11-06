import { execFileSync, execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const version = manifest.version;

function run(cmd, options = {}) {
  return execSync(cmd, { cwd: root, stdio: 'inherit', ...options });
}

function capture(cmd) {
  try {
    return execSync(cmd, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  } catch {
    return null;
  }
}

console.log(`\n📦 Iniciando preparação de release para react-intl-number-input@${version}\n`);

// 1. Verificar usuário npm
const currentUser = capture('npm whoami');
if (!currentUser) {
  console.error('❌ Você não está autenticado no npm. Execute `npm login` antes de continuar.');
  process.exit(1);
}

console.log(`👤 Usuário npm conectado: ${currentUser}`);
if (currentUser !== 'wipmob' && currentUser !== 'nandorip') {
  console.warn(`⚠️  Aviso: O pacote pertence a 'wipmob'. Seu usuário é '${currentUser}'. Pode ocorrer erro de permissão (404/403).`);
}

// 2. Verificar se versão já foi publicada
const publishedVersion = capture(`npm view ${manifest.name}@${version} version`);
if (publishedVersion === version) {
  console.error(`❌ A versão ${version} já está publicada no npm registry. Atualize a versão no package.json primeiro.`);
  process.exit(1);
}

// 3. Executar verificações completas
console.log('\n🔍 Executando verificações (testes, types, build e tarball)...');
run('npm run check');

// 4. Publicar no npm
const otpArg = process.argv.find((arg) => arg.startsWith('--otp=')) || '';
const otp = otpArg.slice('--otp='.length);
if (otpArg && !/^\d{6,8}$/.test(otp)) {
  console.error('❌ OTP inválido: informe um código numérico de 6 a 8 dígitos.');
  process.exit(1);
}
const publishArgs = ['publish', ...(otpArg ? [`--otp=${otp}`] : [])];
const npmCli = process.env.npm_execpath;
if (!npmCli) {
  console.error('❌ Execute este script com `npm run release`.');
  process.exit(1);
}

console.log(`\n🚀 Executando: npm publish${otpArg ? ' --otp=<oculto>' : ''}`);
try {
  execFileSync(process.execPath, [npmCli, ...publishArgs], { cwd: root, stdio: 'inherit' });
  console.log(`\n✅ react-intl-number-input@${version} publicado com sucesso no npm!`);
} catch (error) {
  console.error('\n❌ Falha na publicação. Se for erro de 2FA/EOTP, forneça o código: `npm run release -- --otp=123456`');
  process.exit(1);
}

// 5. Criar e enviar git tag se aplicável
const tag = `v${version}`;
const existingTag = capture(`git tag -l ${tag}`);
if (!existingTag) {
  console.log(`\n🏷️  Criando tag ${tag} no Git...`);
  try {
    run(`git tag ${tag}`);
    run(`git push origin ${tag}`);
    console.log(`✅ Tag ${tag} enviada para o GitHub.`);
  } catch {
    console.warn(`⚠️  Não foi possível enviar a tag ${tag} automaticamente.`);
  }
}

console.log('\n🎉 Processo de release concluído!\n');
