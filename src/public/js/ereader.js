 
 // E-Reader e Biblioteca - Sistema Completo

class EReaderSystem {
    constructor() {
        this.livros = [
            {
                id: 1,
                titulo: "12 Regras para a Vida",
                autor: "Jordan B. Peterson",
                arquivo: "12 regras para a vida Um antídoto para o caos (Jordan B. Peterson) (Z-Library).pdf",
                totalPaginas: 448,
                paginaAtual: 1,
                progresso: 0,
                perguntas: this.gerarPerguntasJordan()
            },
            {
                id: 2,
                titulo: "O Ego É Seu Inimigo",
                autor: "Ryan Holiday",
                arquivo: "O Ego É Seu Inimigo. Como Dominar Seu Pior Adversário (Ryan Holiday) (Z-Library).pdf",
                totalPaginas: 208,
                paginaAtual: 1,
                progresso: 0,
                perguntas: this.gerarPerguntasRyan()
            }
        ];
        
        this.livroAtual = null;
        this.metaDiaria = 10; // 10 páginas por dia
        this.paginasLidasHoje = 0;
        this.diarioEntradas = [];
        this.humorAtual = '😊';
        this.notasRapidas = '';
        this.notasSaveTimeout = null;
        
        this.carregarDados();
        this.init();
    }
    
    init() {
        this.renderizarBiblioteca();
        this.renderizarMetaLeitura();
        this.renderizarDiario();
        this.verificarPerguntasDoDia();
        this.carregarNotasRapidas();
    }
    
    // === PERGUNTAS SOBRE OS LIVROS ===
    gerarPerguntasJordan() {
        return [
            { pagina: 10, texto: "Qual das 12 regras mais te chamou atenção até agora e por quê?", respondida: false },
            { pagina: 50, texto: "Como você pode aplicar o conceito de 'arrumar seu quarto' na sua vida?", respondida: false },
            { pagina: 100, texto: "Reflita sobre a ideia de 'comparar-se com quem você foi ontem'. Como isso muda sua perspectiva?", respondida: false },
            { pagina: 150, texto: "Peterson fala sobre assumir responsabilidade. Que responsabilidades você tem evitado?", respondida: false },
            { pagina: 200, texto: "O que significa para você 'dizer a verdade' em todas as situações?", respondida: false },
            { pagina: 250, texto: "Como você lida com o sofrimento inevitável da vida? O livro mudou sua perspectiva?", respondida: false },
            { pagina: 300, texto: "Reflita sobre o capítulo 'Não deixe seus filhos fazerem coisas que o fazem não gostar deles'. Como isso se aplica a relacionamentos?", respondida: false },
            { pagina: 350, texto: "Peterson fala sobre encontrar significado. Qual é o significado que você busca na vida?", respondida: false },
            { pagina: 400, texto: "Como você pode implementar essas regras no seu dia a dia de forma prática?", respondida: false },
            { pagina: 448, texto: "Após terminar o livro, qual regra você vai priorizar implementar primeiro? Por quê?", respondida: false }
        ];
    }
    
    gerarPerguntasRyan() {
        return [
            { pagina: 10, texto: "Ryan Holiday fala sobre aspiração vs ego. Como você identifica isso na sua vida?", respondida: false },
            { pagina: 30, texto: "Quais são os sinais de que seu ego está controlando suas decisões?", respondida: false },
            { pagina: 60, texto: "Reflita sobre um momento em que o ego impediu seu crescimento. O que aprendeu?", respondida: false },
            { pagina: 90, texto: "Como você pode praticar humildade no seu trabalho e relacionamentos?", respondida: false },
            { pagina: 120, texto: "Holiday menciona 'fazer o trabalho'. Que trabalho importante você tem adiado?", respondida: false },
            { pagina: 150, texto: "Como você lida com críticas e fracassos? Seu ego te protege ou te prejudica?", respondida: false },
            { pagina: 180, texto: "Qual a diferença entre confiança e arrogância na sua jornada?", respondida: false },
            { pagina: 208, texto: "Após terminar, como você vai aplicar esses conceitos para dominar seu ego?", respondida: false }
        ];
    }
    
    // === BIBLIOTECA ===
    renderizarBiblioteca() {
        const container = document.getElementById('bibliotecaLivros');
        if (!container) return;
        
        container.innerHTML = this.livros.map(livro => `
            <div class="livro-card ${this.livroAtual?.id === livro.id ? 'active' : ''}" 
                 onclick="ereaderSystem.selecionarLivro(${livro.id})">
                <div class="livro-titulo">${livro.titulo}</div>
                <div class="livro-autor">${livro.autor}</div>
                <div class="livro-progresso">
                    <div class="progresso-label">Progresso: ${livro.progresso}%</div>
                    <div class="progresso-bar">
                        <div class="progresso-fill" style="width: ${livro.progresso}%"></div>
                    </div>
                </div>
                <div class="livro-meta">
                    <span>📖 ${livro.paginaAtual}/${livro.totalPaginas}</span>
                    <span>${this.calcularTempoRestante(livro)}</span>
                </div>
            </div>
        `).join('');
    }
    
    selecionarLivro(livroId) {
        this.livroAtual = this.livros.find(l => l.id === livroId);
        this.renderizarBiblioteca();
        this.abrirLeitor();
    }
    
    calcularTempoRestante(livro) {
        const paginasRestantes = livro.totalPaginas - livro.paginaAtual;
        const diasRestantes = Math.ceil(paginasRestantes / this.metaDiaria);
        return `~${diasRestantes} dias`;
    }
    
    // === LEITOR ===
    abrirLeitor() {
        if (!this.livroAtual) return;
        
        const leitorInfo = document.getElementById('leitorInfo');
        const pdfViewer = document.getElementById('pdfViewer');
        const leitorPrincipal = document.querySelector('.leitor-principal');
        
        // Ativar modo escuro para concentração
        if (leitorPrincipal) {
            leitorPrincipal.style.background = '#1a1a1a';
        }
        
        if (leitorInfo) {
            leitorInfo.innerHTML = `
                <h2 style="color: #fff;">${this.livroAtual.titulo}</h2>
                <p style="color: #aaa;">${this.livroAtual.autor}</p>
            `;
        }
        
        if (pdfViewer) {
            pdfViewer.src = `/Livros/${encodeURIComponent(this.livroAtual.arquivo)}#page=${this.livroAtual.paginaAtual}`;
        }
        
        this.atualizarNavegacao();
        this.verificarPerguntasDaPagina();
    }
    
    proximaPagina() {
        if (!this.livroAtual) return;
        
        if (this.livroAtual.paginaAtual < this.livroAtual.totalPaginas) {
            this.livroAtual.paginaAtual++;
            this.paginasLidasHoje++;
            this.atualizarProgresso();
            this.abrirLeitor();
            this.verificarMetaDiaria();
            this.salvarDados();
        }
    }
    
    paginaAnterior() {
        if (!this.livroAtual) return;
        
        if (this.livroAtual.paginaAtual > 1) {
            this.livroAtual.paginaAtual--;
            this.abrirLeitor();
            this.salvarDados();
        }
    }
    
    irParaPagina(pagina) {
        if (!this.livroAtual) return;
        
        pagina = parseInt(pagina);
        if (pagina >= 1 && pagina <= this.livroAtual.totalPaginas) {
            const diff = pagina - this.livroAtual.paginaAtual;
            if (diff > 0) {
                this.paginasLidasHoje += diff;
            }
            this.livroAtual.paginaAtual = pagina;
            this.atualizarProgresso();
            this.abrirLeitor();
            this.verificarMetaDiaria();
            this.salvarDados();
        }
    }
    
    atualizarNavegacao() {
        const paginaInfo = document.getElementById('paginaInfo');
        const btnAnterior = document.getElementById('btnPaginaAnterior');
        const btnProxima = document.getElementById('btnPaginaProxima');
        const inputPagina = document.getElementById('inputPagina');
        
        if (paginaInfo && this.livroAtual) {
            paginaInfo.innerHTML = `
                <span>Página</span>
                <input type="number" 
                       id="inputPagina" 
                       class="pagina-input" 
                       value="${this.livroAtual.paginaAtual}" 
                       min="1" 
                       max="${this.livroAtual.totalPaginas}"
                       onchange="ereaderSystem.irParaPagina(this.value)">
                <span>de ${this.livroAtual.totalPaginas}</span>
            `;
        }
        
        if (btnAnterior) {
            btnAnterior.disabled = !this.livroAtual || this.livroAtual.paginaAtual <= 1;
        }
        
        if (btnProxima) {
            btnProxima.disabled = !this.livroAtual || this.livroAtual.paginaAtual >= this.livroAtual.totalPaginas;
        }
    }
    
    atualizarProgresso() {
        if (!this.livroAtual) return;
        
        this.livroAtual.progresso = Math.round((this.livroAtual.paginaAtual / this.livroAtual.totalPaginas) * 100);
        this.renderizarBiblioteca();
        this.renderizarMetaLeitura();
    }
    
    // === META DE LEITURA ===
    renderizarMetaLeitura() {
        const container = document.getElementById('metaLeituraContainer');
        if (!container) return;
        
        const progresso = Math.min((this.paginasLidasHoje / this.metaDiaria) * 100, 100);
        const status = this.paginasLidasHoje >= this.metaDiaria ? '✅ Meta cumprida!' : '📖 Continue lendo!';
        
        container.innerHTML = `
            <div class="meta-leitura">
                <h4>🎯 Meta Diária de Leitura</h4>
                <div class="meta-progresso">
                    <div>
                        <div class="meta-numero">${this.paginasLidasHoje}/${this.metaDiaria}</div>
                        <div class="meta-label">páginas hoje</div>
                    </div>
                    <div style="font-size: 32px;">${this.paginasLidasHoje >= this.metaDiaria ? '🎉' : '📚'}</div>
                </div>
                <div class="meta-bar">
                    <div class="meta-fill" style="width: ${progresso}%"></div>
                </div>
                <div style="margin-top: 10px; font-size: 14px;">${status}</div>
            </div>
        `;
    }
    
    verificarMetaDiaria() {
        if (this.paginasLidasHoje === this.metaDiaria) {
            this.mostrarNotificacao('🎉 Parabéns! Você completou sua meta diária de leitura!', 'success');
            // Add to notification system
            if (window.addNotification) {
                window.addNotification('reading', 'Meta cumprida! 🎉', `Você leu ${this.metaDiaria} páginas hoje`);
            }
        }
    }
    
    // === PERGUNTAS ===
    verificarPerguntasDaPagina() {
        if (!this.livroAtual) return;
        
        const perguntasDaPagina = this.livroAtual.perguntas.filter(
            p => p.pagina === this.livroAtual.paginaAtual && !p.respondida
        );
        
        if (perguntasDaPagina.length > 0) {
            this.mostrarPerguntas(perguntasDaPagina);
        }
    }
    
    verificarPerguntasDoDia() {
        if (!this.livroAtual) return;
        
        const container = document.getElementById('perguntasDoDia');
        if (!container) return;
        
        const perguntasPendentes = this.livroAtual.perguntas.filter(
            p => p.pagina <= this.livroAtual.paginaAtual && !p.respondida
        );
        
        if (perguntasPendentes.length > 0) {
            container.innerHTML = `
                <div class="perguntas-container">
                    <h3 style="margin-bottom: 15px;">💭 Perguntas de Reflexão</h3>
                    ${perguntasPendentes.map((p, i) => `
                        <div class="pergunta-card">
                            <div class="pergunta-texto">${p.texto}</div>
                            <textarea id="resposta_${i}" 
                                      class="resposta-input" 
                                      placeholder="Escreva sua reflexão aqui..."></textarea>
                            <button class="responder-btn" 
                                    onclick="ereaderSystem.responderPergunta(${p.pagina}, document.getElementById('resposta_${i}').value)">
                                ✍️ Salvar Reflexão
                            </button>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            container.innerHTML = '<p style="text-align: center; color: #999;">Nenhuma pergunta pendente no momento.</p>';
        }
    }
    
    mostrarPerguntas(perguntas) {
        const modal = `
            <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); 
                        display: flex; align-items: center; justify-content: center; z-index: 10000;">
                <div style="background: white; padding: 30px; border-radius: 15px; max-width: 600px; width: 90%;">
                    <h3 style="margin-bottom: 20px; color: #667eea;">💭 Momento de Reflexão</h3>
                    <p style="margin-bottom: 20px; color: #666;">
                        Você chegou em um ponto importante do livro. Que tal refletir sobre o que leu?
                    </p>
                    <div class="pergunta-card">
                        <div class="pergunta-texto">${perguntas[0].texto}</div>
                        <textarea id="respostaModal" class="resposta-input" 
                                  placeholder="Escreva sua reflexão aqui..."></textarea>
                    </div>
                    <div style="display: flex; gap: 10px; margin-top: 20px; justify-content: flex-end;">
                        <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                                style="padding: 10px 20px; border: 2px solid #ddd; background: white; 
                                       border-radius: 8px; cursor: pointer;">
                            Responder depois
                        </button>
                        <button onclick="ereaderSystem.responderPergunta(${perguntas[0].pagina}, 
                                        document.getElementById('respostaModal').value); 
                                        this.parentElement.parentElement.parentElement.remove();"
                                class="responder-btn" style="background: #667eea; color: white; 
                                       border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer;">
                            ✍️ Salvar Reflexão
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modal);
    }
    
    responderPergunta(pagina, resposta) {
        if (!this.livroAtual || !resposta.trim()) return;
        
        const pergunta = this.livroAtual.perguntas.find(p => p.pagina === pagina);
        if (pergunta) {
            pergunta.respondida = true;
            pergunta.resposta = resposta;
            pergunta.dataResposta = new Date().toISOString();
            
            // Salvar no diário também
            this.salvarEntradaDiario(`📚 Reflexão sobre "${this.livroAtual.titulo}" (página ${pagina}):\n\nPergunta: ${pergunta.texto}\n\nResposta: ${resposta}`, '🤔');
            
            this.mostrarNotificacao('✅ Reflexão salva com sucesso!', 'success');
            this.verificarPerguntasDoDia();
            this.salvarDados();
        }
    }
    
    // === DIÁRIO PESSOAL ===
    renderizarDiario() {
        const container = document.getElementById('diarioEntradas');
        if (!container) return;
        
        if (this.diarioEntradas.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📔</div>
                    <h3>Seu diário está vazio</h3>
                    <p>Comece a escrever suas reflexões e pensamentos</p>
                </div>
            `;
            return;
        }
        
        const entradasOrdenadas = [...this.diarioEntradas].reverse();
        
        container.innerHTML = entradasOrdenadas.map(entrada => `
            <div class="entrada-diario">
                <div class="entrada-header">
                    <span class="entrada-data">${this.formatarData(entrada.data)}</span>
                    <span class="entrada-humor">${entrada.humor}</span>
                </div>
                <div class="entrada-texto">${this.formatarTexto(entrada.texto)}</div>
            </div>
        `).join('');
    }
    
    selecionarHumor(humor) {
        this.humorAtual = humor;
        document.querySelectorAll('.humor-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        event.target.classList.add('selected');
    }
    
    salvarEntradaDiario(texto = null, humor = null) {
        const textarea = document.getElementById('novaEntradaTexto');
        const textoEntrada = texto || (textarea ? textarea.value.trim() : '');
        const humorEntrada = humor || this.humorAtual;
        
        if (!textoEntrada) {
            this.mostrarNotificacao('⚠️ Escreva algo antes de salvar', 'warning');
            return;
        }
        
        const entrada = {
            id: Date.now(),
            data: new Date().toISOString(),
            texto: textoEntrada,
            humor: humorEntrada
        };
        
        this.diarioEntradas.push(entrada);
        
        if (textarea) {
            textarea.value = '';
        }
        this.humorAtual = '😊';
        
        this.renderizarDiario();
        this.salvarDados();
        this.mostrarNotificacao('✅ Entrada salva no diário!', 'success');
    }
    
    exportarDiario() {
        const texto = this.diarioEntradas.map(e => 
            `${this.formatarData(e.data)} ${e.humor}\n${e.texto}\n\n${'='.repeat(50)}\n`
        ).join('\n');
        
        const blob = new Blob([texto], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `diario_${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.mostrarNotificacao('📥 Diário exportado!', 'success');
    }
    
    // === UTILITÁRIOS ===
    formatarData(isoString) {
        const data = new Date(isoString);
        return data.toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    formatarTexto(texto) {
        return texto.replace(/\n/g, '<br>');
    }
    
    mostrarNotificacao(mensagem, tipo = 'info') {
        const cores = {
            success: '#4CAF50',
            warning: '#ff9800',
            error: '#f44336',
            info: '#2196F3'
        };
        
        const notif = document.createElement('div');
        notif.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${cores[tipo]};
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        notif.textContent = mensagem;
        document.body.appendChild(notif);
        
        setTimeout(() => {
            notif.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notif.remove(), 300);
        }, 3000);
    }
    
    // === PERSISTÊNCIA ===
    salvarDados() {
        const dados = {
            livros: this.livros,
            paginasLidasHoje: this.paginasLidasHoje,
            diarioEntradas: this.diarioEntradas,
            ultimaAtualizacao: new Date().toISOString()
        };
        
        localStorage.setItem('ereaderData', JSON.stringify(dados));
        
        // Salvar no backend também
        fetch('/api/ereader/salvar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        }).catch(err => console.log('Salvamento offline:', err));
    }
    
    carregarDados() {
        try {
            const dados = JSON.parse(localStorage.getItem('ereaderData'));
            if (dados) {
                // Mesclar dados salvos com estrutura atual
                this.livros = this.livros.map(livro => {
                    const salvo = dados.livros.find(l => l.id === livro.id);
                    return salvo ? { ...livro, ...salvo } : livro;
                });
                
                this.diarioEntradas = dados.diarioEntradas || [];
                
                // Resetar páginas lidas se for um novo dia
                const hoje = new Date().toDateString();
                const ultimaData = new Date(dados.ultimaAtualizacao).toDateString();
                this.paginasLidasHoje = (hoje === ultimaData) ? dados.paginasLidasHoje : 0;
            }
        } catch (e) {
            console.log('Nenhum dado salvo encontrado');
        }
    }
    
    // === NOTAS RÁPIDAS ===
    carregarNotasRapidas() {
        const textarea = document.getElementById('notasRapidas');
        if (!textarea) return;
        
        const notas = localStorage.getItem('notasRapidas') || '';
        this.notasRapidas = notas;
        textarea.value = notas;
        this.atualizarContadorNotas();
    }
    
    salvarNotasRapidas() {
        const textarea = document.getElementById('notasRapidas');
        if (!textarea) return;
        
        this.notasRapidas = textarea.value;
        this.atualizarContadorNotas();
        this.mostrarStatusSalvamento();
        
        // Auto-save com debounce
        clearTimeout(this.notasSaveTimeout);
        this.notasSaveTimeout = setTimeout(() => {
            localStorage.setItem('notasRapidas', this.notasRapidas);
        }, 2000);
    }
    
    limparNotas() {
        if (confirm('❗ Tem certeza que deseja limpar todas as notas rápidas?')) {
            this.notasRapidas = '';
            localStorage.removeItem('notasRapidas');
            const textarea = document.getElementById('notasRapidas');
            if (textarea) textarea.value = '';
            this.atualizarContadorNotas();
            this.mostrarNotificacao('🗑️ Notas limpas!', 'info');
        }
    }
    
    atualizarContadorNotas() {
        const counter = document.getElementById('notasCount');
        if (counter) {
            const count = this.notasRapidas.length;
            counter.textContent = `${count} caractere${count !== 1 ? 's' : ''}`;
        }
    }
    
    mostrarStatusSalvamento() {
        const status = document.getElementById('notasStatus');
        if (status) {
            status.textContent = '💾 Salvando...';
            status.style.color = '#ff9800';
            
            setTimeout(() => {
                status.textContent = '✓ Salvo';
                status.style.color = '#4CAF50';
            }, 2000);
        }
    }
}

// Inicializar sistema
let ereaderSystem;

// Adicionar estilos de animação
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);
