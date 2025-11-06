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
  }

  // Utilitários
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Obter token de autenticação
  async getAuthToken() {
    if (this.authToken) return this.authToken;

    try {
      const token = await AsyncStorage.getItem('@treksafe_token');
      this.authToken = token;
      return token;
    } catch (error) {
      console.error('Erro ao obter token:', error);
      return null;
    }
  }

  // Requisição HTTP com autenticação
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
        return this.makeRequest(url, options, retryCount + 1);
      }

      console.log('🌐 === REQUEST FAILED ===\n');
      throw error;
    }
  }

  // ========== TRILHAS (TREKS) ==========

  // Criar uma nova trilha
  async createTrail(trailData) {
    console.log('🆕 Criando nova trilha:', trailData);

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

  // Adicionar coordenada a uma trilha
  async addCoordinateToTrail(trekId, coordinate) {
    console.log('📍 Adicionando coordenada à trilha:', trekId, coordinate);

    const url = `${API_CONFIG.BASE_URL}/api/treks/${trekId}/coords`;
    const options = {
      method: 'POST',
      body: JSON.stringify({
        coords: [
          {
            lat: coordinate.latitude,
            lng: coordinate.longitude,
            alt: coordinate.altitude,
            accuracy: coordinate.accuracy,
            speed: coordinate.speed,
            heading: coordinate.heading,
            timestamp: coordinate.timestamp || new Date().toISOString(),
          },
        ],
      }),
    };

    const response = await this.makeRequest(url, options);
    return response.data;
  }

  // Adicionar múltiplas coordenadas a uma trilha
  async addCoordinatesToTrail(trekId, coordinates) {
    console.log(
      '📍 Adicionando múltiplas coordenadas à trilha:',
      trekId,
      coordinates.length
    );

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

  // Atualizar trilha
  async updateTrail(trekId, updateData) {
    console.log('✏️ Atualizando trilha:', trekId, updateData);

    const url = `${API_CONFIG.BASE_URL}/api/treks/${trekId}`;
    const options = {
      method: 'PUT',
      body: JSON.stringify({
        title: updateData.name || updateData.title,
        description: updateData.description,
        endedAt: updateData.endTime,
        totalDistance: updateData.totalDistance,
        durationSeconds: updateData.duration,
        isPublic: updateData.isPublic,
        ...updateData,
      }),
    };

    const response = await this.makeRequest(url, options);
    return response.data;
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

  // Criar POI
  async createPOI(poiData) {
    console.log('📍 Criando POI:', poiData);

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

  // Obter POIs de uma trilha
  async getPOIsByTrek(trekId) {
    console.log('📍 Obtendo POIs da trilha:', trekId);

    const url = `${API_CONFIG.BASE_URL}/api/pois/by-trek/${trekId}`;
    const response = await this.makeRequest(url);

    return response.data || [];
  }

  // Obter POI por ID
  async getPOIById(poiId) {
    console.log('📍 Obtendo POI por ID:', poiId);

    const url = `${API_CONFIG.BASE_URL}/api/pois/${poiId}`;
    const response = await this.makeRequest(url);

    return response.data;
  }

  // Atualizar POI
  async updatePOI(poiId, updateData) {
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
    console.log('🗑️ Deletando POI:', poiId);

    const url = `${API_CONFIG.BASE_URL}/api/pois/${poiId}`;
    const options = {
      method: 'DELETE',
    };

    const response = await this.makeRequest(url, options);
    return response;
  }

  // ========== UTILITÁRIOS ==========

  // Limpar cache de token
  clearAuthToken() {
    this.authToken = null;
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
}

// Exportar instância única
const trailService = new TrailService();
export default trailService;
