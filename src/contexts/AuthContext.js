import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AuthService from '../services/authService';

// Estados possíveis da autenticação
const AUTH_STATES = {
  LOADING: 'loading',
  AUTHENTICATED: 'authenticated',
  UNAUTHENTICATED: 'unauthenticated',
};

// Ações do reducer
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_AUTHENTICATED: 'SET_AUTHENTICATED',
  SET_UNAUTHENTICATED: 'SET_UNAUTHENTICATED',
  UPDATE_USER: 'UPDATE_USER',
};

// Estado inicial
const initialState = {
  status: AUTH_STATES.LOADING,
  user: null,
  token: null,
  isAuthenticated: false,
};

// Reducer para gerenciar o estado de autenticação
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        status: AUTH_STATES.LOADING,
      };

    case AUTH_ACTIONS.SET_AUTHENTICATED:
      return {
        ...state,
        status: AUTH_STATES.AUTHENTICATED,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
      };

    case AUTH_ACTIONS.SET_UNAUTHENTICATED:
      return {
        ...state,
        status: AUTH_STATES.UNAUTHENTICATED,
        isAuthenticated: false,
        user: null,
        token: null,
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };

    default:
      return state;
  }
};

// Criar o contexto
const AuthContext = createContext();

// Provider do contexto de autenticação
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Verificar autenticação ao inicializar
  useEffect(() => {
    checkAuthStatus();
  }, []);

  /**
   * Verificar status de autenticação
   */
  const checkAuthStatus = async () => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING });

      const token = await AuthService.getToken();
      const userData = await AuthService.getStoredUserData();

      if (token && userData) {
        // Verificar se o token ainda é válido fazendo uma requisição
        try {
          const currentUser = await AuthService.getCurrentUser();
          dispatch({
            type: AUTH_ACTIONS.SET_AUTHENTICATED,
            payload: {
              user: currentUser,
              token,
            },
          });
        } catch (error) {
          // Token inválido, limpar dados
          await AuthService.clearAuthData();
          dispatch({ type: AUTH_ACTIONS.SET_UNAUTHENTICATED });
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_UNAUTHENTICATED });
      }
    } catch (error) {
      console.error('Erro ao verificar status de autenticação:', error);
      dispatch({ type: AUTH_ACTIONS.SET_UNAUTHENTICATED });
    }
  };

  /**
   * Fazer login
   */
  const login = async (email, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING });

      const response = await AuthService.login(email, password);
      
      if (response.success) {
        const userData = await AuthService.getStoredUserData();
        const token = await AuthService.getToken();

        dispatch({
          type: AUTH_ACTIONS.SET_AUTHENTICATED,
          payload: {
            user: userData,
            token,
          },
        });

        return { success: true };
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_UNAUTHENTICATED });
        return { success: false, message: response.message || 'Erro no login' };
      }
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_UNAUTHENTICATED });
      return { 
        success: false, 
        message: error.message || 'Erro ao fazer login' 
      };
    }
  };

  /**
   * Fazer registro
   */
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING });

      const response = await AuthService.register(userData);
      
      if (response.success) {
        const storedUserData = await AuthService.getStoredUserData();
        const token = await AuthService.getToken();

        dispatch({
          type: AUTH_ACTIONS.SET_AUTHENTICATED,
          payload: {
            user: storedUserData,
            token,
          },
        });

        return { success: true };
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_UNAUTHENTICATED });
        return { success: false, message: response.message || 'Erro no registro' };
      }
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_UNAUTHENTICATED });
      return { 
        success: false, 
        message: error.message || 'Erro ao fazer registro' 
      };
    }
  };

  /**
   * Fazer logout
   */
  const logout = async () => {
    try {
      await AuthService.logout();
      dispatch({ type: AUTH_ACTIONS.SET_UNAUTHENTICATED });
      return { success: true };
    } catch (error) {
      console.error('Erro no logout:', error);
      // Mesmo com erro, limpar estado local
      dispatch({ type: AUTH_ACTIONS.SET_UNAUTHENTICATED });
      return { success: true }; // Sempre retorna sucesso para logout
    }
  };

  /**
   * Solicitar recuperação de senha
   */
  const forgotPassword = async (email) => {
    try {
      const response = await AuthService.forgotPassword(email);
      return { 
        success: response.success, 
        message: response.message || 'Email de recuperação enviado' 
      };
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Erro ao solicitar recuperação de senha' 
      };
    }
  };

  /**
   * Redefinir senha
   */
  const resetPassword = async (resetToken, newPassword) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING });

      const response = await AuthService.resetPassword(resetToken, newPassword);
      
      if (response.success) {
        const userData = await AuthService.getStoredUserData();
        const token = await AuthService.getToken();

        dispatch({
          type: AUTH_ACTIONS.SET_AUTHENTICATED,
          payload: {
            user: userData,
            token,
          },
        });

        return { success: true, message: 'Senha alterada com sucesso' };
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_UNAUTHENTICATED });
        return { success: false, message: response.message || 'Erro ao redefinir senha' };
      }
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_UNAUTHENTICATED });
      return { 
        success: false, 
        message: error.message || 'Erro ao redefinir senha' 
      };
    }
  };

  /**
   * Atualizar dados do usuário
   */
  const updateUser = async (userData) => {
    try {
      // Atualizar no armazenamento local
      await AuthService.updateStoredUserData(userData);
      
      // Atualizar no estado
      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: userData,
      });

      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return { 
        success: false, 
        message: error.message || 'Erro ao atualizar dados do usuário' 
      };
    }
  };

  // Valor do contexto
  const value = {
    // Estado
    ...state,
    
    // Ações
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateUser,
    checkAuthStatus,
    
    // Estados úteis
    isLoading: state.status === AUTH_STATES.LOADING,
    isAuthenticated: state.isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar o contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
};

export default AuthContext;