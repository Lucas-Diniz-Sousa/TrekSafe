class AuthService {
  // Chaves para armazenamento local
  static TOKEN_KEY = 'authToken';
  static USER_DATA_KEY = 'userData';

  /**
   * Registra um novo usuário
   * @param {Object} userData - Dados do usuário (name, email, password)
   * @returns {Promise<Object>} Dados do usuário registrado
   */
  static async register(userData) {
    try {
      const response = await apiClient.post('/auth/register', userData);

      if (response.data.success) {
        const { user, token, refreshToken } = response.data.data;

        // Salva os tokens e dados do usuário de forma segura
        await SecureStorage.setTokens(token, refreshToken);
        await SecureStorage.setUserData(user);

        return { user, token, refreshToken };
      } else {
        throw new Error(response.data.message || 'Erro no registro');
      }
    } catch (error) {
      console.error('Erro no registro:', error);
      throw new Error(
        error.response?.data?.message || 'Erro ao registrar usuário'
      );
    }
  }

  /**
   * Fazer login do usuário
   * @param {string} email - Email do usuário
   * @param {string} password - Senha do usuário
   * @returns {Promise<Object>} Dados do usuário logado
   */
  static async login(email, password) {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });

      if (response.data.success) {
        const { user, token, refreshToken } = response.data.data;

        // Salva os tokens e dados do usuário de forma segura
        await SecureStorage.setTokens(token, refreshToken);
        await SecureStorage.setUserData(user);

        return { user, token, refreshToken };
      } else {
        throw new Error(response.data.message || 'Erro no login');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      throw new Error(
        error.response?.data?.message || 'Email ou senha incorretos'
      );
    }
  }

  /**
   * Fazer logout do usuário
   * @returns {Promise<void>}
   */
  static async logout() {
    try {
      // Tentar fazer logout no servidor
      try {
        await apiClient.post('/auth/logout');
      } catch (error) {
        console.warn('Erro ao fazer logout no servidor:', error);
        // Continua com o logout local mesmo se o servidor falhar
      }

      // Limpar dados locais de forma segura
      await SecureStorage.clearAuthData();
    } catch (error) {
      console.error('Erro no logout:', error);
      throw error;
    }
  }

  /**
   * Solicitar recuperação de senha
   * @param {string} email - Email do usuário
   * @returns {Promise<Object>} Resposta da API
   */
  static async recoverPassword(email) {
    try {
      const response = await apiClient.post('/auth/recover-password', {
        email,
      });

      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(
          response.data.message || 'Erro ao solicitar recuperação de senha'
        );
      }
    } catch (error) {
      console.error('Erro na recuperação de senha:', error);
      throw new Error(
        error.response?.data?.message ||
          'Erro ao solicitar recuperação de senha'
      );
    }
  }

  /**
   * Redefinir senha com token
   * @param {string} token - Token de recuperação
   * @param {string} newPassword - Nova senha
   * @returns {Promise<Object>} Resposta da API
   */
  static async resetPassword(token, newPassword) {
    try {
      const response = await apiClient.post('/auth/reset-password', {
        token,
        password: newPassword,
      });

      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Erro ao redefinir senha');
      }
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      throw new Error(
        error.response?.data?.message || 'Erro ao redefinir senha'
      );
    }
  }

  /**
   * Obter dados do usuário atual
   * @returns {Promise<Object|null>} Dados do usuário ou null
   */
  static async getCurrentUser() {
    try {
      const token = await SecureStorage.getAccessToken();
      if (!token) {
        return null;
      }

      const response = await apiClient.get('/auth/me');

      if (response.data.success && response.data.user) {
        // Atualizar dados do usuário no storage seguro
        await SecureStorage.setUserData(response.data.user);
        return response.data.user;
      }

      return null;
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error);
      // Se der erro, limpar dados de autenticação
      await SecureStorage.clearAuthData();
      return null;
    }
  }

  /**
   * Verificar se o usuário está autenticado
   * @returns {Promise<boolean>} True se autenticado
   */
  static async isAuthenticated() {
    try {
      const token = await SecureStorage.getAccessToken();
      return !!token;
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      return false;
    }
  }

  /**
   * Obter token armazenado
   * @returns {Promise<string|null>} Token ou null
   */
  static async getToken() {
    try {
      return await AsyncStorage.getItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Erro ao obter token:', error);
      return null;
    }
  }

  /**
   * Obter dados do usuário armazenados
   * @returns {Promise<Object|null>} Dados do usuário ou null
   */
  static async getStoredUserData() {
    try {
      const userData = await AsyncStorage.getItem(this.USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Erro ao obter dados do usuário:', error);
      return null;
    }
  }

  /**
   * Obter dados de autenticação salvos
   * @returns {Promise<Object>} Dados de autenticação
   */
  static async getAuthData() {
    try {
      const token = await SecureStorage.getAccessToken();
      const refreshToken = await SecureStorage.getRefreshToken();
      const userData = await SecureStorage.getUserData();

      return {
        token,
        refreshToken,
        userData,
      };
    } catch (error) {
      console.error('Erro ao obter dados de autenticação:', error);
      return {
        token: null,
        refreshToken: null,
        userData: null,
      };
    }
  }

  /**
   * Salvar dados de autenticação
   * @param {string} token - Token de autenticação
   * @param {Object} userData - Dados do usuário
   * @returns {Promise<void>}
   */
  static async saveAuthData(token, userData) {
    try {
      await AsyncStorage.setItem(this.TOKEN_KEY, token);
      await AsyncStorage.setItem(this.USER_DATA_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Erro ao salvar dados de autenticação:', error);
      throw error;
    }
  }

  /**
   * Limpar dados de autenticação
   * @returns {Promise<void>}
   */
  static async clearAuthData() {
    try {
      await AsyncStorage.multiRemove([this.TOKEN_KEY, this.USER_DATA_KEY]);
    } catch (error) {
      console.error('Erro ao limpar dados de autenticação:', error);
      throw error;
    }
  }

  /**
   * Atualizar dados do usuário no armazenamento local
   * @param {Object} userData - Novos dados do usuário
   * @returns {Promise<void>}
   */
  static async updateStoredUserData(userData) {
    try {
      await AsyncStorage.setItem(this.USER_DATA_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error);
      throw error;
    }
  }
}

export default AuthService;
