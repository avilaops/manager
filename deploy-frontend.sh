#!/bin/bash

echo "🚀 Iniciando deploy do frontend para GitHub Pages..."

# Criar diretório dist se não existir
mkdir -p dist

# Copiar arquivos públicos
echo "📦 Copiando assets..."
cp -r src/public/* dist/

# Copiar páginas HTML
echo "📄 Copiando páginas..."
cp src/views/dashboard.html dist/index.html
cp src/views/login.html dist/login.html
cp src/views/cadastro.html dist/cadastro.html

# Copiar CNAME
echo "🌐 Configurando CNAME..."
cp CNAME dist/CNAME

# Criar arquivo .nojekyll para desabilitar Jekyll
touch dist/.nojekyll

# Minificar se clean-css e terser estiverem instalados
if command -v cleancss &> /dev/null && command -v terser &> /dev/null; then
    echo "⚡ Minificando assets..."
    
    # Minificar CSS
    for file in dist/css/*.css; do
        if [[ ! $file =~ \.min\.css$ ]]; then
            cleancss -o "${file%.css}.min.css" "$file"
            echo "✅ Minificado: $(basename $file)"
        fi
    done
    
    # Minificar JS
    for file in dist/js/*.js; do
        if [[ ! $file =~ \.min\.js$ ]]; then
            terser "$file" -o "${file%.js}.min.js" -c -m
            echo "✅ Minificado: $(basename $file)"
        fi
    done
else
    echo "⚠️ clean-css-cli ou terser não instalados. Pulando minificação."
    echo "   Instale com: npm install -g clean-css-cli terser"
fi

echo "✅ Build concluído! Arquivos em ./dist"
echo ""
echo "📤 Para fazer deploy:"
echo "   1. Commit e push para main:"
echo "      git add ."
echo "      git commit -m 'Deploy frontend'"
echo "      git push origin main"
echo ""
echo "   2. Ou use GitHub CLI:"
echo "      gh workflow run deploy-pages.yml"
echo ""
echo "🌐 Seu site estará disponível em: https://admin.avila.inc"
