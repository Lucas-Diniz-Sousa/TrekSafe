import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';

/**
 * Serviço de armazenamento seguro para tokens e dados sensíveis
 */
class SecureStorage {
  // Chaves para armazenamento
  static KEYS = {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_DATA: 'user_data',
    API_BASE_URL: 'api_base_url',
    BIOMETRIC_ENABLED: 'biometric_enabled',
  };

  /**
   * Armazena token de acesso de forma segura
   * @param {string} token - Token de acesso
   */
  static async setAccessToken(token) {
    try {
      await Keychain.setInternetCredentials(
        this.KEYS.ACCESS_TOKEN,
        'access_token',
        token,
        {
          accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE,
          authenticatePrompt: 'Autentique-se para acessar o token',
          service: 'TrekSafe',
        }
      );
    } catch (error) {
      console.warn('Erro ao salvar token de acesso no Keychain, usando AsyncStorage:', error);
      await AsyncStorage.setItem(this.KEYS.ACCESS_TOKEN, token);
    }
  }

  /**
   * Recupera token de acesso
   * @returns {Promise<string|null>} Token de acesso ou null
   */
  static async getAccessToken() {
    try {
      const credentials = await Keychain.getInternetCredentials(this.KEYS.ACCESS_TOKEN);
      if (credentials && credentials.password) {
        return credentials.password;
      }
    } catch (error) {
      console.warn('Erro ao recuperar token do Keychain, tentando AsyncStorage:', error);
    }

    // Fallback para AsyncStorage
    try {
      return await AsyncStorage.getItem(this.KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('Erro ao recuperar token de acesso:', error);
      return null;
    }
  }

  /**
   * Armazena token de refresh de forma segura
   * @param {string} token - Token de refresh
   */
  static async setRefreshToken(token) {
    try {
      await Keychain.setInternetCredentials(
        this.KEYS.REFRESH_TOKEN,
        'refresh_token',
        token,
        {
          accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE,
          authenticatePrompt: 'Autentique-se para acessar o token de refresh',
          service: 'TrekSafe',
        }
      );
    } catch (error) {
      console.warn('Erro ao salvar refresh token no Keychain, usando AsyncStorage:', error);
      await AsyncStorage.setItem(this.KEYS.REFRESH_TOKEN, token);
    }
  }

  /**
   * Recupera token de refresh
   * @returns {Promise<string|null>} Token de refresh ou null
   */
  static async getRefreshToken() {
    try {
      const credentials = await Keychain.getInternetCredentials(this.KEYS.REFRESH_TOKEN);
      if (credentials && credentials.password) {
        return credentials.password;
      }
    } catch (error) {
      console.warn('Erro ao recuperar refresh token do Keychain, tentando AsyncStorage:', error);
    }

    // Fallback para AsyncStorage
    try {
      return await AsyncStorage.getItem(this.KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Erro ao recuperar refresh token:', error);
      return null;
    }
  }

  /**
   * Armazena dados do usuário
   * @param {Object} userData - Dados do usuário
   */
  static async setUserData(userData) {
    try {
      const userDataString = JSON.stringify(userData);
      await AsyncStorage.setItem(this.KEYS.USER_DATA, userDataString);
    } catch (error) {
      console.error('Erro ao salvar dados do usuário:', error);
      throw error;
    }
  }

  /**
   * Recupera dados do usuário
   * @returns {Promise<Object|null>} Dados do usuário ou null
   */
  static async getUserData() {
    try {
      const userDataString = await AsyncStorage.getItem(this.KEYS.USER_DATA);
      return userDataString ? JSON.parse(userDataString) : null;
    } catch (error) {
      console.error('Erro ao recuperar dados do usuário:', error);
      return null;
    }
  }

  /**
   * Define a URL base da API
   * @param {string} baseUrl - URL base da API
   */
  static async setApiBaseUrl(baseUrl) {
    try {
      await AsyncStorage.setItem(this.KEYS.API_BASE_URL, baseUrl);
    } catch (error) {
      console.error('Erro ao salvar URL base da API:', error);
      throw error;
    }
  }

  /**
   * Recupera a URL base da API
   * @returns {Promise<string|null>} URL base da API ou null
   */
  static async getApiBaseUrl() {
    try {
      return await AsyncStorage.getItem(this.KEYS.API_BASE_URL);
    } catch (error) {
      console.error('Erro ao recuperar URL base da API:', error);
      return null;
    }
  }

  /**
   * Verifica se a autenticação biométrica está habilitada
   * @returns {Promise<boolean>} True se habilitada, false caso contrário
   */
  static async isBiometricEnabled() {
    try {
      const enabled = await AsyncStorage.getItem(this.KEYS.BIOMETRIC_ENABLED);
      return enabled === 'true';
    } catch (error) {
      console.error('Erro ao verificar status da biometria:', error);
      return false;
    }
  }

  /**
   * Define se a autenticação biométrica está habilitada
   * @param {boolean} enabled - True para habilitar, false para desabilitar
   */
  static async setBiometricEnabled(enabled) {
    try {
      await AsyncStorage.setItem(this.KEYS.BIOMETRIC_ENABLED, enabled.toString());
    } catch (error) {
      console.error('Erro ao definir status da biometria:', error);
      throw error;
    }
  }

  /**
   * Verifica se a biometria está disponível no dispositivo
   * @returns {Promise<boolean>} True se disponível, false caso contrário
   */
  static async isBiometricAvailable() {
    try {
      const biometryType = await Keychain.getSupportedBiometryType();
      return biometryType !== null;
    } catch (error) {
      console.error('Erro ao verificar disponibilidade da biometria:', error);
      return false;
    }
  }

  /**
   * Obtém o tipo de biometria suportada
   * @returns {Promise<string|null>} Tipo de biometria ou null
   */
  static async getBiometryType() {
    try {
      return await Keychain.getSupportedBiometryType();
    } catch (error) {
      console.error('Erro ao obter tipo de biometria:', error);
      return null;
    }
  }

  /**
   * Remove todos os tokens e dados de autenticação
   */
  static async clearAuthData() {
    try {
      // Remove tokens do Keychain
      await Promise.allSettled([
        Keychain.resetInternetCredentials(this.KEYS.ACCESS_TOKEN),
        Keychain.resetInternetCredentials(this.KEYS.REFRESH_TOKEN),
      ]);

      // Remove dados do AsyncStorage
      await Promise.allSettled([
        AsyncStorage.removeItem(this.KEYS.ACCESS_TOKEN),
        AsyncStorage.removeItem(this.KEYS.REFRESH_TOKEN),
        AsyncStorage.removeItem(this.KEYS.USER_DATA),
      ]);
    } catch (error) {
      console.error('Erro ao limpar dados de autenticação:', error);
      throw error;
    }
  }

  /**
   * Remove todos os dados armazenados
   */
  static async clearAllData() {
    try {
      await this.clearAuthData();
      await Promise.allSettled([
        AsyncStorage.removeItem(this.KEYS.API_BASE_URL),
        AsyncStorage.removeItem(this.KEYS.BIOMETRIC_ENABLED),
      ]);
    } catch (error) {
      console.error('Erro ao limpar todos os dados:', error);
      throw error;
    }
  }

  /**
   * Verifica se o usuário está autenticado (possui tokens válidos)
   * @returns {Promise<boolean>} True se autenticado, false caso contrário
   */
  static async isAuthenticated() {
    try {
      const accessToken = await this.getAccessToken();
      return !!accessToken;
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      return false;
    }
  }

  /**
   * Armazena tokens de autenticação
   * @param {string} accessToken - Token de acesso
   * @param {string} refreshToken - Token de refresh (opcional)
   */
  static async setTokens(accessToken, refreshToken = null) {
    try {
      await this.setAccessToken(accessToken);
      if (refreshToken) {
        await this.setRefreshToken(refreshToken);
      }
    } catch (error) {
      console.error('Erro ao salvar tokens:', error);
      throw error;
    }
  }

  /**
   * Recupera todos os tokens
   * @returns {Promise<{accessToken: string|null, refreshToken: string|null}>}
   */
  static async getTokens() {
    try {
      const [accessToken, refreshToken] = await Promise.all([
        this.getAccessToken(),
        this.getRefreshToken(),
      ]);

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      console.error('Erro ao recuperar tokens:', error);
      return {
        accessToken: null,
        refreshToken: null,
      };
    }
  }
}

export default SecureStorage;