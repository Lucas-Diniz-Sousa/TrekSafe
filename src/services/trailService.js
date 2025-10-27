import apiService from './api';

class TrailService {
  /**
   * Criar nova trilha
   * @param {Object} trailData - Dados da trilha
   * @returns {Promise<Object>} Resposta da API com dados da trilha criada
   */
  static async createTrail(trailData) {
    try {
      const response = await apiService.post('/api/treks', trailData);
      return response;
    } catch (error) {
      console.error('Erro ao criar trilha:', error);
      throw error;
    }
  }

  /**
   * Adicionar coordenadas à trilha
   * @param {string} trekId - ID da trilha
   * @param {Array} coords - Array de coordenadas
   * @returns {Promise<Object>} Resposta da API
   */
  static async addCoordinates(trekId, coords) {
    try {
      const response = await apiService.post(`/api/treks/${trekId}/coords`, {
        coords,
      });
      return response;
    } catch (error) {
      console.error('Erro ao adicionar coordenadas:', error);
      throw error;
    }
  }

  /**
   * Buscar trilhas por bounding box (área do mapa)
   * @param {Object} boundingBox - Coordenadas da área
   * @param {boolean} includePois - Incluir POIs nas trilhas
   * @returns {Promise<Object>} Resposta da API com trilhas encontradas
   */
  static async searchTrailsByArea(boundingBox, includePois = false) {
    try {
      const { minLat, maxLat, minLng, maxLng } = boundingBox;
      
      const params = {
        minLat,
        maxLat,
        minLng,
        maxLng,
        includePois: includePois.toString(),
      };

      const response = await apiService.get('/api/treks/search', params);
      return response;
    } catch (error) {
      console.error('Erro ao buscar trilhas por área:', error);
      throw error;
    }
  }

  /**
   * Buscar trilha por ID
   * @param {string} trekId - ID da trilha
   * @param {boolean} withCoords - Incluir coordenadas
   * @param {boolean} includePois - Incluir POIs
   * @returns {Promise<Object>} Resposta da API com dados da trilha
   */
  static async getTrailById(trekId, withCoords = false, includePois = false) {
    try {
      const params = {
        withCoords: withCoords.toString(),
        includePois: includePois.toString(),
      };

      const response = await apiService.get(`/api/treks/${trekId}`, params);
      return response;
    } catch (error) {
      console.error('Erro ao buscar trilha por ID:', error);
      throw error;
    }
  }

  /**
   * Atualizar trilha
   * @param {string} trekId - ID da trilha
   * @param {Object} updateData - Dados para atualização
   * @returns {Promise<Object>} Resposta da API
   */
  static async updateTrail(trekId, updateData) {
    try {
      const response = await apiService.put(`/api/treks/${trekId}`, updateData);
      return response;
    } catch (error) {
      console.error('Erro ao atualizar trilha:', error);
      throw error;
    }
  }

  /**
   * Listar minhas trilhas
   * @returns {Promise<Object>} Resposta da API com trilhas do usuário
   */
  static async getMyTrails() {
    try {
      const response = await apiService.get('/api/treks/mine');
      return response;
    } catch (error) {
      console.error('Erro ao buscar minhas trilhas:', error);
      throw error;
    }
  }

  /**
   * Calcular bounding box baseado na região atual do mapa
   * @param {Object} region - Região do mapa
   * @returns {Object} Bounding box calculado
   */
  static calculateBoundingBox(region) {
    const { latitude, longitude, latitudeDelta, longitudeDelta } = region;
    
    return {
      minLat: latitude - latitudeDelta / 2,
      maxLat: latitude + latitudeDelta / 2,
      minLng: longitude - longitudeDelta / 2,
      maxLng: longitude + longitudeDelta / 2,
    };
  }

  /**
   * Formatar coordenadas para envio à API
   * @param {Array} coordinates - Array de coordenadas do mapa
   * @returns {Array} Coordenadas formatadas para a API
   */
  static formatCoordinatesForAPI(coordinates) {
    return coordinates.map((coord, index) => ({
      lat: coord.latitude,
      lng: coord.longitude,
      timestamp: coord.timestamp || new Date().toISOString(),
      orderIndex: index,
    }));
  }

  /**
   * Formatar coordenadas da API para o mapa
   * @param {Array} apiCoordinates - Coordenadas da API
   * @returns {Array} Coordenadas formatadas para o mapa
   */
  static formatCoordinatesForMap(apiCoordinates) {
    return apiCoordinates.map(coord => ({
      latitude: coord.lat,
      longitude: coord.lng,
      timestamp: coord.timestamp,
    }));
  }

  /**
   * Criar dados de trilha para a API
   * @param {Object} trailInfo - Informações da trilha
   * @returns {Object} Dados formatados para a API
   */
  static createTrailData(trailInfo) {
    const {
      title,
      description = '',
      startedAt,
      endedAt,
      totalDistance = 0,
      durationSeconds = 0,
      isOnline = true,
      isPublic = false,
      initialLat,
      initialLng,
    } = trailInfo;

    return {
      title,
      description,
      startedAt: startedAt || new Date().toISOString(),
      endedAt: endedAt || new Date().toISOString(),
      totalDistance,
      durationSeconds,
      isOnline,
      isPublic,
      initialLat,
      initialLng,
    };
  }

  /**
   * Calcular distância total da trilha
   * @param {Array} coordinates - Array de coordenadas
   * @returns {number} Distância total em metros
   */
  static calculateTotalDistance(coordinates) {
    if (coordinates.length < 2) return 0;

    let totalDistance = 0;
    
    for (let i = 1; i < coordinates.length; i++) {
      const distance = this.calculateDistance(
        coordinates[i - 1],
        coordinates[i]
      );
      totalDistance += distance;
    }

    return totalDistance;
  }

  /**
   * Calcular distância entre dois pontos (fórmula de Haversine)
   * @param {Object} point1 - Primeiro ponto {latitude, longitude}
   * @param {Object} point2 - Segundo ponto {latitude, longitude}
   * @returns {number} Distância em metros
   */
  static calculateDistance(point1, point2) {
    const R = 6371e3; // Raio da Terra em metros
    const ?1 = (point1.latitude * Math.PI) / 180;
    const ?2 = (point2.latitude * Math.PI) / 180;
    const ?? = ((point2.latitude - point1.latitude) * Math.PI) / 180;
    const ?? = ((point2.longitude - point1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(?? / 2) * Math.sin(?? / 2) +
      Math.cos(?1) * Math.cos(?2) * Math.sin(?? / 2) * Math.sin(?? / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Calcular duração da trilha
   * @param {Date} startTime - Hora de início
   * @param {Date} endTime - Hora de fim
   * @returns {number} Duração em segundos
   */
  static calculateDuration(startTime, endTime) {
    return Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
  }
}

export default TrailService;