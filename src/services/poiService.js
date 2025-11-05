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
   * @param {Object} updateData - Dados para atualiza��o
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
   * @param {Object} poiInfo - Informa��es do POI
   * @returns {Object} Dados formatados para a API
   */
  static createPOIData(poiInfo) {
    const { trekId, name, lat, lng, description = '', alt = null } = poiInfo;

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
   * Formatar m�ltiplos POIs da API para o mapa
   * @param {Array} apiPOIs - Array de POIs da API
   * @returns {Array} Array de POIs formatados para o mapa
   */
  static formatPOIsForMap(apiPOIs) {
    return apiPOIs.map(poi => this.formatPOIForMap(poi));
  }

  /**
   * Validar dados do POI
   * @param {Object} poiData - Dados do POI para valida��o
   * @returns {Object} Resultado da valida��o
   */
  static validatePOIData(poiData) {
    const errors = [];

    // Validar campos obrigat�rios
    if (!poiData.trekId) {
      errors.push('ID da trilha � obrigat�rio');
    }

    if (!poiData.name || poiData.name.trim().length === 0) {
      errors.push('Nome do POI � obrigat�rio');
    }

    if (
      typeof poiData.lat !== 'number' ||
      poiData.lat < -90 ||
      poiData.lat > 90
    ) {
      errors.push('Latitude deve ser um n�mero entre -90 e 90');
    }

    if (
      typeof poiData.lng !== 'number' ||
      poiData.lng < -180 ||
      poiData.lng > 180
    ) {
      errors.push('Longitude deve ser um n�mero entre -180 e 180');
    }

    // Validar campos opcionais
    if (poiData.alt !== null && poiData.alt !== undefined) {
      if (typeof poiData.alt !== 'number') {
        errors.push('Altitude deve ser um n�mero');
      }
    }

    if (poiData.name && poiData.name.length > 100) {
      errors.push('Nome do POI deve ter no m�ximo 100 caracteres');
    }

    if (poiData.description && poiData.description.length > 500) {
      errors.push('Descri��o deve ter no m�ximo 500 caracteres');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calcular dist�ncia entre um ponto e um POI
   * @param {Object} point - Ponto de refer�ncia {latitude, longitude}
   * @param {Object} poi - POI {lat, lng}
   * @returns {number} Dist�ncia em metros
   */
  static calculateDistanceToPOI(point, poi) {
    const R = 6371e3; // Raio da Terra em metros
    const lat1 = (point.latitude * Math.PI) / 180;
    const lat2 = (poi.lat * Math.PI) / 180;
    const deltaLat = ((poi.lat - point.latitude) * Math.PI) / 180;
    const deltaLng = ((poi.lng - point.longitude) * Math.PI) / 180;

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(deltaLng / 2) *
        Math.sin(deltaLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Filtrar POIs por dist�ncia
   * @param {Array} pois - Array de POIs
   * @param {Object} centerPoint - Ponto central {latitude, longitude}
   * @param {number} maxDistance - Dist�ncia m�xima em metros
   * @returns {Array} POIs filtrados
   */
  static filterPOIsByDistance(pois, centerPoint, maxDistance) {
    return pois.filter(poi => {
      const distance = this.calculateDistanceToPOI(centerPoint, poi);
      return distance <= maxDistance;
    });
  }

  /**
   * Ordenar POIs por dist�ncia
   * @param {Array} pois - Array de POIs
   * @param {Object} referencePoint - Ponto de refer�ncia {latitude, longitude}
   * @returns {Array} POIs ordenados por dist�ncia
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
      { id: 'rest_area', name: '�rea de Descanso', icon: 'seat' },
      { id: 'camping', name: 'Camping', icon: 'tent' },
      { id: 'danger', name: 'Perigo', icon: 'alert-triangle' },
      { id: 'landmark', name: 'Marco', icon: 'map-pin' },
      { id: 'food', name: 'Alimenta��o', icon: 'utensils' },
      { id: 'water_source', name: 'Fonte de �gua', icon: 'droplet' },
      { id: 'shelter', name: 'Abrigo', icon: 'home' },
      { id: 'parking', name: 'Estacionamento', icon: 'car' },
    ];
  }
}

export default POIService;
