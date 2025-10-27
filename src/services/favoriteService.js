import apiService from './api';

class FavoriteService {
  /**
   * Adicionar trilha aos favoritos
   * @param {string} trekId - ID da trilha
   * @returns {Promise<Object>} Resposta da API
   */
  static async addFavorite(trekId) {
    try {
      const response = await apiService.post('/api/favorites', { trekId });
      return response;
    } catch (error) {
      console.error('Erro ao adicionar favorito:', error);
      throw error;
    }
  }

  /**
   * Listar trilhas favoritas
   * @returns {Promise<Object>} Resposta da API com trilhas favoritas
   */
  static async getFavorites() {
    try {
      const response = await apiService.get('/api/favorites');
      return response;
    } catch (error) {
      console.error('Erro ao buscar favoritos:', error);
      throw error;
    }
  }

  /**
   * Remover trilha dos favoritos
   * @param {string} favoriteId - ID do favorito
   * @returns {Promise<Object>} Resposta da API
   */
  static async removeFavorite(favoriteId) {
    try {
      const response = await apiService.delete(`/api/favorites/${favoriteId}`);
      return response;
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      throw error;
    }
  }

  /**
   * Verificar se uma trilha está nos favoritos
   * @param {string} trekId - ID da trilha
   * @param {Array} favorites - Lista de favoritos
   * @returns {Object|null} Favorito encontrado ou null
   */
  static isFavorite(trekId, favorites) {
    return favorites.find(favorite => 
      favorite.trek._id === trekId || favorite.trek === trekId
    ) || null;
  }

  /**
   * Formatar favoritos da API para uso no app
   * @param {Array} apiFavorites - Favoritos da API
   * @returns {Array} Favoritos formatados
   */
  static formatFavoritesForApp(apiFavorites) {
    return apiFavorites.map(favorite => ({
      id: favorite._id,
      trekId: favorite.trek._id || favorite.trek,
      trek: favorite.trek,
      createdAt: favorite.createdAt,
    }));
  }

  /**
   * Obter IDs das trilhas favoritas
   * @param {Array} favorites - Lista de favoritos
   * @returns {Array} Array com IDs das trilhas favoritas
   */
  static getFavoriteTrekIds(favorites) {
    return favorites.map(favorite => 
      favorite.trek._id || favorite.trek
    );
  }

  /**
   * Alternar status de favorito de uma trilha
   * @param {string} trekId - ID da trilha
   * @param {Array} favorites - Lista atual de favoritos
   * @returns {Promise<Object>} Resultado da operação
   */
  static async toggleFavorite(trekId, favorites) {
    try {
      const existingFavorite = this.isFavorite(trekId, favorites);
      
      if (existingFavorite) {
        // Remover dos favoritos
        await this.removeFavorite(existingFavorite.id || existingFavorite._id);
        return {
          success: true,
          action: 'removed',
          message: 'Trilha removida dos favoritos',
        };
      } else {
        // Adicionar aos favoritos
        await this.addFavorite(trekId);
        return {
          success: true,
          action: 'added',
          message: 'Trilha adicionada aos favoritos',
        };
      }
    } catch (error) {
      return {
        success: false,
        action: 'error',
        message: error.message || 'Erro ao alterar favorito',
      };
    }
  }

  /**
   * Sincronizar favoritos locais com o servidor
   * @returns {Promise<Array>} Lista atualizada de favoritos
   */
  static async syncFavorites() {
    try {
      const response = await this.getFavorites();
      return this.formatFavoritesForApp(response.data || []);
    } catch (error) {
      console.error('Erro ao sincronizar favoritos:', error);
      return [];
    }
  }

  /**
   * Filtrar trilhas que são favoritas
   * @param {Array} trails - Lista de trilhas
   * @param {Array} favorites - Lista de favoritos
   * @returns {Array} Trilhas que são favoritas
   */
  static filterFavoriteTrails(trails, favorites) {
    const favoriteTrekIds = this.getFavoriteTrekIds(favorites);
    return trails.filter(trail => 
      favoriteTrekIds.includes(trail._id || trail.id)
    );
  }

  /**
   * Marcar trilhas como favoritas
   * @param {Array} trails - Lista de trilhas
   * @param {Array} favorites - Lista de favoritos
   * @returns {Array} Trilhas com flag de favorito
   */
  static markFavoriteTrails(trails, favorites) {
    const favoriteTrekIds = this.getFavoriteTrekIds(favorites);
    
    return trails.map(trail => ({
      ...trail,
      isFavorite: favoriteTrekIds.includes(trail._id || trail.id),
      favoriteId: this.isFavorite(trail._id || trail.id, favorites)?._id,
    }));
  }

  /**
   * Obter estatísticas dos favoritos
   * @param {Array} favorites - Lista de favoritos
   * @returns {Object} Estatísticas dos favoritos
   */
  static getFavoriteStats(favorites) {
    const totalFavorites = favorites.length;
    const publicFavorites = favorites.filter(fav => 
      fav.trek.isPublic === true
    ).length;
    const privateFavorites = totalFavorites - publicFavorites;

    return {
      total: totalFavorites,
      public: publicFavorites,
      private: privateFavorites,
    };
  }
}

export default FavoriteService;