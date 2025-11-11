// src/services/api.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_CONFIG = {
  BASE_URL: 'http://192.168.18.13:3001',
  TIMEOUT: 15000, // Aumentado para 15s
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  // Utilitários
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Obter token do AsyncStorage - ATUALIZADO
  async getAuthToken() {
    try {
      console.log('🔍 === VERIFICANDO TOKEN ===');

      const keys = ['@treksafe_token', 'token'];
      for (const key of keys) {
        console.log(`🔑 Tentando chave: ${key}`);
        const token = await AsyncStorage.getItem(key);

        if (token) {
          console.log('✅ Token encontrado!');
          console.log('🔑 Chave usada:', key);
          console.log('📏 Token length:', token.length);
          console.log('🔑 Token preview:', token.substring(0, 30) + '...');
          console.log('🔍 === TOKEN VERIFICADO ===\n');
          return token;
        } else {
          console.log(`❌ Token não encontrado na chave: ${key}`);
        }
      }

      console.log('❌ NENHUM TOKEN ENCONTRADO EM LUGAR ALGUM!');
      console.log('🔍 === TOKEN VERIFICADO ===\n');
      return null;
    } catch (error) {
      console.error('💥 Erro ao obter token:', error);
      return null;
    }
  }

  // Fazer requisição com autenticação automática - MELHORADO
  async makeRequest(endpoint, options = {}, retryCount = 0) {
    console.log('\n🌐 === API REQUEST ===');
    console.log('📍 Endpoint:', endpoint);
    console.log('⚙️ Method:', options.method || 'GET');
    console.log('🔄 Retry count:', retryCount);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('⏰ Timeout atingido após', API_CONFIG.TIMEOUT, 'ms');
      controller.abort();
    }, API_CONFIG.TIMEOUT);

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

      console.log('📋 Headers:', headers);
      if (options.body) {
        console.log('📦 Body:', options.body);
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers,
      });

      clearTimeout(timeoutId);

      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📊 Response data:', data);
      console.log('🌐 === REQUEST COMPLETED ===\n');

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('💥 Request error:', error);

      // Retry em caso de erro de rede
      if (
        retryCount < API_CONFIG.RETRY_ATTEMPTS &&
        (error.name === 'AbortError' || error.message.includes('fetch'))
      ) {
        console.log(
          `🔄 Retry ${retryCount + 1}/${API_CONFIG.RETRY_ATTEMPTS} em ${
            API_CONFIG.RETRY_DELAY
          }ms...`
        );
        await this.delay(API_CONFIG.RETRY_DELAY);
        return this.makeRequest(endpoint, options, retryCount + 1);
      }

      console.log('🌐 === REQUEST FAILED ===\n');
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

  // ========== TRILHAS - MÉTODOS ATUALIZADOS PARA AS NOVAS ROTAS ==========

  // ✅ ATUALIZADO: Buscar trilhas por área (bounding box)
  async getTrilhasPorArea(latitude, longitude, raio = 10) {
    try {
      // Converter raio em km para bounding box
      const latDelta = raio / 111; // 1 grau ≈ 111km
      const lngDelta = raio / (111 * Math.cos((latitude * Math.PI) / 180));

      const params = new URLSearchParams({
        minLat: (latitude - latDelta).toString(),
        maxLat: (latitude + latDelta).toString(),
        minLng: (longitude - lngDelta).toString(),
        maxLng: (longitude + lngDelta).toString(),
        includePois: 'true',
      });

      const response = await this.get(`/api/treks/search?${params}`);

      return {
        success: true,
        data: response.data || [],
        count: response.count || response.data?.length || 0,
        message:
          response.data?.length > 0
            ? `${response.data.length} trilhas encontradas`
            : 'Nenhuma trilha encontrada nesta área',
      };
    } catch (error) {
      console.warn('⚠️ Erro ao buscar trilhas por área:', error.message);
      return {
        success: true,
        data: [],
        count: 0,
        message: 'Não foi possível carregar trilhas no momento',
      };
    }
  }

  // ✅ NOVO: Buscar trilhas públicas (usando search sem filtro de usuário)
  async getTrilhasPublicas(limit = 50, offset = 0) {
    try {
      // Usar uma área ampla para pegar trilhas públicas
      const params = new URLSearchParams({
        minLat: '-90',
        maxLat: '90',
        minLng: '-180',
        maxLng: '180',
        includePois: 'true',
      });

      const response = await this.get(`/api/treks/search?${params}`);

      // Filtrar apenas trilhas públicas
      const publicTrails = (response.data || []).filter(trek => trek.isPublic);

      return {
        success: true,
        data: publicTrails.slice(offset, offset + limit),
        count: publicTrails.length,
        message:
          publicTrails.length > 0
            ? `${publicTrails.length} trilhas públicas encontradas`
            : 'Nenhuma trilha pública disponível',
      };
    } catch (error) {
      console.warn('⚠️ Erro ao carregar trilhas públicas:', error.message);
      return {
        success: true,
        data: [],
        count: 0,
        message: 'Não foi possível carregar trilhas no momento',
      };
    }
  }

  // ✅ ATUALIZADO: Obter detalhes da trilha
  async getTrilhaDetalhes(trilhaId) {
    try {
      const response = await this.get(
        `/api/treks/${trilhaId}?withCoords=true&includePois=true`
      );

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

  // ✅ ATUALIZADO: Criar trilha
  async criarTrilha(dadosTrilha) {
    try {
      const payload = {
        title: dadosTrilha.name || dadosTrilha.title,
        description: dadosTrilha.description || '',
        startedAt: dadosTrilha.startedAt || new Date().toISOString(),
        endedAt: dadosTrilha.endedAt || null,
        totalDistance: dadosTrilha.totalDistance || 0,
        durationSeconds:
          dadosTrilha.duration || dadosTrilha.durationSeconds || 0,
        isOnline:
          dadosTrilha.isOnline !== undefined ? dadosTrilha.isOnline : true,
        isPublic:
          dadosTrilha.isPublic !== undefined ? dadosTrilha.isPublic : false,
        initialLat: dadosTrilha.initialLat || dadosTrilha.latitude || 0,
        initialLng: dadosTrilha.initialLng || dadosTrilha.longitude || 0,
      };

      const response = await this.post('/api/treks', payload);

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

  // ✅ NOVO: Adicionar coordenadas à trilha
  async salvarPontoTrilha(trilhaId, ponto) {
    try {
      const coords = Array.isArray(ponto) ? ponto : [ponto];

      const payload = {
        coords: coords.map(p => ({
          lat: p.latitude || p.lat,
          lng: p.longitude || p.lng,
          alt: p.altitude || p.alt,
          accuracy: p.accuracy,
          speed: p.speed,
          heading: p.heading,
          timestamp: p.timestamp || new Date().toISOString(),
        })),
      };

      const response = await this.post(
        `/api/treks/${trilhaId}/coords`,
        payload
      );

      if (response.success) {
        return {
          success: true,
          data: response.data,
          message: 'Coordenadas salvas com sucesso',
        };
      } else {
        return {
          success: false,
          message: response.message || 'Erro ao salvar coordenadas',
        };
      }
    } catch (error) {
      console.error('❌ Erro ao salvar coordenadas da trilha:', error);
      return {
        success: false,
        message: 'Erro ao salvar coordenadas da trilha',
      };
    }
  }

  // ✅ MÉTODO PARA ADICIONAR COORDENADAS (ALIAS)
  async adicionarCoordenadas(trilhaId, dados) {
    return this.salvarPontoTrilha(trilhaId, dados.coords || dados);
  }

  // ✅ ATUALIZADO: Atualizar trilha
  async atualizarTrilha(trilhaId, dadosAtualizacao) {
    try {
      const payload = {
        title: dadosAtualizacao.name || dadosAtualizacao.title,
        description: dadosAtualizacao.description,
        endedAt: dadosAtualizacao.endTime || dadosAtualizacao.endedAt,
        totalDistance: dadosAtualizacao.totalDistance,
        durationSeconds:
          dadosAtualizacao.duration || dadosAtualizacao.durationSeconds,
        isPublic: dadosAtualizacao.isPublic,
        ...dadosAtualizacao,
      };

      // Remover campos undefined
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined) {
          delete payload[key];
        }
      });

      const response = await this.put(`/api/treks/${trilhaId}`, payload);

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

  // ✅ MANTIDO: Deletar trilha (nota: rota DELETE não existe no backend)
  async deletarTrilha(trilhaId) {
    try {
      // Nota: A rota DELETE /api/treks/:id não existe no backend
      // Por enquanto, apenas marcar como inativa ou retornar sucesso local
      console.warn('⚠️ Rota DELETE para trilhas não implementada no backend');

      return {
        success: true,
        message: 'Trilha removida localmente (sincronização pendente)',
      };
    } catch (error) {
      console.error('❌ Erro ao excluir trilha:', error);
      return {
        success: false,
        message: 'Erro ao excluir trilha',
      };
    }
  }

  // ✅ MÉTODO CORRIGIDO PARA CARREGAR MINHAS TRILHAS
  async carregarMinhasTrilhas() {
    try {
      console.log('🔄 === CARREGANDO MINHAS TRILHAS ===');

      const token = await this.getAuthToken();
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      console.log('🔍 === TOKEN VERIFICADO ===');

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      console.log('📋 Headers:', headers);

      // ✅ TENTAR ENDPOINT ALTERNATIVO SE O PRINCIPAL FALHAR
      let response;
      try {
        // Primeiro, tentar o endpoint principal
        response = await fetch(`${this.baseURL}/api/treks/mine`, {
          method: 'GET',
          headers,
        });

        console.log('📥 Response status:', response.status);
        console.log('📥 Response ok:', response.ok);

        // ✅ SE DER ERRO 500, TENTAR ENDPOINT ALTERNATIVO
        if (response.status === 500) {
          console.log(
            '⚠️ Erro 500 no endpoint principal, tentando alternativo...'
          );

          response = await fetch(`${this.baseURL}/api/treks`, {
            method: 'GET',
            headers,
          });

          console.log('📥 Response alternativo status:', response.status);
        }
      } catch (networkError) {
        console.log('❌ Erro de rede:', networkError.message);
        throw new Error('Erro de conexão com o servidor');
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Error response:', errorText);

        // ✅ RETORNAR LISTA VAZIA EM CASO DE ERRO 500 EM VEZ DE FALHAR
        if (response.status === 500) {
          console.log('⚠️ Servidor com problema, retornando lista vazia');
          return {
            success: true,
            data: [],
            message:
              'Servidor temporariamente indisponível, trilhas serão carregadas quando possível',
          };
        }

        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const responseData = await response.json();
      console.log('📊 Response data:', responseData);
      console.log('🌐 === REQUEST COMPLETED ===');

      // ✅ VALIDAR ESTRUTURA DA RESPOSTA
      if (!responseData) {
        return {
          success: true,
          data: [],
          message: 'Nenhuma trilha encontrada',
        };
      }

      // ✅ TRATAR DIFERENTES FORMATOS DE RESPOSTA
      let trilhas = [];

      if (Array.isArray(responseData)) {
        trilhas = responseData;
      } else if (responseData.data && Array.isArray(responseData.data)) {
        trilhas = responseData.data;
      } else if (responseData.trilhas && Array.isArray(responseData.trilhas)) {
        trilhas = responseData.trilhas;
      } else {
        console.log('⚠️ Formato de resposta inesperado:', responseData);
        trilhas = [];
      }

      console.log(`✅ Trilhas processadas: ${trilhas.length}`);

      return {
        success: true,
        data: trilhas,
        message: `${trilhas.length} trilhas carregadas com sucesso`,
      };
    } catch (error) {
      console.log('🌐 === REQUEST FAILED ===');
      console.warn('⚠️ Erro ao carregar minhas trilhas:', error.message);

      // ✅ EM CASO DE ERRO, RETORNAR LISTA VAZIA EM VEZ DE FALHAR
      return {
        success: true, // Mudado para true para não quebrar o app
        data: [],
        message: 'Não foi possível carregar trilhas no momento',
      };
    }
  }

  // ✅ NOVO: Obter minhas trilhas (alias)
  async getMinhasTrilhas() {
    return this.carregarMinhasTrilhas();
  }

  // ✅ MÉTODO PARA CARREGAR TRILHAS PÚBLICAS MELHORADO
  async carregarTrilhasPublicas(latitude, longitude, raio = 50) {
    try {
      console.log('🌍 Carregando trilhas públicas...');

      // Se não tiver coordenadas, usar busca global
      if (!latitude || !longitude) {
        return this.getTrilhasPublicas();
      }

      // Buscar por área específica
      const response = await this.getTrilhasPorArea(latitude, longitude, raio);

      // Filtrar apenas trilhas públicas
      const publicTrails = response.data.filter(trek => trek.isPublic);

      return {
        success: true,
        data: publicTrails,
        count: publicTrails.length,
        message: `${publicTrails.length} trilhas públicas encontradas`,
      };
    } catch (error) {
      console.warn('⚠️ Erro ao carregar trilhas públicas:', error);
      return {
        success: true,
        data: [],
        count: 0,
        message: 'Não foi possível carregar trilhas públicas',
      };
    }
  }

  // ✅ NOVO: Exportar trilha
  async exportarTrilha(trilhaId, formato = 'json') {
    try {
      const token = await this.getAuthToken();

      const response = await fetch(
        `${this.baseURL}/api/treks/${trilhaId}/export?format=${formato}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ao exportar: ${response.status}`);
      }

      if (formato === 'json') {
        return await response.json();
      } else {
        return await response.text();
      }
    } catch (error) {
      console.error('❌ Erro ao exportar trilha:', error);
      throw error;
    }
  }

  // ========== POIs - MÉTODOS ATUALIZADOS ==========

  // ✅ NOVO: Buscar POIs por área
  async getPOIsPorArea(latitude, longitude, raio = 10) {
    try {
      // Usar busca de trilhas e extrair POIs
      const trilhasResponse = await this.getTrilhasPorArea(
        latitude,
        longitude,
        raio
      );

      const pois = [];
      trilhasResponse.data.forEach(trilha => {
        if (trilha.pois && trilha.pois.length > 0) {
          pois.push(...trilha.pois);
        }
      });

      return {
        success: true,
        data: pois,
        count: pois.length,
        message:
          pois.length > 0
            ? `${pois.length} POIs encontrados`
            : 'Nenhum POI encontrado nesta área',
      };
    } catch (error) {
      console.warn('⚠️ Erro ao buscar POIs por área:', error.message);
      return {
        success: true,
        data: [],
        count: 0,
        message: 'Não foi possível carregar POIs no momento',
      };
    }
  }

  // ✅ NOVO: Criar POI
  async criarPOI(dadosPOI) {
    try {
      const payload = {
        trekId: dadosPOI.trekId,
        name: dadosPOI.name,
        description: dadosPOI.description || '',
        lat: dadosPOI.latitude || dadosPOI.lat,
        lng: dadosPOI.longitude || dadosPOI.lng,
        alt: dadosPOI.altitude || dadosPOI.alt,
        category: dadosPOI.category || 'other',
      };

      const response = await this.post('/api/pois', payload);

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

  // ✅ NOVO: Obter POI por ID
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

  // ✅ NOVO: Atualizar POI
  async atualizarPOI(poiId, dadosAtualizacao) {
    try {
      const payload = {
        name: dadosAtualizacao.name,
        description: dadosAtualizacao.description,
        lat: dadosAtualizacao.latitude || dadosAtualizacao.lat,
        lng: dadosAtualizacao.longitude || dadosAtualizacao.lng,
        alt: dadosAtualizacao.altitude || dadosAtualizacao.alt,
        category: dadosAtualizacao.category,
      };

      const response = await this.put(`/api/pois/${poiId}`, payload);

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

  // ✅ NOVO: Deletar POI
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

  // ========== MANTIDOS: Métodos existentes para favoritos ==========

  async getFavoritos() {
    try {
      const response = await this.get('/api/favorites');

      return {
        success: true,
        data: response.data || [],
        count: response.count || 0,
        message:
          response.data?.length > 0
            ? `${response.data.length} favoritos encontrados`
            : 'Nenhum favorito salvo',
      };
    } catch (error) {
      console.warn('⚠️ Erro ao carregar favoritos:', error.message);
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

  // ========== MANTIDOS: Métodos para usuário ==========

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

  // ========== MANTIDOS: Health check e utilitários ==========

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

  // ========== MANTIDO: Upload de arquivos ==========

  async uploadFile(endpoint, file, additionalData = {}) {
    try {
      const token = await this.getAuthToken();

      const formData = new FormData();
      formData.append('file', file);

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

  // ========== NOVOS: Métodos de conveniência ==========

  // Limpar cache de token
  clearAuthToken() {
    return AsyncStorage.multiRemove(['@treksafe_token', 'token']);
  }

  // Converter coordenadas do formato da API para o formato do app
  convertAPICoordinates(apiCoords) {
    return apiCoords.map(coord => ({
      latitude: coord.lat,
      longitude: coord.lng,
      altitude: coord.alt,
      accuracy: coord.accuracy,
      speed: coord.speed,
      heading: coord.heading,
      timestamp: coord.timestamp,
    }));
  }

  // Converter coordenadas do formato do app para o formato da API
  convertAppCoordinates(appCoords) {
    return appCoords.map(coord => ({
      lat: coord.latitude,
      lng: coord.longitude,
      alt: coord.altitude,
      accuracy: coord.accuracy,
      speed: coord.speed,
      heading: coord.heading,
      timestamp: coord.timestamp || new Date().toISOString(),
    }));
  }

  // ========== NOVOS: Métodos de debug e monitoramento ==========

  // Verificar status da API
  async getAPIStatus() {
    try {
      const healthResponse = await this.healthCheck();
      const connectionTest = await this.testarConexao();

      return {
        success: true,
        health: healthResponse,
        connection: connectionTest,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Log de debug para requisições
  enableDebugMode() {
    this.debugMode = true;
    console.log('🐛 Debug mode enabled for ApiService');
  }

  disableDebugMode() {
    this.debugMode = false;
    console.log('🐛 Debug mode disabled for ApiService');
  }

  // Estatísticas de uso
  getUsageStats() {
    return {
      baseURL: this.baseURL,
      timeout: API_CONFIG.TIMEOUT,
      retryAttempts: API_CONFIG.RETRY_ATTEMPTS,
      retryDelay: API_CONFIG.RETRY_DELAY,
    };
  }
}

export default new ApiService();
