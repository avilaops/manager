import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Função para copiar arquivos .js e .cjs
function copyJsFiles(srcPath, destPath) {
  if (!fs.existsSync(destPath)) {
    fs.mkdirSync(destPath, { recursive: true });
  }

  const files = fs.readdirSync(srcPath);
  files.forEach(file => {
    if (file.endsWith('.js') || file.endsWith('.cjs')) {
      const srcFile = path.join(srcPath, file);
      const destFile = path.join(destPath, file);
      fs.copyFileSync(srcFile, destFile);
      console.log(`✓ Copiado: ${file}`);
    }
  });
}

// Copiar arquivos de src/routes para dist/routes
const routesSrcDir = path.join(__dirname, 'src', 'routes');
const routesDestDir = path.join(__dirname, 'dist', 'routes');
console.log('Copiando rotas...');
copyJsFiles(routesSrcDir, routesDestDir);

// Copiar arquivos de src/middleware para dist/middleware
const middlewareSrcDir = path.join(__dirname, 'src', 'middleware');
const middlewareDestDir = path.join(__dirname, 'dist', 'middleware');
console.log('\nCopiando middleware...');
copyJsFiles(middlewareSrcDir, middlewareDestDir);

console.log('\n✓ Build completo!');

