// Carregar compromissos salvos
let compromissos = JSON.parse(localStorage.getItem('compromissos')) || [];

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    atualizarLista();
    
    // Definir data mínima como hoje
    const dataInput = document.getElementById('data');
    const hoje = new Date().toISOString().split('T')[0];
    dataInput.min = hoje;
    dataInput.value = hoje;
});

// Submeter formulário
document.getElementById('compromissoForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const titulo = document.getElementById('titulo').value;
    const descricao = document.getElementById('descricao').value;
    const data = document.getElementById('data').value;
    const hora = document.getElementById('hora').value;
    const lembrete = parseInt(document.getElementById('lembrete').value);
    
    const compromisso = {
        id: Date.now(),
        titulo,
        descricao,
        data,
        hora,
        lembrete,
        taskName: `Compromisso_${Date.now()}`
    };
    
    // Criar tarefa no Windows
    const sucesso = await criarTarefaWindows(compromisso);
    
    if (sucesso) {
        compromissos.push(compromisso);
        localStorage.setItem('compromissos', JSON.stringify(compromissos));
        
        mostrarStatus('Compromisso agendado com sucesso no Windows!', 'success');
        
        // Limpar formulário
        document.getElementById('compromissoForm').reset();
        document.getElementById('data').value = new Date().toISOString().split('T')[0];
        
        atualizarLista();
    } else {
        mostrarStatus('Erro ao criar tarefa no Windows. Certifique-se de executar o PowerShell como administrador.', 'error');
    }
});

async function criarTarefaWindows(compromisso) {
    try {
        const dataHora = new Date(`${compromisso.data}T${compromisso.hora}`);
        const dataHoraLembrete = new Date(dataHora.getTime() - compromisso.lembrete * 60000);
        
        // Formatar data e hora para o PowerShell
        const dataFormatada = dataHoraLembrete.toLocaleDateString('pt-BR');
        const horaFormatada = dataHoraLembrete.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        
        // Criar mensagem do lembrete
        let mensagem = `Compromisso: ${compromisso.titulo}`;
        if (compromisso.descricao) {
            mensagem += `\\n\\nDescrição: ${compromisso.descricao}`;
        }
        mensagem += `\\n\\nData/Hora: ${compromisso.data} às ${compromisso.hora}`;
        
        // Criar script PowerShell
        const script = `
$taskName = "${compromisso.taskName}"
$dataHora = "${dataFormatada} ${horaFormatada}"

# Criar ação para mostrar notificação
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-WindowStyle Hidden -Command \\"Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.MessageBox]::Show('${mensagem.replace(/'/g, "''")}', 'Lembrete de Compromisso', 'OK', 'Information')\\"" 

# Criar gatilho (trigger) para data/hora específica
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date "$dataHora")

# Configurações da tarefa
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

# Registrar a tarefa
try {
    Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Description "Compromisso: ${compromisso.titulo}" -Force
    Write-Output "SUCCESS"
} catch {
    Write-Output "ERROR: $_"
}
`;

        // Salvar script temporário
        const scriptPath = 'C:\\calendario-tarefas\\temp_task.ps1';
        const blob = new Blob([script], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        // Download do script
        const a = document.createElement('a');
        a.href = url;
        a.download = 'criar_tarefa.ps1';
        a.click();
        URL.revokeObjectURL(url);
        
        mostrarStatus('Script PowerShell baixado! Execute-o como Administrador para criar a tarefa.', 'success');
        
        return true;
    } catch (error) {
        console.error('Erro:', error);
        return false;
    }
}

function deletarCompromisso(id, taskName) {
    if (confirm('Deseja realmente excluir este compromisso?')) {
        // Criar script para remover tarefa
        const script = `
$taskName = "${taskName}"
try {
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
    Write-Output "Tarefa removida com sucesso"
} catch {
    Write-Output "Erro ao remover tarefa: $_"
}
`;
        
        // Download do script de remoção
        const blob = new Blob([script], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'remover_tarefa.ps1';
        a.click();
        URL.revokeObjectURL(url);
        
        // Remover da lista
        compromissos = compromissos.filter(c => c.id !== id);
        localStorage.setItem('compromissos', JSON.stringify(compromissos));
        
        atualizarLista();
        mostrarStatus('Script de remoção baixado! Execute-o como Administrador.', 'success');
    }
}

function atualizarLista() {
    const lista = document.getElementById('listaCompromissos');
    
    if (compromissos.length === 0) {
        lista.innerHTML = '<div class="empty-state">Nenhum compromisso agendado</div>';
        return;
    }
    
    // Ordenar por data e hora
    compromissos.sort((a, b) => {
        const dataA = new Date(`${a.data}T${a.hora}`);
        const dataB = new Date(`${b.data}T${b.hora}`);
        return dataA - dataB;
    });
    
    lista.innerHTML = compromissos.map(c => {
        const dataFormatada = new Date(c.data + 'T00:00:00').toLocaleDateString('pt-BR');
        const lembreteTexto = c.lembrete > 0 ? `${c.lembrete} minutos antes` : 'No horário';
        
        return `
            <div class="compromisso-item">
                <div class="compromisso-titulo">${c.titulo}</div>
                ${c.descricao ? `<div class="compromisso-descricao">${c.descricao}</div>` : ''}
                <div class="compromisso-info">
                    <div class="compromisso-data">📅 ${dataFormatada}</div>
                    <div class="compromisso-hora">🕐 ${c.hora}</div>
                    <div class="compromisso-lembrete">🔔 ${lembreteTexto}</div>
                </div>
                <button class="btn-delete" onclick="deletarCompromisso(${c.id}, '${c.taskName}')">
                    Excluir
                </button>
            </div>
        `;
    }).join('');
}

function mostrarStatus(mensagem, tipo) {
    const status = document.getElementById('status');
    status.textContent = mensagem;
    status.className = `status ${tipo}`;
    
    setTimeout(() => {
        status.style.display = 'none';
    }, 5000);
}

// Funções do Modal de Email
function mostrarModalEmail() {
    if (compromissos.length === 0) {
        mostrarStatus('Não há compromissos para enviar!', 'error');
        return;
    }
    
    const modal = document.getElementById('modalEmail');
    modal.style.display = 'block';
    atualizarPreviewEmail();
}

function fecharModalEmail() {
    const modal = document.getElementById('modalEmail');
    modal.style.display = 'none';
}

function atualizarPreviewEmail() {
    const preview = document.getElementById('previewEmail');
    preview.innerHTML = gerarHTMLEmail();
}

function gerarHTMLEmail() {
    const hoje = new Date();
    const dataAtual = hoje.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric' 
    });
    
    let html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0; font-size: 28px;">📅 Resumo de Compromissos</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Calendário Windows - ${dataAtual}</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px;">
                <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
                    Olá! Segue abaixo o resumo dos seus <strong>${compromissos.length} compromissos</strong> agendados:
                </p>
    `;
    
    // Agrupar por data
    const compromissosPorData = {};
    compromissos.forEach(c => {
        if (!compromissosPorData[c.data]) {
            compromissosPorData[c.data] = [];
        }
        compromissosPorData[c.data].push(c);
    });
    
    // Ordenar datas
    const datas = Object.keys(compromissosPorData).sort();
    
    datas.forEach(data => {
        const dataFormatada = new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
        
        html += `
            <div style="margin-bottom: 25px;">
                <h2 style="color: #1e3c72; font-size: 18px; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #2a5298;">
                    📆 ${dataFormatada}
                </h2>
        `;
        
        compromissosPorData[data].forEach(c => {
            const lembreteTexto = c.lembrete > 0 ? `${c.lembrete} min antes` : 'No horário';
            
            html += `
                <div style="background: white; padding: 20px; margin-bottom: 12px; border-radius: 8px; border-left: 5px solid #2a5298; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                    <div style="font-size: 18px; font-weight: 600; color: #2c3e50; margin-bottom: 8px;">
                        ${c.titulo}
                    </div>
                    ${c.descricao ? `
                        <div style="color: #666; font-size: 14px; margin-bottom: 10px; line-height: 1.5;">
                            ${c.descricao}
                        </div>
                    ` : ''}
                    <div style="display: flex; gap: 20px; font-size: 13px; color: #888; flex-wrap: wrap;">
                        <span>🕐 <strong>${c.hora}</strong></span>
                        <span>🔔 ${lembreteTexto}</span>
                    </div>
                </div>
            `;
        });
        
        html += `</div>`;
    });
    
    html += `
                <div style="margin-top: 30px; padding: 20px; background: white; border-radius: 8px; text-align: center;">
                    <p style="color: #666; font-size: 14px; margin: 0;">
                        <strong>Total de compromissos:</strong> ${compromissos.length}<br>
                        Este email foi gerado automaticamente pelo sistema de Calendário Windows.
                    </p>
                </div>
            </div>
            
            <div style="background: #2c3e50; color: white; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
                <p style="margin: 0; font-size: 13px; opacity: 0.8;">
                    Calendário de Compromissos - Windows Task Manager<br>
                    © ${hoje.getFullYear()} Nicolas Ávila
                </p>
            </div>
        </div>
    `;
    
    return html;
}

// Submit do formulário de email
document.getElementById('emailForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const destinatario = document.getElementById('destinatario').value;
    const assunto = document.getElementById('assuntoEmail').value;
    const corpoHTML = gerarHTMLEmail();
    
    // Criar script PowerShell para enviar email
    const script = `
# Importar configuração de email
. "C:\\calendario-tarefas\\enviar_email.ps1" -Destinatario "${destinatario}" -Assunto "${assunto}" -CorpoHTML @"
${corpoHTML}
"@
`;
    
    // Download do script
    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'enviar_resumo_email.ps1';
    a.click();
    URL.revokeObjectURL(url);
    
    fecharModalEmail();
    mostrarStatus(`Script gerado! Execute-o para enviar o email para ${destinatario}`, 'success');
});

// Fechar modal ao clicar fora
window.onclick = function(event) {
    const modal = document.getElementById('modalEmail');
    if (event.target === modal) {
        fecharModalEmail();
    }
}
