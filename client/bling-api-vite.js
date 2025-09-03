// 🎯 ARQUIVO ADAPTADO PARA VITE/REACT
// Copie este arquivo para seu projeto Vite: src/lib/bling-api.js

import axios from 'axios';

// 🔧 CONFIGURAR A URL DA SUA API BACKEND DEPLOYADA NA VERCEL
const API_BASE_URL = 'https://sua-api-backend.vercel.app'; // ⚠️ TROCAR PELA URL REAL

export class BlingAPI {
  static STORAGE_KEY = 'bling_auth_state';

  constructor() {}

  // Gera URL de autorização para redirecionamento
  getAuthorizationUrl(state = 'default_state') {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: import.meta.env.CLIENT_ID || '',
      state,
      redirect_uri: `${API_BASE_URL}/api/bling/callback`
    });

    const baseUrl = import.meta.env.VITE_BLING_BASE_URL || 'https://bling.com.br/Api/v3';
    return `${baseUrl}/oauth/authorize?${params}`;
  }

  // Inicia processo de autorização redirecionando o usuário
  startAuthorization() {
    const authUrl = this.getAuthorizationUrl();
    window.location.href = authUrl;
  }

  // Verifica se há tokens válidos armazenados
  isAuthenticated() {
    const authState = this.getStoredAuthState();
    if (!authState?.isAuthenticated || !authState.tokens) {
      return false;
    }

    // Verifica se o token não expirou (com margem de 5 minutos)
    if (authState.tokenExpiry && authState.tokenExpiry < Date.now() + (5 * 60 * 1000)) {
      return false;
    }

    return true;
  }

  // Obtém o estado de autenticação armazenado
  getStoredAuthState() {
    if (typeof window === 'undefined') return null;
    
    try {
      const stored = localStorage.getItem(BlingAPI.STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  // Armazena o estado de autenticação
  storeAuthState(authState) {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(BlingAPI.STORAGE_KEY, JSON.stringify(authState));
  }

  // Obtém tokens usando código de autorização
  async exchangeCodeForTokens(code, state) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/bling/token`, { code, state });
      const tokens = response.data;

      const authState = {
        isAuthenticated: true,
        tokens,
        tokenExpiry: Date.now() + (tokens.expires_in * 1000)
      };

      this.storeAuthState(authState);
      return true;
    } catch (error) {
      console.error('Erro ao obter tokens:', error);
      return false;
    }
  }

  // Renova access token usando refresh token
  async refreshAccessToken() {
    const authState = this.getStoredAuthState();
    if (!authState?.tokens?.refresh_token) {
      return false;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/bling/refresh`, {
        refresh_token: authState.tokens.refresh_token
      });
      
      const newTokens = response.data;
      
      const updatedAuthState = {
        isAuthenticated: true,
        tokens: newTokens,
        tokenExpiry: Date.now() + (newTokens.expires_in * 1000)
      };

      this.storeAuthState(updatedAuthState);
      return true;
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      this.clearAuthState();
      return false;
    }
  }

  // Faz requisição autenticada para a API do Bling via backend
  async makeApiRequest(endpoint, method = 'GET', data) {
    // Verifica autenticação
    if (!this.isAuthenticated()) {
      throw new Error('Não autenticado. Faça login primeiro.');
    }

    // Tenta renovar token se próximo do vencimento
    const authState = this.getStoredAuthState();
    if (authState?.tokenExpiry && authState.tokenExpiry < Date.now() + (10 * 60 * 1000)) {
      const refreshed = await this.refreshAccessToken();
      if (!refreshed) {
        throw new Error('Falha ao renovar token. Faça login novamente.');
      }
    }

    // Obtém token atualizado
    const currentAuthState = this.getStoredAuthState();
    if (!currentAuthState?.tokens?.access_token) {
      throw new Error('Token de acesso não disponível.');
    }

    try {
      // Mapeia endpoints para rotas backend específicas
      let apiEndpoint = `${API_BASE_URL}/api/bling/proxy`;
      if (endpoint === '/nfe' || endpoint === 'nfe') {
        apiEndpoint = `${API_BASE_URL}/api/bling/test-nfe`;
      }

      const response = await axios({
        method: 'POST', // Sempre POST para as rotas backend
        url: apiEndpoint,
        data: {
          access_token: currentAuthState.tokens.access_token,
          endpoint: endpoint,
          method: method,
          requestData: data
        }
      });

      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        // Token inválido, tenta renovar uma vez
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Tenta novamente com token renovado
          const newAuthState = this.getStoredAuthState();
          if (newAuthState?.tokens?.access_token) {
            let apiEndpoint = `${API_BASE_URL}/api/bling/proxy`;
            if (endpoint === '/nfe' || endpoint === 'nfe') {
              apiEndpoint = `${API_BASE_URL}/api/bling/test-nfe`;
            }

            const retryResponse = await axios({
              method: 'POST',
              url: apiEndpoint,
              data: {
                access_token: newAuthState.tokens.access_token,
                endpoint: endpoint,
                method: method,
                requestData: data
              }
            });
            return retryResponse.data;
          }
        }
        
        // Se não conseguiu renovar, limpa autenticação
        this.clearAuthState();
        throw new Error('Token expirado. Faça login novamente.');
      }

      // Se for erro da nossa API, extrai a mensagem real
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error + (error.response.data.details ? `: ${JSON.stringify(error.response.data.details)}` : ''));
      }

      throw error;
    }
  }

  // Testa conexão com a API listando NFe
  async testConnection() {
    return this.makeApiRequest('/nfe');
  }

  // Cria NFe com dados fiscais completos
  async createNFe(nfeData) {
    // Verifica autenticação
    if (!this.isAuthenticated()) {
      throw new Error('Não autenticado. Faça login primeiro.');
    }

    // Obtém token atual
    const authState = this.getStoredAuthState();
    if (!authState?.tokens?.access_token) {
      throw new Error('Token de acesso não disponível.');
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/bling/create-nfe`, {
        access_token: authState.tokens.access_token,
        nfeData
      });

      return response.data;
    } catch (error) {
      // Se for erro de token, tenta renovar
      if (error.response?.status === 401) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Tenta novamente com token renovado
          const newAuthState = this.getStoredAuthState();
          if (newAuthState?.tokens?.access_token) {
            const retryResponse = await axios.post(`${API_BASE_URL}/api/bling/create-nfe`, {
              access_token: newAuthState.tokens.access_token,
              nfeData
            });
            return retryResponse.data;
          }
        }
        
        this.clearAuthState();
        throw new Error('Token expirado. Faça login novamente.');
      }

      // Se for erro da nossa API, extrai a mensagem real
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error + (error.response.data.details ? `: ${JSON.stringify(error.response.data.details)}` : ''));
      }

      throw error;
    }
  }

  // Obtém informações do usuário autenticado
  async getUserInfo() {
    return this.makeApiRequest('/me');
  }

  // Limpa dados de autenticação
  clearAuthState() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(BlingAPI.STORAGE_KEY);
    }
  }

  // Faz logout
  logout() {
    this.clearAuthState();
  }

  // Obtém dados do token atual (para debug)
  getTokenInfo() {
    const authState = this.getStoredAuthState();
    return authState?.tokens || null;
  }
}

// Instância singleton para uso global
export const blingApi = new BlingAPI();

// Export default para compatibilidade
export default BlingAPI;