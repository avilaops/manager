import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Copiar arquivos .js e .cjs de src/routes para dist/routes
const srcDir = path.join(__dirname, 'src', 'routes');
const destDir = path.join(__dirname, 'dist', 'routes');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const files = fs.readdirSync(srcDir);
files.forEach(file => {
  if (file.endsWith('.js') || file.endsWith('.cjs')) {
    const srcFile = path.join(srcDir, file);
    const destFile = path.join(destDir, file);
    fs.copyFileSync(srcFile, destFile);
    console.log(`✓ Copiado: ${file}`);
  }
});

console.log('✓ Build completo!');
