/**
 * Gerenciador de Autenticação
 * Responsável por login, logout e gestão de tokens JWT
 */
class AuthManager {
    static TOKEN_KEY = 'avila_dashboard_token';
    static USER_KEY = 'avila_dashboard_user';
    static API_BASE = 'http://localhost:3000/api';

    /**
     * Realiza login e armazena token
     */
    static async login(username, password) {
        try {
            const response = await fetch(`${this.API_BASE}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (data.success && data.token) {
                localStorage.setItem(this.TOKEN_KEY, data.token);
                localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));
                return { success: true, user: data.user };
            }

            return { success: false, error: data.error || 'Erro ao fazer login' };
        } catch (error) {
            console.error('Erro no login:', error);
            return { success: false, error: 'Erro de conexão com o servidor' };
        }
    }

    /**
     * Obtém o token armazenado
     */
    static getToken() {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    /**
     * Obtém dados do usuário
     */
    static getUser() {
        const userStr = localStorage.getItem(this.USER_KEY);
        return userStr ? JSON.parse(userStr) : null;
    }

    /**
     * Faz logout e redireciona
     */
    static logout() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        window.location.href = '/login.html';
    }

    /**
     * Verifica se está autenticado
     */
    static isAuthenticated() {
        return !!this.getToken();
    }

    /**
     * Verifica autenticação ao carregar página
     */
    static checkAuth() {
        if (!this.isAuthenticated() && !window.location.pathname.includes('login.html')) {
            this.logout();
        }
    }
}

/**
 * Cliente API com autenticação automática
 */
class APIClient {
    static BASE_URL = 'http://localhost:3000/api';

    /**
     * Faz requisição autenticada
     */
    static async request(endpoint, options = {}) {
        const token = AuthManager.getToken();

        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...options.headers
            }
        };

        try {
            const response = await fetch(`${this.BASE_URL}${endpoint}`, config);

            // Token expirado ou inválido
            if (response.status === 401) {
                AuthManager.logout();
                throw new Error('Sessão expirada. Faça login novamente.');
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro na requisição');
            }

            return data;
        } catch (error) {
            console.error('Erro na API:', error);
            throw error;
        }
    }

    /**
     * GET request
     */
    static async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    /**
     * POST request
     */
    static async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * PUT request
     */
    static async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * DELETE request
     */
    static async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

/**
 * Utilitários de UI
 */
class UIUtils {
    /**
     * Mostra loading em um container
     */
    static showLoading(containerId, message = 'Carregando...') {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="loading-overlay">
                <div class="spinner"></div>
                <p class="loading-message">${message}</p>
            </div>
        `;
    }

    /**
     * Mostra erro em um container
     */
    static showError(containerId, message, onRetry = null) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const retryBtn = onRetry ? `
            <button onclick="(${onRetry.toString()})()" class="btn-retry">
                🔄 Tentar Novamente
            </button>
        ` : '';

        container.innerHTML = `
            <div class="error-card">
                <div class="error-icon">⚠️</div>
                <h3>Ops! Algo deu errado</h3>
                <p class="error-message">${message}</p>
                ${retryBtn}
            </div>
        `;
    }

    /**
     * Mostra toast de sucesso
     */
    static showSuccess(message, duration = 3000) {
        this.showToast(message, 'success', duration);
    }

    /**
     * Mostra toast de erro
     */
    static showErrorToast(message, duration = 3000) {
        this.showToast(message, 'error', duration);
    }

    /**
     * Mostra toast genérico
     */
    static showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${this.getToastIcon(type)}</span>
            <span class="toast-message">${message}</span>
        `;

        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 100);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    /**
     * Retorna ícone para tipo de toast
     */
    static getToastIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    /**
     * Mostra empty state
     */
    static showEmptyState(containerId, message, icon = '📭') {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">${icon}</div>
                <p class="empty-message">${message}</p>
            </div>
        `;
    }

    /**
     * Formata data para exibição
     */
    static formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Debounce para input
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Verifica autenticação ao carregar
document.addEventListener('DOMContentLoaded', () => {
    AuthManager.checkAuth();
});
