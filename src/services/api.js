// services/api.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_CONFIG = {
  BASE_URL: 'http://192.168.18.13:3001',
  TIMEOUT: 10000,
};

class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  // Obter token do AsyncStorage
  async getAuthToken() {
    try {
      return await AsyncStorage.getItem('token');
    } catch (error) {
      console.error('Erro ao obter token:', error);
      return null;
    }
  }

  // Fazer requisição com autenticação automática
  async makeRequest(endpoint, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    try {
      const token = await this.getAuthToken();

      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      // Adicionar token se disponível
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  // Métodos HTTP básicos
  async get(endpoint, options = {}) {
    return this.makeRequest(endpoint, {
      method: 'GET',
      ...options,
    });
  }

  async post(endpoint, data = {}, options = {}) {
    return this.makeRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  }

  async put(endpoint, data = {}, options = {}) {
    return this.makeRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    });
  }

  async delete(endpoint, options = {}) {
    return this.makeRequest(endpoint, {
      method: 'DELETE',
      ...options,
    });
  }

  // Métodos específicos para trilhas - COM TRATAMENTO DE LISTAS VAZIAS
  async getTrilhasPorArea(latitude, longitude, raio = 10) {
    try {
      const params = new URLSearchParams({
        lat: latitude.toString(),
        lng: longitude.toString(),
        radius: raio.toString(),
      });

      const response = await this.get(`/api/treks/area?${params}`);

      // Tratar resposta vazia como sucesso
      return {
        success: true,
        data: response.data || [],
        count: response.count || 0,
        message:
          response.message ||
          (response.data?.length > 0
            ? `${response.data.length} trilhas encontradas`
            : 'Nenhuma trilha encontrada nesta área'),
      };
    } catch (error) {
      console.warn('⚠️ Erro ao buscar trilhas por área:', error.message);

      // Retornar lista vazia em vez de erro
      return {
        success: true,
        data: [],
        count: 0,
        message: 'Não foi possível carregar trilhas no momento',
      };
    }
  }

  async getTrilhasPublicas(limit = 50, offset = 0) {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });

      const response = await this.get(`/api/treks/public?${params}`);

      // Tratar resposta vazia como sucesso
      return {
        success: true,
        data: response.data || [],
        count: response.count || 0,
        message:
          response.message ||
          (response.data?.length > 0
            ? `${response.data.length} trilhas públicas encontradas`
            : 'Nenhuma trilha pública disponível'),
      };
    } catch (error) {
      console.warn('⚠️ Erro ao carregar trilhas públicas:', error.message);

      // Retornar lista vazia em vez de erro
      return {
        success: true,
        data: [],
        count: 0,
        message: 'Não foi possível carregar trilhas no momento',
      };
    }
  }

  async getTrilhaDetalhes(trilhaId) {
    try {
      const response = await this.get(`/api/treks/${trilhaId}`);

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data,
          message: 'Trilha carregada com sucesso',
        };
      } else {
        return {
          success: false,
          data: null,
          message: 'Trilha não encontrada',
        };
      }
    } catch (error) {
      console.error('❌ Erro ao carregar detalhes da trilha:', error);
      return {
        success: false,
        data: null,
        message: 'Erro ao carregar detalhes da trilha',
      };
    }
  }

  async criarTrilha(dadosTrilha) {
    try {
      const response = await this.post('/api/treks', dadosTrilha);

      if (response.success) {
        return {
          success: true,
          data: response.data,
          message: 'Trilha criada com sucesso',
        };
      } else {
        return {
          success: false,
          message: response.message || 'Erro ao criar trilha',
        };
      }
    } catch (error) {
      console.error('❌ Erro ao criar trilha:', error);
      return {
        success: false,
        message: 'Erro ao criar trilha',
      };
    }
  }

  async salvarPontoTrilha(trilhaId, ponto) {
    try {
      const response = await this.post(`/api/treks/${trilhaId}/points`, ponto);

      if (response.success) {
        return {
          success: true,
          data: response.data,
          message: 'Ponto salvo com sucesso',
        };
      } else {
        return {
          success: false,
          message: response.message || 'Erro ao salvar ponto',
        };
      }
    } catch (error) {
      console.error('❌ Erro ao salvar ponto da trilha:', error);
      return {
        success: false,
        message: 'Erro ao salvar ponto da trilha',
      };
    }
  }

  async atualizarTrilha(trilhaId, dadosAtualizacao) {
    try {
      const response = await this.put(
        `/api/treks/${trilhaId}`,
        dadosAtualizacao
      );

      if (response.success) {
        return {
          success: true,
          data: response.data,
          message: 'Trilha atualizada com sucesso',
        };
      } else {
        return {
          success: false,
          message: response.message || 'Erro ao atualizar trilha',
        };
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar trilha:', error);
      return {
        success: false,
        message: 'Erro ao atualizar trilha',
      };
    }
  }

  async deletarTrilha(trilhaId) {
    try {
      const response = await this.delete(`/api/treks/${trilhaId}`);

      if (response.success) {
        return {
          success: true,
          message: 'Trilha excluída com sucesso',
        };
      } else {
        return {
          success: false,
          message: response.message || 'Erro ao excluir trilha',
        };
      }
    } catch (error) {
      console.error('❌ Erro ao excluir trilha:', error);
      return {
        success: false,
        message: 'Erro ao excluir trilha',
      };
    }
  }

  async getMinhasTrilhas() {
    try {
      const response = await this.get('/api/treks/mine');

      return {
        success: true,
        data: response.data || [],
        count: response.count || 0,
        message:
          response.message ||
          (response.data?.length > 0
            ? `${response.data.length} trilhas suas encontradas`
            : 'Você ainda não criou nenhuma trilha'),
      };
    } catch (error) {
      console.warn('⚠️ Erro ao carregar minhas trilhas:', error.message);

      return {
        success: true,
        data: [],
        count: 0,
        message: 'Não foi possível carregar suas trilhas no momento',
      };
    }
  }

  // Métodos para POIs - COM TRATAMENTO DE LISTAS VAZIAS
  async getPOIsPorArea(latitude, longitude, raio = 10) {
    try {
      const params = new URLSearchParams({
        lat: latitude.toString(),
        lng: longitude.toString(),
        radius: raio.toString(),
      });

      const response = await this.get(`/api/pois/area?${params}`);

      // Tratar resposta vazia como sucesso
      return {
        success: true,
        data: response.data || [],
        count: response.count || 0,
        message:
          response.message ||
          (response.data?.length > 0
            ? `${response.data.length} POIs encontrados`
            : 'Nenhum POI encontrado nesta área'),
      };
    } catch (error) {
      console.warn('⚠️ Erro ao buscar POIs por área:', error.message);

      // Retornar lista vazia em vez de erro
      return {
        success: true,
        data: [],
        count: 0,
        message: 'Não foi possível carregar POIs no momento',
      };
    }
  }

  async criarPOI(dadosPOI) {
    try {
      const response = await this.post('/api/pois', dadosPOI);

      if (response.success) {
        return {
          success: true,
          data: response.data,
          message: 'POI criado com sucesso',
        };
      } else {
        return {
          success: false,
          message: response.message || 'Erro ao criar POI',
        };
      }
    } catch (error) {
      console.error('❌ Erro ao criar POI:', error);
      return {
        success: false,
        message: 'Erro ao criar POI',
      };
    }
  }

  async getPOIDetalhes(poiId) {
    try {
      const response = await this.get(`/api/pois/${poiId}`);

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data,
          message: 'POI carregado com sucesso',
        };
      } else {
        return {
          success: false,
          data: null,
          message: 'POI não encontrado',
        };
      }
    } catch (error) {
      console.error('❌ Erro ao carregar POI:', error);
      return {
        success: false,
        data: null,
        message: 'Erro ao carregar POI',
      };
    }
  }

  async atualizarPOI(poiId, dadosAtualizacao) {
    try {
      const response = await this.put(`/api/pois/${poiId}`, dadosAtualizacao);

      if (response.success) {
        return {
          success: true,
          data: response.data,
          message: 'POI atualizado com sucesso',
        };
      } else {
        return {
          success: false,
          message: response.message || 'Erro ao atualizar POI',
        };
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar POI:', error);
      return {
        success: false,
        message: 'Erro ao atualizar POI',
      };
    }
  }

  async deletarPOI(poiId) {
    try {
      const response = await this.delete(`/api/pois/${poiId}`);

      if (response.success) {
        return {
          success: true,
          message: 'POI excluído com sucesso',
        };
      } else {
        return {
          success: false,
          message: response.message || 'Erro ao excluir POI',
        };
      }
    } catch (error) {
      console.error('❌ Erro ao excluir POI:', error);
      return {
        success: false,
        message: 'Erro ao excluir POI',
      };
    }
  }

  // Métodos para favoritos - COM TRATAMENTO DE LISTAS VAZIAS
  async getFavoritos() {
    try {
      const response = await this.get('/api/favorites');

      // Tratar resposta vazia como sucesso
      return {
        success: true,
        data: response.data || [],
        count: response.count || 0,
        message:
          response.message ||
          (response.data?.length > 0
            ? `${response.data.length} favoritos encontrados`
            : 'Nenhum favorito salvo'),
      };
    } catch (error) {
      console.warn('⚠️ Erro ao carregar favoritos:', error.message);

      // Retornar lista vazia em vez de erro
      return {
        success: true,
        data: [],
        count: 0,
        message: 'Não foi possível carregar favoritos no momento',
      };
    }
  }

  async adicionarFavorito(trilhaId) {
    try {
      const response = await this.post('/api/favorites', { trekId: trilhaId });

      if (response.success) {
        return {
          success: true,
          data: response.data,
          message: 'Trilha adicionada aos favoritos',
        };
      } else {
        return {
          success: false,
          message: response.message || 'Erro ao adicionar favorito',
        };
      }
    } catch (error) {
      console.error('❌ Erro ao adicionar favorito:', error);
      return {
        success: false,
        message: 'Erro ao adicionar favorito',
      };
    }
  }

  async removerFavorito(favoritoId) {
    try {
      const response = await this.delete(`/api/favorites/${favoritoId}`);

      if (response.success) {
        return {
          success: true,
          message: 'Favorito removido com sucesso',
        };
      } else {
        return {
          success: false,
          message: response.message || 'Erro ao remover favorito',
        };
      }
    } catch (error) {
      console.error('❌ Erro ao remover favorito:', error);
      return {
        success: false,
        message: 'Erro ao remover favorito',
      };
    }
  }

  async verificarFavorito(trilhaId) {
    try {
      const response = await this.get(`/api/favorites/check/${trilhaId}`);

      return {
        success: true,
        isFavorite: response.isFavorite || false,
        favoriteId: response.favoriteId || null,
      };
    } catch (error) {
      console.warn('⚠️ Erro ao verificar favorito:', error.message);
      return {
        success: false,
        isFavorite: false,
        favoriteId: null,
      };
    }
  }

  // Métodos para usuário
  async getDadosUsuario() {
    try {
      const response = await this.get('/api/users/me');

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data,
          message: 'Dados do usuário carregados',
        };
      } else {
        return {
          success: false,
          data: null,
          message: 'Erro ao carregar dados do usuário',
        };
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados do usuário:', error);
      return {
        success: false,
        data: null,
        message: 'Erro ao carregar dados do usuário',
      };
    }
  }

  async atualizarUsuario(dadosUsuario) {
    try {
      const response = await this.put('/api/users/me', dadosUsuario);

      if (response.success) {
        return {
          success: true,
          data: response.data,
          message: 'Perfil atualizado com sucesso',
        };
      } else {
        return {
          success: false,
          message: response.message || 'Erro ao atualizar perfil',
        };
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar usuário:', error);
      return {
        success: false,
        message: 'Erro ao atualizar perfil',
      };
    }
  }

  async alterarSenha(senhaAtual, novaSenha) {
    try {
      const response = await this.put('/api/users/password', {
        currentPassword: senhaAtual,
        newPassword: novaSenha,
      });

      if (response.success) {
        return {
          success: true,
          message: 'Senha alterada com sucesso',
        };
      } else {
        return {
          success: false,
          message: response.message || 'Erro ao alterar senha',
        };
      }
    } catch (error) {
      console.error('❌ Erro ao alterar senha:', error);
      return {
        success: false,
        message: 'Erro ao alterar senha',
      };
    }
  }

  async excluirConta() {
    try {
      const response = await this.delete('/api/users/me');

      if (response.success) {
        return {
          success: true,
          message: 'Conta excluída com sucesso',
        };
      } else {
        return {
          success: false,
          message: response.message || 'Erro ao excluir conta',
        };
      }
    } catch (error) {
      console.error('❌ Erro ao excluir conta:', error);
      return {
        success: false,
        message: 'Erro ao excluir conta',
      };
    }
  }

  // Health check e utilitários
  async healthCheck() {
    try {
      const response = await this.get('/api/health');

      return {
        success: true,
        data: response,
        message: 'API funcionando normalmente',
      };
    } catch (error) {
      console.error('❌ Erro no health check:', error);
      return {
        success: false,
        message: 'API indisponível no momento',
      };
    }
  }

  async testarConexao() {
    try {
      const startTime = Date.now();
      await this.healthCheck();
      const endTime = Date.now();
      const latency = endTime - startTime;

      return {
        success: true,
        latency,
        message: `Conexão OK (${latency}ms)`,
      };
    } catch (error) {
      return {
        success: false,
        latency: null,
        message: 'Falha na conexão',
      };
    }
  }

  // Método para upload de arquivos (se necessário)
  async uploadFile(endpoint, file, additionalData = {}) {
    try {
      const token = await this.getAuthToken();

      const formData = new FormData();
      formData.append('file', file);

      // Adicionar dados extras
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });

      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        return {
          success: true,
          data: result.data,
          message: 'Arquivo enviado com sucesso',
        };
      } else {
        return {
          success: false,
          message: result.message || 'Erro ao enviar arquivo',
        };
      }
    } catch (error) {
      console.error('❌ Erro no upload:', error);
      return {
        success: false,
        message: 'Erro ao enviar arquivo',
      };
    }
  }
}

export default new ApiService();
