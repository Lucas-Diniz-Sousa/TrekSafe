import apiService from './api';

class POIService {
  /**
   * Criar novo POI (Ponto de Interesse)
   * @param {Object} poiData - Dados do POI
   * @returns {Promise<Object>} Resposta da API com dados do POI criado
   */
  static async createPOI(poiData) {
    try {
      const response = await apiService.post('/api/pois', poiData);
      return response;
    } catch (error) {
      console.error('Erro ao criar POI:', error);
      throw error;
    }
  }

  /**
   * Listar POIs por trilha
   * @param {string} trekId - ID da trilha
   * @returns {Promise<Object>} Resposta da API com POIs da trilha
   */
  static async getPOIsByTrail(trekId) {
    try {
      const response = await apiService.get(`/api/pois/by-trek/${trekId}`);
      return response;
    } catch (error) {
      console.error('Erro ao buscar POIs da trilha:', error);
      throw error;
    }
  }

  /**
   * Obter POI por ID
   * @param {string} poiId - ID do POI
   * @returns {Promise<Object>} Resposta da API com dados do POI
   */
  static async getPOIById(poiId) {
    try {
      const response = await apiService.get(`/api/pois/${poiId}`);
      return response;
    } catch (error) {
      console.error('Erro ao buscar POI por ID:', error);
      throw error;
    }
  }

  /**
   * Atualizar POI
   * @param {string} poiId - ID do POI
   * @param {Object} updateData - Dados para atualização
   * @returns {Promise<Object>} Resposta da API
   */
  static async updatePOI(poiId, updateData) {
    try {
      const response = await apiService.put(`/api/pois/${poiId}`, updateData);
      return response;
    } catch (error) {
      console.error('Erro ao atualizar POI:', error);
      throw error;
    }
  }

  /**
   * Remover POI
   * @param {string} poiId - ID do POI
   * @returns {Promise<Object>} Resposta da API
   */
  static async deletePOI(poiId) {
    try {
      const response = await apiService.delete(`/api/pois/${poiId}`);
      return response;
    } catch (error) {
      console.error('Erro ao remover POI:', error);
      throw error;
    }
  }

  /**
   * Criar dados de POI para a API
   * @param {Object} poiInfo - Informações do POI
   * @returns {Object} Dados formatados para a API
   */
  static createPOIData(poiInfo) {
    const {
      trekId,
      name,
      lat,
      lng,
      description = '',
      alt = null,
    } = poiInfo;

    return {
      trekId,
      name,
      lat,
      lng,
      description,
      ...(alt !== null && { alt }),
    };
  }

  /**
   * Formatar POI da API para o mapa
   * @param {Object} apiPOI - POI da API
   * @returns {Object} POI formatado para o mapa
   */
  static formatPOIForMap(apiPOI) {
    return {
      id: apiPOI._id,
      coordinate: {
        latitude: apiPOI.lat,
        longitude: apiPOI.lng,
      },
      title: apiPOI.name,
      description: apiPOI.description || '',
      altitude: apiPOI.alt || null,
      trekId: apiPOI.trek,
      createdAt: apiPOI.createdAt,
    };
  }

  /**
   * Formatar múltiplos POIs da API para o mapa
   * @param {Array} apiPOIs - Array de POIs da API
   * @returns {Array} Array de POIs formatados para o mapa
   */
  static formatPOIsForMap(apiPOIs) {
    return apiPOIs.map(poi => this.formatPOIForMap(poi));
  }

  /**
   * Validar dados do POI
   * @param {Object} poiData - Dados do POI para validação
   * @returns {Object} Resultado da validação
   */
  static validatePOIData(poiData) {
    const errors = [];

    // Validar campos obrigatórios
    if (!poiData.trekId) {
      errors.push('ID da trilha é obrigatório');
    }

    if (!poiData.name || poiData.name.trim().length === 0) {
      errors.push('Nome do POI é obrigatório');
    }

    if (typeof poiData.lat !== 'number' || poiData.lat < -90 || poiData.lat > 90) {
      errors.push('Latitude deve ser um número entre -90 e 90');
    }

    if (typeof poiData.lng !== 'number' || poiData.lng < -180 || poiData.lng > 180) {
      errors.push('Longitude deve ser um número entre -180 e 180');
    }

    // Validar campos opcionais
    if (poiData.alt !== null && poiData.alt !== undefined) {
      if (typeof poiData.alt !== 'number') {
        errors.push('Altitude deve ser um número');
      }
    }

    if (poiData.name && poiData.name.length > 100) {
      errors.push('Nome do POI deve ter no máximo 100 caracteres');
    }

    if (poiData.description && poiData.description.length > 500) {
      errors.push('Descrição deve ter no máximo 500 caracteres');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calcular distância entre um ponto e um POI
   * @param {Object} point - Ponto de referência {latitude, longitude}
   * @param {Object} poi - POI {lat, lng}
   * @returns {number} Distância em metros
   */
  static calculateDistanceToPOI(point, poi) {
    const R = 6371e3; // Raio da Terra em metros
    const ?1 = (point.latitude * Math.PI) / 180;
    const ?2 = (poi.lat * Math.PI) / 180;
    const ?? = ((poi.lat - point.latitude) * Math.PI) / 180;
    const ?? = ((poi.lng - point.longitude) * Math.PI) / 180;

    const a =
      Math.sin(?? / 2) * Math.sin(?? / 2) +
      Math.cos(?1) * Math.cos(?2) * Math.sin(?? / 2) * Math.sin(?? / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Filtrar POIs por distância
   * @param {Array} pois - Array de POIs
   * @param {Object} centerPoint - Ponto central {latitude, longitude}
   * @param {number} maxDistance - Distância máxima em metros
   * @returns {Array} POIs filtrados
   */
  static filterPOIsByDistance(pois, centerPoint, maxDistance) {
    return pois.filter(poi => {
      const distance = this.calculateDistanceToPOI(centerPoint, poi);
      return distance <= maxDistance;
    });
  }

  /**
   * Ordenar POIs por distância
   * @param {Array} pois - Array de POIs
   * @param {Object} referencePoint - Ponto de referência {latitude, longitude}
   * @returns {Array} POIs ordenados por distância
   */
  static sortPOIsByDistance(pois, referencePoint) {
    return pois.sort((a, b) => {
      const distanceA = this.calculateDistanceToPOI(referencePoint, a);
      const distanceB = this.calculateDistanceToPOI(referencePoint, b);
      return distanceA - distanceB;
    });
  }

  /**
   * Obter tipos de POI predefinidos
   * @returns {Array} Array com tipos de POI
   */
  static getPOITypes() {
    return [
      { id: 'viewpoint', name: 'Mirante', icon: 'eye' },
      { id: 'waterfall', name: 'Cachoeira', icon: 'water' },
      { id: 'rest_area', name: 'Área de Descanso', icon: 'seat' },
      { id: 'camping', name: 'Camping', icon: 'tent' },
      { id: 'danger', name: 'Perigo', icon: 'alert-triangle' },
      { id: 'landmark', name: 'Marco', icon: 'map-pin' },
      { id: 'food', name: 'Alimentação', icon: 'utensils' },
      { id: 'water_source', name: 'Fonte de Água', icon: 'droplet' },
      { id: 'shelter', name: 'Abrigo', icon: 'home' },
      { id: 'parking', name: 'Estacionamento', icon: 'car' },
    ];
  }
}

export default POIService;