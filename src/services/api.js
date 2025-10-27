import axios from 'axios';
import SecureStorage from './secureStorage';

// URL base da API - substitua pela URL real do seu servidor
const API_BASE_URL = 'https://api.treksafe.com'; // ou 'http://localhost:3000' para desenvolvimento

// Criar instância do axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptador de requisição para adicionar token de autenticação
api.interceptors.request.use(
  async config => {
    try {
      const token = await SecureStorage.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Erro ao recuperar token de autenticação:', error);
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Interceptador de resposta para tratar erros globalmente
api.interceptors.response.use(
  response => {
    return response;
  },
  async error => {
    const originalRequest = error.config;

    // Se o erro for 401 (não autorizado) e não for uma tentativa de retry
    if (error.response?.status === 401) {
        try {
          // Remove tokens inválidos
          await SecureStorage.clearAuthData();

          // Aqui você pode redirecionar para a tela de login
          // ou emitir um evento para o contexto de autenticação
          console.log('Token expirado, usuário deslogado');
        } catch (storageError) {
          console.error('Erro ao limpar dados de autenticação:', storageError);
        }
      }
    }

    return Promise.reject(error);
  }
);

// Função para definir a URL base (útil para alternar entre desenvolvimento e produção)
export const setApiBaseUrl = url => {
  api.defaults.baseURL = url;
};

// Função para fazer requisições GET
export const get = async (endpoint, params = {}) => {
  try {
    const response = await api.get(endpoint, { params });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Função para fazer requisições POST
export const post = async (endpoint, data = {}) => {
  try {
    const response = await api.post(endpoint, data);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Função para fazer requisições PUT
export const put = async (endpoint, data = {}) => {
  try {
    const response = await api.put(endpoint, data);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Função para fazer requisições DELETE
export const del = async endpoint => {
  try {
    const response = await api.delete(endpoint);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Função para tratar erros da API
const handleApiError = error => {
  if (error.response) {
    // O servidor respondeu com um status de erro
    const { status, data } = error.response;

    switch (status) {
      case 400:
        return new Error(data.message || 'Dados inválidos');
      case 401:
        return new Error('Não autorizado. Faça login novamente.');
      case 403:
        return new Error('Acesso negado');
      case 404:
        return new Error('Recurso não encontrado');
      case 500:
        return new Error('Erro interno do servidor');
      default:
        return new Error(data.message || 'Erro desconhecido');
    }
  } else if (error.request) {
    // A requisição foi feita mas não houve resposta
    return new Error('Erro de conexão. Verifique sua internet.');
  } else {
    // Algo aconteceu na configuração da requisição
    return new Error('Erro na requisição: ' + error.message);
  }
};

// Exportar a instância do axios para casos especiais
export { api };

export default {
  get,
  post,
  put,
  delete: del,
  setApiBaseUrl,
};
