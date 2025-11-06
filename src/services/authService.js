// services/authService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configurações da API
const API_CONFIG = {
  BASE_URL: 'http://192.168.18.13:3001',
  TIMEOUT: 10000, // 10 segundos
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 segundo
};

// Chaves do AsyncStorage
const STORAGE_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  LAST_LOGIN: 'lastLogin',
};

class AuthService {
  constructor() {
    this.isRefreshing = false;
    this.failedQueue = [];
  }

  // Utilitário para delay
  delay = ms => new Promise(resolve => setTimeout(resolve, ms));

  // Utilitário para validar email
  validateEmail = email => {
    // Regex corrigida (sem escape duplo no frontend)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    console.log('🧪 Validando email:', email);
    console.log('📊 Regex resultado:', emailRegex.test(email));
    return emailRegex.test(email);
  };

  // Utilitário para validar senha
  validatePassword = password => {
    return password && password.length >= 6;
  };

  // Fazer requisição com retry e timeout
  async makeRequest(url, options = {}, retryCount = 0) {
    console.log('\n🌐 === FAZENDO REQUISIÇÃO NO APP ===');
    console.log('📍 URL:', url);
    console.log('⚙️ Method:', options.method);
    console.log('📦 Body:', options.body);
    console.log('🔄 Retry count:', retryCount);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('⏰ Timeout atingido após', API_CONFIG.TIMEOUT, 'ms');
      controller.abort();
    }, API_CONFIG.TIMEOUT);

    try {
      console.log('📤 Executando fetch...');

      const fetchOptions = {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      };

      console.log(
        '📋 Fetch options completas:',
        JSON.stringify(fetchOptions, null, 2)
      );

      const response = await fetch(url, fetchOptions);

      clearTimeout(timeoutId);

      console.log('📥 Resposta recebida:');
      console.log('- Status:', response.status);
      console.log('- StatusText:', response.statusText);
      console.log('- OK:', response.ok);
      console.log('- URL:', response.url);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Response error text:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📊 Data parsed com sucesso:', data);
      console.log('🌐 === REQUISIÇÃO CONCLUÍDA COM SUCESSO ===\n');

      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      console.error('💥 Erro na requisição do app:');
      console.error('- Name:', error.name);
      console.error('- Message:', error.message);
      console.error('- Stack:', error.stack);

      // Retry em caso de erro de rede
      if (
        retryCount < API_CONFIG.RETRY_ATTEMPTS &&
        (error.name === 'AbortError' || error.message.includes('fetch'))
      ) {
        console.log(
          `🔄 Tentativa ${retryCount + 1} falhou, tentando novamente em ${
            API_CONFIG.RETRY_DELAY * (retryCount + 1)
          }ms...`
        );
        await this.delay(API_CONFIG.RETRY_DELAY * (retryCount + 1));
        return this.makeRequest(url, options, retryCount + 1);
      }

      console.log('🌐 === REQUISIÇÃO FALHOU ===\n');
      throw error;
    }
  }

  // Salvar dados de autenticação
  async saveAuthData(authData) {
    try {
      const promises = [
        AsyncStorage.setItem(STORAGE_KEYS.TOKEN, authData.token),
        AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(authData.user)),
        AsyncStorage.setItem(STORAGE_KEYS.LAST_LOGIN, new Date().toISOString()),
      ];

      if (authData.refreshToken) {
        promises.push(
          AsyncStorage.setItem(
            STORAGE_KEYS.REFRESH_TOKEN,
            authData.refreshToken
          )
        );
      }

      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error('Erro ao salvar dados de autenticação:', error);
      return false;
    }
  }

  // Registrar usuário
  async register(name, email, password) {
    console.log('\n🚀 === INICIANDO REGISTRO NO APP ===');
    console.log('📝 Parâmetros recebidos:');
    console.log(
      '- name:',
      JSON.stringify(name),
      '| type:',
      typeof name,
      '| length:',
      name?.length
    );
    console.log('- email:', JSON.stringify(email), '| type:', typeof email);
    console.log(
      '- password:',
      password ? '***' : 'undefined',
      '| type:',
      typeof password,
      '| length:',
      password?.length
    );
    console.log('🔧 API_CONFIG.BASE_URL:', API_CONFIG.BASE_URL);

    try {
      // Validações locais
      console.log('🔍 Iniciando validações locais...');

      if (!name || name.trim().length < 2) {
        console.log('❌ Validação local falhou - nome muito curto');
        console.log('- name após trim:', JSON.stringify(name?.trim()));
        console.log('- length após trim:', name?.trim()?.length);
        return {
          success: false,
          message: 'Nome deve ter pelo menos 2 caracteres',
        };
      }

      if (!this.validateEmail(email)) {
        console.log('❌ Validação local falhou - email inválido');
        return {
          success: false,
          message: 'Email inválido',
        };
      }

      if (!this.validatePassword(password)) {
        console.log('❌ Validação local falhou - senha inválida');
        return {
          success: false,
          message: 'Senha deve ter pelo menos 6 caracteres',
        };
      }

      console.log('✅ Todas as validações locais passaram');

      const requestBody = {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: password,
      };

      console.log('📤 RequestBody criado:');
      console.log('- name:', JSON.stringify(requestBody.name));
      console.log('- email:', JSON.stringify(requestBody.email));
      console.log('- password:', requestBody.password ? '***' : 'undefined');

      const url = `${API_CONFIG.BASE_URL}/api/users/register`;
      console.log('🌐 URL completa:', url);

      const options = {
        method: 'POST',
        body: JSON.stringify(requestBody),
      };

      console.log('⚙️ Options:', JSON.stringify(options, null, 2));
      console.log('📤 Chamando makeRequest...');

      const data = await this.makeRequest(url, options);

      console.log('📥 Resposta da API recebida:', data);

      if (data.success) {
        const saved = await this.saveAuthData(data.data);

        if (!saved) {
          return {
            success: false,
            message: 'Erro ao salvar dados localmente',
          };
        }

        console.log('✅ Registro bem-sucedido no app');
        return {
          success: true,
          user: data.data.user,
          token: data.data.token,
          refreshToken: data.data.refreshToken,
          message: 'Usuário registrado com sucesso',
        };
      } else {
        console.log('❌ Registro falhou:', data.message);
        return {
          success: false,
          message: data.message || 'Erro no registro',
        };
      }
    } catch (error) {
      console.error('💥 Erro completo no registro do app:', error);
      console.error('💥 Stack trace:', error.stack);

      let message = 'Erro de conexão com o servidor';
      if (error.name === 'AbortError') {
        message = 'Tempo limite excedido. Verifique sua conexão.';
      } else if (error.message.includes('HTTP 400')) {
        message = 'Dados inválidos fornecidos';
      } else if (error.message.includes('HTTP 409')) {
        message = 'Email já está em uso';
      }

      return {
        success: false,
        message,
      };
    }
  }

  // Login usuário
  async login(email, password) {
    try {
      console.log('🔍 Tentando login com:', { email, password: '***' });
      console.log('🌐 URL da API:', `${API_CONFIG.BASE_URL}/api/auth/login`);

      // Validações
      if (!this.validateEmail(email)) {
        console.log('❌ Email inválido:', email);
        return {
          success: false,
          message: 'Email inválido',
        };
      }

      if (!password || password.length === 0) {
        console.log('❌ Senha vazia');
        return {
          success: false,
          message: 'Senha é obrigatória',
        };
      }

      const requestBody = {
        email: email.toLowerCase().trim(),
        password: password,
      };

      console.log('📤 Enviando dados:', {
        email: requestBody.email,
        password: '***',
      });

      const data = await this.makeRequest(
        `${API_CONFIG.BASE_URL}/api/auth/login`,
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
        }
      );

      console.log('📥 Resposta da API:', data);

      if (data.success) {
        const saved = await this.saveAuthData(data.data);

        if (!saved) {
          return {
            success: false,
            message: 'Erro ao salvar dados localmente',
          };
        }

        console.log('✅ Login bem-sucedido');
        return {
          success: true,
          user: data.data.user,
          token: data.data.token,
          refreshToken: data.data.refreshToken,
          message: 'Login realizado com sucesso',
        };
      } else {
        console.log('❌ Login falhou:', data.message);
        return {
          success: false,
          message: data.message || 'Credenciais inválidas',
        };
      }
    } catch (error) {
      console.error('💥 Erro completo no login:', error);
      console.error('💥 Stack trace:', error.stack);

      let message = 'Erro de conexão com o servidor';
      if (error.name === 'AbortError') {
        message = 'Tempo limite excedido. Verifique sua conexão.';
      } else if (error.message.includes('HTTP 401')) {
        message = 'Email ou senha incorretos';
      } else if (error.message.includes('HTTP 429')) {
        message = 'Muitas tentativas. Tente novamente em alguns minutos.';
      }

      return {
        success: false,
        message,
      };
    }
  }

  // Refresh token
  async refreshToken() {
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;

    try {
      const refreshToken = await AsyncStorage.getItem(
        STORAGE_KEYS.REFRESH_TOKEN
      );

      if (!refreshToken) {
        throw new Error('Refresh token não encontrado');
      }

      const data = await this.makeRequest(
        `${API_CONFIG.BASE_URL}/api/auth/refresh`,
        {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        }
      );

      if (data.success) {
        await this.saveAuthData(data.data);

        // Processar fila de requisições falhadas
        this.failedQueue.forEach(({ resolve }) => {
          resolve(data.data.token);
        });

        this.failedQueue = [];
        this.isRefreshing = false;

        return {
          success: true,
          token: data.data.token,
        };
      } else {
        throw new Error(data.message || 'Erro ao renovar token');
      }
    } catch (error) {
      this.failedQueue.forEach(({ reject }) => {
        reject(error);
      });

      this.failedQueue = [];
      this.isRefreshing = false;

      // Limpar dados se refresh falhar
      await this.clearAuthData();

      return {
        success: false,
        message: 'Sessão expirada. Faça login novamente.',
      };
    }
  }

  // Recuperar senha
  async recoverPassword(email) {
    try {
      console.log('🔍 Solicitando recuperação de senha para:', email);

      if (!this.validateEmail(email)) {
        return {
          success: false,
          message: 'Email inválido',
        };
      }

      const data = await this.makeRequest(
        `${API_CONFIG.BASE_URL}/api/auth/forgot-password`,
        {
          method: 'POST',
          body: JSON.stringify({ email: email.toLowerCase().trim() }),
        }
      );

      if (data.success) {
        console.log('✅ Email de recuperação enviado');
        return {
          success: true,
          message: 'Email de recuperação enviado com sucesso',
        };
      } else {
        return {
          success: false,
          message: data.message || 'Erro ao enviar email de recuperação',
        };
      }
    } catch (error) {
      console.error('❌ Erro na recuperação de senha:', error);

      let message = 'Erro de conexão com o servidor';
      if (error.message.includes('HTTP 404')) {
        message = 'Email não encontrado';
      }

      return {
        success: false,
        message,
      };
    }
  }

  // Obter token salvo
  async getToken() {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
    } catch (error) {
      console.error('Erro ao obter token:', error);
      return null;
    }
  }

  // Obter usuário salvo
  async getUser() {
    try {
      const userString = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      console.error('Erro ao obter usuário:', error);
      return null;
    }
  }

  // Obter dados completos de autenticação
  async getAuthData() {
    try {
      const [token, refreshToken, userString, lastLogin] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.LAST_LOGIN),
      ]);

      return {
        token,
        refreshToken,
        user: userString ? JSON.parse(userString) : null,
        lastLogin: lastLogin ? new Date(lastLogin) : null,
      };
    } catch (error) {
      console.error('Erro ao obter dados de autenticação:', error);
      return {
        token: null,
        refreshToken: null,
        user: null,
        lastLogin: null,
      };
    }
  }

  // Limpar dados de autenticação
  async clearAuthData() {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER,
        STORAGE_KEYS.LAST_LOGIN,
      ]);
      return true;
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      return false;
    }
  }

  // Logout
  async logout() {
    try {
      const token = await this.getToken();

      // Tentar notificar o servidor sobre o logout
      if (token) {
        try {
          await this.makeRequest(`${API_CONFIG.BASE_URL}/api/auth/logout`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        } catch (error) {
          console.log('Erro ao notificar logout no servidor:', error);
          // Não falhar o logout local se o servidor não responder
        }
      }

      const cleared = await this.clearAuthData();

      return {
        success: cleared,
        message: cleared
          ? 'Logout realizado com sucesso'
          : 'Erro ao fazer logout',
      };
    } catch (error) {
      console.error('Erro no logout:', error);
      return {
        success: false,
        message: 'Erro ao fazer logout',
      };
    }
  }

  // Verificar se está logado
  async isLoggedIn() {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
      return !!token;
    } catch (error) {
      console.error('Erro ao verificar login:', error);
      return false;
    }
  }

  // Verificar se o token é válido (sem fazer requisição)
  isTokenValid(token) {
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      return payload.exp > now;
    } catch (error) {
      return false;
    }
  }

  // Verificar status da sessão
  async getSessionStatus() {
    try {
      const { token, user, lastLogin } = await this.getAuthData();

      if (!token || !user) {
        return {
          isValid: false,
          reason: 'Não autenticado',
        };
      }

      if (!this.isTokenValid(token)) {
        return {
          isValid: false,
          reason: 'Token expirado',
          needsRefresh: true,
        };
      }

      return {
        isValid: true,
        user,
        lastLogin,
      };
    } catch (error) {
      console.error('Erro ao verificar status da sessão:', error);
      return {
        isValid: false,
        reason: 'Erro interno',
      };
    }
  }

  // Atualizar dados do usuário
  async updateUser(userData) {
    try {
      const token = await this.getToken();

      if (!token) {
        return {
          success: false,
          message: 'Usuário não autenticado',
        };
      }

      const data = await this.makeRequest(
        `${API_CONFIG.BASE_URL}/api/users/me`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(userData),
        }
      );

      if (data.success) {
        // Atualizar dados locais
        await AsyncStorage.setItem(
          STORAGE_KEYS.USER,
          JSON.stringify(data.data)
        );

        return {
          success: true,
          user: data.data,
          message: 'Dados atualizados com sucesso',
        };
      } else {
        return {
          success: false,
          message: data.message || 'Erro ao atualizar dados',
        };
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return {
        success: false,
        message: 'Erro ao atualizar dados',
      };
    }
  }

  // Alterar senha
  async changePassword(currentPassword, newPassword) {
    try {
      const token = await this.getToken();

      if (!token) {
        return {
          success: false,
          message: 'Usuário não autenticado',
        };
      }

      if (!this.validatePassword(newPassword)) {
        return {
          success: false,
          message: 'Nova senha deve ter pelo menos 6 caracteres',
        };
      }

      const data = await this.makeRequest(
        `${API_CONFIG.BASE_URL}/api/users/password`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      if (data.success) {
        return {
          success: true,
          message: 'Senha alterada com sucesso',
        };
      } else {
        return {
          success: false,
          message: data.message || 'Erro ao alterar senha',
        };
      }
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      return {
        success: false,
        message: 'Erro ao alterar senha',
      };
    }
  }

  // Excluir conta
  async deleteAccount() {
    try {
      const token = await this.getToken();

      if (!token) {
        return {
          success: false,
          message: 'Usuário não autenticado',
        };
      }

      const data = await this.makeRequest(
        `${API_CONFIG.BASE_URL}/api/users/me`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        // Limpar dados locais
        await this.clearAuthData();

        return {
          success: true,
          message: 'Conta excluída com sucesso',
        };
      } else {
        return {
          success: false,
          message: data.message || 'Erro ao excluir conta',
        };
      }
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      return {
        success: false,
        message: 'Erro ao excluir conta',
      };
    }
  }
}

export default new AuthService();
