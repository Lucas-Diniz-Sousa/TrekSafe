// src/services/trailService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_CONFIG = {
  BASE_URL: 'http://192.168.18.13:3001',
  TIMEOUT: 15000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

class TrailService {
  constructor() {
    this.authToken = null;
    this.tokenPromise = null; // Para evitar múltiplas chamadas simultâneas
    this.offlineQueue = []; // Fila para operações offline
  }

  // ========== UTILITÁRIOS ==========

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ========== GERENCIAMENTO DE TOKEN ==========

  // Versão melhorada do getAuthToken
  async getAuthToken() {
    // Se já tem token em memória, retorna
    if (this.authToken) return this.authToken;

    // Se já está buscando o token, aguarda a promessa existente
    if (this.tokenPromise) return this.tokenPromise;

    // Cria nova promessa para buscar o token
    this.tokenPromise = this._fetchTokenFromStorage();

    try {
      const token = await this.tokenPromise;
      this.authToken = token;
      return token;
    } finally {
      this.tokenPromise = null;
    }
  }

  async _fetchTokenFromStorage() {
    try {
      console.log('🔍 Buscando token no AsyncStorage...');

      // Tentar múltiplas chaves como no ApiService
      const keys = ['@treksafe_token', 'token'];

      for (const key of keys) {
        const token = await AsyncStorage.getItem(key);
        if (token) {
          console.log(`✅ Token encontrado na chave: ${key}`);
          return token;
        }
      }

      console.log('❌ Nenhum token encontrado');
      return null;
    } catch (error) {
      console.error('💥 Erro ao buscar token:', error);
      return null;
    }
  }

  // Método para atualizar token
  setAuthToken(token) {
    this.authToken = token;
    if (token) {
      AsyncStorage.setItem('@treksafe_token', token);
    }
  }

  // Limpar token melhorado
  async clearAuthToken() {
    this.authToken = null;
    this.tokenPromise = null;

    try {
      await AsyncStorage.multiRemove(['@treksafe_token', 'token']);
      console.log('🗑️ Tokens removidos do storage');
    } catch (error) {
      console.error('💥 Erro ao limpar tokens:', error);
    }
  }

  // ========== REQUISIÇÕES HTTP ==========

  // Requisição HTTP com autenticação e tratamento melhorado
  async makeRequest(url, options = {}, retryCount = 0) {
    console.log('\n🌐 === TRAIL SERVICE REQUEST ===');
    console.log('📍 URL:', url);
    console.log('⚙️ Method:', options.method || 'GET');
    console.log('🔄 Retry count:', retryCount);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('⏰ Timeout atingido após', API_CONFIG.TIMEOUT, 'ms');
      controller.abort();
    }, API_CONFIG.TIMEOUT);

    try {
      const token = await this.getAuthToken();

      const fetchOptions = {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      };

      console.log('📋 Headers:', fetchOptions.headers);
      if (options.body) {
        console.log('📦 Body:', options.body);
      }

      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);

      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);

      // Tratamento específico para diferentes status
      if (response.status === 401) {
        console.log('🔐 Token expirado - limpando cache');
        await this.clearAuthToken();
        throw new Error('TOKEN_EXPIRED');
      }

      if (response.status === 403) {
        throw new Error('FORBIDDEN');
      }

      if (response.status >= 500) {
        throw new Error('SERVER_ERROR');
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Error response:', errorText);

        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }

        throw new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log('📊 Response data:', data);
      console.log('🌐 === REQUEST COMPLETED ===\n');

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('💥 Request error:', error);

      // Retry apenas para erros específicos
      const retryableErrors = [
        'AbortError',
        'fetch',
        'NetworkError',
        'SERVER_ERROR',
      ];

      const shouldRetry =
        retryCount < API_CONFIG.RETRY_ATTEMPTS &&
        retryableErrors.some(
          err => error.name === err || error.message.includes(err)
        );

      if (shouldRetry) {
        console.log(
          `🔄 Retry ${retryCount + 1}/${API_CONFIG.RETRY_ATTEMPTS} em ${
            API_CONFIG.RETRY_DELAY * (retryCount + 1)
          }ms...`
        );
        await this.delay(API_CONFIG.RETRY_DELAY * (retryCount + 1)); // Backoff exponencial
        return this.makeRequest(url, options, retryCount + 1);
      }

      console.log('🌐 === REQUEST FAILED ===\n');
      throw error;
    }
  }

  // ========== CACHE OFFLINE ==========

  // Adicionar à fila offline
  async addToOfflineQueue(operation) {
    try {
      const queue = await AsyncStorage.getItem('@treksafe_offline_queue');
      const currentQueue = queue ? JSON.parse(queue) : [];

      const newOperation = {
        id: Date.now() + Math.random(),
        timestamp: new Date().toISOString(),
        ...operation,
      };

      currentQueue.push(newOperation);
      await AsyncStorage.setItem(
        '@treksafe_offline_queue',
        JSON.stringify(currentQueue)
      );

      console.log('📱 Operação adicionada à fila offline:', newOperation);
      return newOperation.id;
    } catch (error) {
      console.error('💥 Erro ao adicionar à fila offline:', error);
      return null;
    }
  }

  // Processar fila offline
  async processOfflineQueue() {
    try {
      const queue = await AsyncStorage.getItem('@treksafe_offline_queue');
      if (!queue) return { processed: 0, remaining: 0 };

      const operations = JSON.parse(queue);
      console.log(`📱 Processando ${operations.length} operações offline`);

      const successfulOperations = [];

      for (const operation of operations) {
        try {
          switch (operation.type) {
            case 'CREATE_TRAIL':
              await this._createTrailOnline(operation.data);
              break;
            case 'ADD_COORDINATES':
              await this._addCoordinatesToTrailOnline(
                operation.trekId,
                operation.coordinates
              );
              break;
            case 'CREATE_POI':
              await this._createPOIOnline(operation.data);
              break;
            case 'UPDATE_TRAIL':
              await this._updateTrailOnline(operation.trekId, operation.data);
              break;
          }

          successfulOperations.push(operation.id);
          console.log(`✅ Operação offline processada: ${operation.type}`);
        } catch (error) {
          console.error(
            `💥 Erro ao processar operação offline ${operation.type}:`,
            error
          );
        }
      }

      // Remover operações processadas com sucesso
      const remainingOperations = operations.filter(
        op => !successfulOperations.includes(op.id)
      );

      await AsyncStorage.setItem(
        '@treksafe_offline_queue',
        JSON.stringify(remainingOperations)
      );

      console.log(
        `📱 ${successfulOperations.length} operações processadas, ${remainingOperations.length} restantes`
      );

      return {
        processed: successfulOperations.length,
        remaining: remainingOperations.length,
      };
    } catch (error) {
      console.error('💥 Erro ao processar fila offline:', error);
      return { processed: 0, remaining: 0 };
    }
  }

  // Obter status da fila offline
  async getOfflineQueueStatus() {
    try {
      const queue = await AsyncStorage.getItem('@treksafe_offline_queue');
      const operations = queue ? JSON.parse(queue) : [];

      return {
        count: operations.length,
        operations: operations.map(op => ({
          id: op.id,
          type: op.type,
          timestamp: op.timestamp,
        })),
      };
    } catch (error) {
      console.error('💥 Erro ao obter status da fila offline:', error);
      return { count: 0, operations: [] };
    }
  }

  // ========== VALIDAÇÕES ==========

  _validateCoordinate(coordinate) {
    if (!coordinate || typeof coordinate !== 'object') {
      throw new Error('Coordenada deve ser um objeto válido');
    }

    if (!coordinate.latitude || !coordinate.longitude) {
      throw new Error('Coordenada deve ter latitude e longitude');
    }

    if (
      typeof coordinate.latitude !== 'number' ||
      typeof coordinate.longitude !== 'number'
    ) {
      throw new Error('Latitude e longitude devem ser números');
    }

    if (Math.abs(coordinate.latitude) > 90) {
      throw new Error('Latitude deve estar entre -90 e 90 graus');
    }

    if (Math.abs(coordinate.longitude) > 180) {
      throw new Error('Longitude deve estar entre -180 e 180 graus');
    }
  }

  _validateTrekId(trekId) {
    if (!trekId || typeof trekId !== 'string') {
      throw new Error('ID da trilha é obrigatório e deve ser uma string');
    }
  }

  _validatePOIData(poiData) {
    if (!poiData || typeof poiData !== 'object') {
      throw new Error('Dados do POI devem ser um objeto válido');
    }

    if (!poiData.trekId) {
      throw new Error('ID da trilha é obrigatório para criar POI');
    }

    if (
      !poiData.name ||
      typeof poiData.name !== 'string' ||
      poiData.name.trim().length === 0
    ) {
      throw new Error(
        'Nome do POI é obrigatório e deve ser uma string não vazia'
      );
    }

    if (!poiData.latitude || !poiData.longitude) {
      throw new Error('Coordenadas do POI são obrigatórias');
    }

    this._validateCoordinate({
      latitude: poiData.latitude || poiData.lat,
      longitude: poiData.longitude || poiData.lng,
    });
  }

  // ========== TRILHAS (TREKS) ==========

  // Método interno para criar trilha online
  async _createTrailOnline(trailData) {
    const url = `${API_CONFIG.BASE_URL}/api/treks`;
    const options = {
      method: 'POST',
      body: JSON.stringify({
        title: trailData.name || trailData.title,
        description: trailData.description || '',
        startedAt: trailData.startedAt || new Date().toISOString(),
        endedAt: trailData.endedAt || null,
        totalDistance: trailData.totalDistance || 0,
        durationSeconds: trailData.duration || trailData.durationSeconds || 0,
        isOnline: trailData.isOnline !== undefined ? trailData.isOnline : true,
        isPublic: trailData.isPublic !== undefined ? trailData.isPublic : false,
        initialLat: trailData.initialLat || trailData.latitude || 0,
        initialLng: trailData.initialLng || trailData.longitude || 0,
      }),
    };

    const response = await this.makeRequest(url, options);
    return response.data;
  }

  // Criar uma nova trilha com fallback offline
  async createTrail(trailData) {
    try {
      console.log('🆕 Criando nova trilha:', trailData);
      return await this._createTrailOnline(trailData);
    } catch (error) {
      console.warn(
        '⚠️ Erro ao criar trilha online, adicionando à fila offline'
      );

      const operationId = await this.addToOfflineQueue({
        type: 'CREATE_TRAIL',
        data: trailData,
      });

      // Retornar ID local para continuar funcionamento
      return {
        _id: `local_${Date.now()}`,
        ...trailData,
        isOffline: true,
        operationId,
      };
    }
  }

  // Método interno para adicionar coordenadas online
  async _addCoordinatesToTrailOnline(trekId, coordinates) {
    const coords = coordinates.map(coord => ({
      lat: coord.latitude,
      lng: coord.longitude,
      alt: coord.altitude,
      accuracy: coord.accuracy,
      speed: coord.speed,
      heading: coord.heading,
      timestamp: coord.timestamp || new Date().toISOString(),
    }));

    const url = `${API_CONFIG.BASE_URL}/api/treks/${trekId}/coords`;
    const options = {
      method: 'POST',
      body: JSON.stringify({ coords }),
    };

    const response = await this.makeRequest(url, options);
    return response.data;
  }

  // Adicionar coordenada a uma trilha
  async addCoordinateToTrail(trekId, coordinate) {
    this._validateTrekId(trekId);
    this._validateCoordinate(coordinate);

    console.log('📍 Adicionando coordenada à trilha:', trekId, coordinate);

    // Se é trilha local, apenas adicionar à fila offline
    if (trekId.startsWith('local_')) {
      await this.addToOfflineQueue({
        type: 'ADD_COORDINATES',
        trekId,
        coordinates: [coordinate],
      });
      return { success: true, offline: true };
    }

    try {
      return await this._addCoordinatesToTrailOnline(trekId, [coordinate]);
    } catch (error) {
      console.warn(
        '⚠️ Erro ao adicionar coordenada online, adicionando à fila offline'
      );

      await this.addToOfflineQueue({
        type: 'ADD_COORDINATES',
        trekId,
        coordinates: [coordinate],
      });

      return { success: true, offline: true };
    }
  }

  // Adicionar múltiplas coordenadas a uma trilha
  async addCoordinatesToTrail(trekId, coordinates) {
    this._validateTrekId(trekId);

    if (!Array.isArray(coordinates) || coordinates.length === 0) {
      throw new Error('Coordenadas devem ser um array não vazio');
    }

    // Validar todas as coordenadas
    coordinates.forEach((coord, index) => {
      try {
        this._validateCoordinate(coord);
      } catch (error) {
        throw new Error(`Coordenada ${index + 1} inválida: ${error.message}`);
      }
    });

    console.log(
      '📍 Adicionando múltiplas coordenadas à trilha:',
      trekId,
      coordinates.length
    );

    // Se é trilha local, apenas adicionar à fila offline
    if (trekId.startsWith('local_')) {
      await this.addToOfflineQueue({
        type: 'ADD_COORDINATES',
        trekId,
        coordinates,
      });
      return { success: true, offline: true };
    }

    try {
      return await this._addCoordinatesToTrailOnline(trekId, coordinates);
    } catch (error) {
      console.warn(
        '⚠️ Erro ao adicionar coordenadas online, adicionando à fila offline'
      );

      await this.addToOfflineQueue({
        type: 'ADD_COORDINATES',
        trekId,
        coordinates,
      });

      return { success: true, offline: true };
    }
  }

  // Adicionar coordenadas em lotes para melhor performance
  async addCoordinatesToTrailBatch(trekId, coordinates, batchSize = 50) {
    this._validateTrekId(trekId);

    if (!Array.isArray(coordinates) || coordinates.length === 0) {
      throw new Error('Coordenadas devem ser um array não vazio');
    }

    console.log(
      `📍 Adicionando ${coordinates.length} coordenadas em lotes de ${batchSize} à trilha:`,
      trekId
    );

    const results = [];

    for (let i = 0; i < coordinates.length; i += batchSize) {
      const batch = coordinates.slice(i, i + batchSize);

      try {
        console.log(
          `📦 Enviando lote ${Math.floor(i / batchSize) + 1}/${Math.ceil(
            coordinates.length / batchSize
          )}`
        );

        const result = await this.addCoordinatesToTrail(trekId, batch);
        results.push(result);

        // Pequeno delay entre lotes para não sobrecarregar o servidor
        if (i + batchSize < coordinates.length) {
          await this.delay(100);
        }
      } catch (error) {
        console.error(
          `💥 Erro no lote ${Math.floor(i / batchSize) + 1}:`,
          error
        );

        // Tentar enviar coordenadas individualmente em caso de erro
        for (const coord of batch) {
          try {
            await this.addCoordinateToTrail(trekId, coord);
            await this.delay(50);
          } catch (individualError) {
            console.error(
              '💥 Erro ao enviar coordenada individual:',
              individualError
            );
          }
        }
      }
    }

    return results;
  }

  // Buscar trilhas por área (bounding box)
  async searchTrailsByArea(area) {
    console.log('🔍 Buscando trilhas por área:', area);

    const { northEast, southWest } = area;
    const params = new URLSearchParams({
      minLat: southWest.latitude.toString(),
      maxLat: northEast.latitude.toString(),
      minLng: southWest.longitude.toString(),
      maxLng: northEast.longitude.toString(),
      includePois: 'true',
    });

    const url = `${API_CONFIG.BASE_URL}/api/treks/search?${params}`;
    const response = await this.makeRequest(url);

    // Converter formato da API para formato do app
    return (response.data || []).map(trek => ({
      id: trek._id,
      name: trek.title,
      description: trek.description,
      coordinates: [], // Será preenchido se necessário
      distance: trek.totalDistance || 0,
      duration: trek.durationSeconds || 0,
      isPublic: trek.isPublic,
      createdAt: trek.createdAt,
      pois: trek.pois || [],
    }));
  }

  // Obter trilha por ID
  async getTrailById(trekId, options = {}) {
    this._validateTrekId(trekId);

    console.log('🔍 Obtendo trilha por ID:', trekId, options);

    const params = new URLSearchParams();
    if (options.withCoords) params.append('withCoords', 'true');
    if (options.includePois) params.append('includePois', 'true');

    const url = `${API_CONFIG.BASE_URL}/api/treks/${trekId}?${params}`;
    const response = await this.makeRequest(url);

    const trek = response.data.trek;
    const result = {
      id: trek._id,
      name: trek.title,
      description: trek.description,
      distance: trek.totalDistance || 0,
      duration: trek.durationSeconds || 0,
      isPublic: trek.isPublic,
      createdAt: trek.createdAt,
      startedAt: trek.startedAt,
      endedAt: trek.endedAt,
    };

    if (response.data.coords) {
      result.coordinates = response.data.coords.map(coord => ({
        latitude: coord.lat,
        longitude: coord.lng,
        altitude: coord.alt,
        accuracy: coord.accuracy,
        speed: coord.speed,
        heading: coord.heading,
        timestamp: coord.timestamp,
      }));
    }

    if (response.data.pois) {
      result.pois = response.data.pois;
    }

    return result;
  }

  // Método interno para atualizar trilha online
  async _updateTrailOnline(trekId, updateData) {
    const url = `${API_CONFIG.BASE_URL}/api/treks/${trekId}`;
    const options = {
      method: 'PUT',
      body: JSON.stringify({
        title: updateData.name || updateData.title,
        description: updateData.description,
        endedAt: updateData.endTime || updateData.endedAt,
        totalDistance: updateData.totalDistance,
        durationSeconds: updateData.duration || updateData.durationSeconds,
        isPublic: updateData.isPublic,
        ...updateData,
      }),
    };

    const response = await this.makeRequest(url, options);
    return response.data;
  }

  // Atualizar trilha
  async updateTrail(trekId, updateData) {
    this._validateTrekId(trekId);

    console.log('✏️ Atualizando trilha:', trekId, updateData);

    // Se é trilha local, apenas adicionar à fila offline
    if (trekId.startsWith('local_')) {
      await this.addToOfflineQueue({
        type: 'UPDATE_TRAIL',
        trekId,
        data: updateData,
      });
      return { success: true, offline: true };
    }

    try {
      return await this._updateTrailOnline(trekId, updateData);
    } catch (error) {
      console.warn(
        '⚠️ Erro ao atualizar trilha online, adicionando à fila offline'
      );

      await this.addToOfflineQueue({
        type: 'UPDATE_TRAIL',
        trekId,
        data: updateData,
      });

      return { success: true, offline: true };
    }
  }

  // Obter minhas trilhas
  async getMyTrails() {
    console.log('📋 Obtendo minhas trilhas');

    const url = `${API_CONFIG.BASE_URL}/api/treks/mine`;
    const response = await this.makeRequest(url);

    return (response.data || []).map(trek => ({
      id: trek._id,
      name: trek.title,
      description: trek.description,
      distance: trek.totalDistance || 0,
      duration: trek.durationSeconds || 0,
      isPublic: trek.isPublic,
      createdAt: trek.createdAt,
      date: trek.startedAt || trek.createdAt,
      points: [], // Será carregado separadamente se necessário
      visible: true,
      apiId: trek._id,
    }));
  }

  // Exportar trilha
  async exportTrail(trekId, format = 'json') {
    this._validateTrekId(trekId);

    console.log('📤 Exportando trilha:', trekId, format);

    const url = `${API_CONFIG.BASE_URL}/api/treks/${trekId}/export?format=${format}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${await this.getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao exportar: ${response.status}`);
    }

    if (format === 'json') {
      return await response.json();
    } else {
      return await response.text();
    }
  }

  // ========== PONTOS DE INTERESSE (POIs) ==========

  // Método interno para criar POI online
  async _createPOIOnline(poiData) {
    const url = `${API_CONFIG.BASE_URL}/api/pois`;
    const options = {
      method: 'POST',
      body: JSON.stringify({
        trekId: poiData.trekId,
        name: poiData.name,
        description: poiData.description,
        lat: poiData.latitude || poiData.lat,
        lng: poiData.longitude || poiData.lng,
        alt: poiData.altitude || poiData.alt,
      }),
    };

    const response = await this.makeRequest(url, options);
    return response.data;
  }

  // Criar POI
  async createPOI(poiData) {
    this._validatePOIData(poiData);

    console.log('📍 Criando POI:', poiData);

    // Se é trilha local, apenas adicionar à fila offline
    if (poiData.trekId.startsWith('local_')) {
      await this.addToOfflineQueue({
        type: 'CREATE_POI',
        data: poiData,
      });
      return {
        _id: `local_poi_${Date.now()}`,
        ...poiData,
        isOffline: true,
      };
    }

    try {
      return await this._createPOIOnline(poiData);
    } catch (error) {
      console.warn('⚠️ Erro ao criar POI online, adicionando à fila offline');

      await this.addToOfflineQueue({
        type: 'CREATE_POI',
        data: poiData,
      });

      return {
        _id: `local_poi_${Date.now()}`,
        ...poiData,
        isOffline: true,
      };
    }
  }

  // Obter POIs de uma trilha
  async getPOIsByTrek(trekId) {
    this._validateTrekId(trekId);

    console.log('📍 Obtendo POIs da trilha:', trekId);

    const url = `${API_CONFIG.BASE_URL}/api/pois/by-trek/${trekId}`;
    const response = await this.makeRequest(url);

    return response.data || [];
  }

  // Obter POI por ID
  async getPOIById(poiId) {
    if (!poiId) {
      throw new Error('ID do POI é obrigatório');
    }

    console.log('📍 Obtendo POI por ID:', poiId);

    const url = `${API_CONFIG.BASE_URL}/api/pois/${poiId}`;
    const response = await this.makeRequest(url);

    return response.data;
  }

  // Atualizar POI
  async updatePOI(poiId, updateData) {
    if (!poiId) {
      throw new Error('ID do POI é obrigatório');
    }

    if (
      updateData.latitude ||
      updateData.longitude ||
      updateData.lat ||
      updateData.lng
    ) {
      this._validateCoordinate({
        latitude: updateData.latitude || updateData.lat,
        longitude: updateData.longitude || updateData.lng,
      });
    }

    console.log('✏️ Atualizando POI:', poiId, updateData);

    const url = `${API_CONFIG.BASE_URL}/api/pois/${poiId}`;
    const options = {
      method: 'PUT',
      body: JSON.stringify({
        name: updateData.name,
        description: updateData.description,
        lat: updateData.latitude || updateData.lat,
        lng: updateData.longitude || updateData.lng,
        alt: updateData.altitude || updateData.alt,
      }),
    };

    const response = await this.makeRequest(url, options);
    return response.data;
  }

  // Deletar POI
  async deletePOI(poiId) {
    if (!poiId) {
      throw new Error('ID do POI é obrigatório');
    }

    console.log('🗑️ Deletando POI:', poiId);

    const url = `${API_CONFIG.BASE_URL}/api/pois/${poiId}`;
    const options = {
      method: 'DELETE',
    };

    const response = await this.makeRequest(url, options);
    return response;
  }

  // ========== UTILITÁRIOS DE CONVERSÃO ==========

  // Converter coordenadas do formato da API para o formato do app
  convertAPICoordinates(apiCoords) {
    if (!Array.isArray(apiCoords)) {
      throw new Error('Coordenadas da API devem ser um array');
    }

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
    if (!Array.isArray(appCoords)) {
      throw new Error('Coordenadas do app devem ser um array');
    }

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

  // ========== MÉTODOS DE CONVENIÊNCIA ==========

  // Verificar conectividade com a API
  async checkConnectivity() {
    try {
      const url = `${API_CONFIG.BASE_URL}/api/health`;
      const response = await fetch(url, {
        method: 'GET',
        timeout: 5000,
      });

      return response.ok;
    } catch (error) {
      console.warn('⚠️ Sem conectividade com a API:', error.message);
      return false;
    }
  }

  // Sincronizar dados offline
  async syncOfflineData() {
    console.log('🔄 Iniciando sincronização de dados offline...');

    const isConnected = await this.checkConnectivity();
    if (!isConnected) {
      console.log('❌ Sem conectividade - sincronização cancelada');
      return { success: false, message: 'Sem conectividade com o servidor' };
    }

    const result = await this.processOfflineQueue();

    return {
      success: true,
      processed: result.processed,
      remaining: result.remaining,
      message: `${result.processed} operações sincronizadas, ${result.remaining} pendentes`,
    };
  }

  // Obter estatísticas do serviço
  getServiceStats() {
    return {
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      retryAttempts: API_CONFIG.RETRY_ATTEMPTS,
      retryDelay: API_CONFIG.RETRY_DELAY,
      hasToken: !!this.authToken,
    };
  }

  // ========== MÉTODOS DE DEBUG ==========

  // Habilitar modo debug
  enableDebugMode() {
    this.debugMode = true;
    console.log('🐛 Modo debug habilitado para TrailService');
  }

  // Desabilitar modo debug
  disableDebugMode() {
    this.debugMode = false;
    console.log('🐛 Modo debug desabilitado para TrailService');
  }

  // Log detalhado para debug
  _debugLog(message, data = null) {
    if (this.debugMode) {
      console.log(`🐛 [TrailService Debug] ${message}`, data || '');
    }
  }
}

// Exportar instância única
const trailService = new TrailService();
export default trailService;
