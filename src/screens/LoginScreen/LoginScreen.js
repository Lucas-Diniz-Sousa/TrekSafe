// src/screens/LoginScreen/LoginScreen.js
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../contexts/AuthContext';
import { Colors, ColorUtils } from '../../theme/theme';
import { createStyles } from './LoginScreen.styles';

const LoginScreen = ({ navigation, onLoginSuccess }) => {
  // Estados do formulário
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Estados de modo
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Estados de erro
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [nameError, setNameError] = useState('');

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const styles = createStyles(isDarkMode);
  const { login, register, recoverPassword, authState } = useAuth();

  // Validações
  const validateEmail = email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = password => {
    return password.length >= 6;
  };

  const validateName = name => {
    console.log('Nome dessa merda', name);
    return name.trim().length >= 2;
  };

  const validateConfirmPassword = (password, confirmPassword) => {
    return password === confirmPassword;
  };

  // Handlers de mudança de texto
  const handleEmailChange = text => {
    setEmail(text);
    if (text && !validateEmail(text)) {
      setEmailError('Email inválido');
    } else {
      setEmailError('');
    }
  };

  const handlePasswordChange = text => {
    setPassword(text);
    if (text && !validatePassword(text)) {
      setPasswordError('Senha deve ter pelo menos 6 caracteres');
    } else {
      setPasswordError('');
    }

    // Revalidar confirmação de senha se estiver preenchida
    if (isRegisterMode && confirmPassword && text !== confirmPassword) {
      setConfirmPasswordError('Senhas não coincidem');
    } else {
      setConfirmPasswordError('');
    }
  };

  const handleConfirmPasswordChange = text => {
    setConfirmPassword(text);
    if (text && !validateConfirmPassword(password, text)) {
      setConfirmPasswordError('Senhas não coincidem');
    } else {
      setConfirmPasswordError('');
    }
  };

  const handleNameChange = text => {
    setName(text);
    if (text && !validateName(text)) {
      setNameError('Nome deve ter pelo menos 2 caracteres');
    } else {
      setNameError('');
    }
  };

  // Alternar entre login e registro
  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    // Limpar erros e campos específicos do registro
    setNameError('');
    setConfirmPasswordError('');
    if (!isRegisterMode) {
      setName('');
      setConfirmPassword('');
    }
  };

  // Limpar todos os campos
  const clearForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setNameError('');
  };

  // Handle Login
  const handleLogin = async () => {
    if (!isLoginFormValid) return;

    setIsLoading(true);

    try {
      await login(email, password);

      Alert.alert('Login realizado!', 'Bem-vindo ao TrekSafe!', [
        {
          text: 'OK',
          onPress: () => {
            if (onLoginSuccess) {
              onLoginSuccess();
            } else if (navigation) {
              navigation.navigate('Map');
            }
          },
        },
      ]);
    } catch (error) {
      Alert.alert(
        'Erro no login',
        error.message || 'Erro ao fazer login. Tente novamente.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Register - VERSÃO COM DEBUG
  // Handle Register - VERSÃO CORRIGIDA
  const handleRegister = async () => {
    console.log('🔍 Iniciando processo de registro...');
    console.log('📝 Dados do formulário:', {
      name: name.trim(),
      email: email.trim(),
      password: '***',
      isFormValid: isRegisterFormValid,
    });

    if (!isRegisterFormValid) {
      console.log('❌ Formulário inválido:', {
        nameError,
        emailError,
        passwordError,
        confirmPasswordError,
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('📞 Chamando função register...');

      // ✅ CORREÇÃO: Passar como objeto userData
      const result = await register({
        name: name.trim(),
        email: email.trim(),
        password: password,
      });

      console.log('📥 Resultado do registro:', result);

      if (result.success) {
        Alert.alert(
          'Conta criada!',
          'Sua conta foi criada com sucesso. Bem-vindo ao TrekSafe!',
          [
            {
              text: 'OK',
              onPress: () => {
                console.log('✅ Navegando para Map...');
                if (onLoginSuccess) {
                  onLoginSuccess();
                } else if (navigation) {
                  navigation.navigate('Map');
                }
              },
            },
          ]
        );
      } else {
        Alert.alert(
          'Erro no registro',
          result.message || 'Erro ao criar conta. Tente novamente.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('💥 Erro completo no registro:', error);
      console.error('💥 Stack trace:', error.stack);
      console.error('💥 Message:', error.message);

      Alert.alert(
        'Erro no registro',
        error.message || 'Erro ao criar conta. Tente novamente.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle principal (login ou registro)
  const handleSubmit = () => {
    if (isRegisterMode) {
      handleRegister();
    } else {
      handleLogin();
    }
  };

  const handleForgotPassword = () => {
    if (!email.trim()) {
      Alert.alert(
        'Email necessário',
        'Digite seu email no campo acima para recuperar a senha.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert(
        'Email inválido',
        'Digite um email válido para recuperar a senha.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Esqueci minha senha',
      'Um link de recuperação será enviado para seu email.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Enviar',
          onPress: async () => {
            try {
              await recoverPassword(email);
              Alert.alert(
                'Email enviado!',
                'Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.'
              );
            } catch (error) {
              Alert.alert(
                'Erro',
                error.message ||
                  'Erro ao enviar email de recuperação. Tente novamente.',
                [{ text: 'OK' }]
              );
            }
          },
        },
      ]
    );
  };

  // Validações de formulário
  const isLoginFormValid =
    email.trim() && password.trim() && !emailError && !passwordError;

  const isRegisterFormValid =
    name.trim() &&
    email.trim() &&
    password.trim() &&
    confirmPassword.trim() &&
    !nameError &&
    !emailError &&
    !passwordError &&
    !confirmPasswordError;

  const isFormValid = isRegisterMode ? isRegisterFormValid : isLoginFormValid;

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={ColorUtils.getThemeColor(
          Colors.backgroundPrimary,
          Colors.backgroundPrimaryDark,
          isDarkMode
        )}
      />

      {/* Botão Voltar */}
      {navigation && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Icon
            name="arrow-left"
            size={24}
            color={ColorUtils.getThemeColor(
              Colors.textPrimary,
              Colors.textPrimaryDark,
              isDarkMode
            )}
          />
        </TouchableOpacity>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Logo */}
            <View style={styles.logoContainer}>
              <View style={styles.logoIcon}>
                <Icon
                  name="hiking"
                  size={80}
                  color={Colors.verdeFlorestaProfundo}
                />
              </View>
              <Text style={styles.logoText}>TrekSafe</Text>
              <Text style={styles.logoSubtext}>
                {isRegisterMode
                  ? 'Junte-se à comunidade'
                  : 'Explore com segurança'}
              </Text>
            </View>

            {/* Toggle de Modo */}
            <View style={styles.modeToggleContainer}>
              <TouchableOpacity
                style={[
                  styles.modeToggleButton,
                  !isRegisterMode && styles.modeToggleButtonActive,
                ]}
                onPress={() => !isRegisterMode || toggleMode()}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.modeToggleText,
                    !isRegisterMode && styles.modeToggleTextActive,
                  ]}
                >
                  Entrar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modeToggleButton,
                  isRegisterMode && styles.modeToggleButtonActive,
                ]}
                onPress={() => isRegisterMode || toggleMode()}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.modeToggleText,
                    isRegisterMode && styles.modeToggleTextActive,
                  ]}
                >
                  Criar Conta
                </Text>
              </TouchableOpacity>
            </View>

            {/* Formulário */}
            <View style={styles.formContainer}>
              {/* Campo Nome (apenas no registro) */}
              {isRegisterMode && (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Nome Completo</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      nameError && styles.inputWrapperError,
                    ]}
                  >
                    <Icon
                      name="account-outline"
                      size={20}
                      color={
                        nameError
                          ? Colors.errorRed
                          : ColorUtils.getThemeColor(
                              Colors.gray500,
                              Colors.gray400,
                              isDarkMode
                            )
                      }
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      value={name}
                      onChangeText={handleNameChange}
                      placeholder="Digite seu nome completo"
                      placeholderTextColor={ColorUtils.getThemeColor(
                        Colors.inputPlaceholder,
                        Colors.gray400,
                        isDarkMode
                      )}
                      autoCapitalize="words"
                      autoCorrect={false}
                      autoComplete="name"
                    />
                  </View>
                  {nameError ? (
                    <Text style={styles.errorText}>{nameError}</Text>
                  ) : null}
                </View>
              )}

              {/* Campo Email */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    emailError && styles.inputWrapperError,
                  ]}
                >
                  <Icon
                    name="email-outline"
                    size={20}
                    color={
                      emailError
                        ? Colors.errorRed
                        : ColorUtils.getThemeColor(
                            Colors.gray500,
                            Colors.gray400,
                            isDarkMode
                          )
                    }
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    value={email}
                    onChangeText={handleEmailChange}
                    placeholder="Digite seu email"
                    placeholderTextColor={ColorUtils.getThemeColor(
                      Colors.inputPlaceholder,
                      Colors.gray400,
                      isDarkMode
                    )}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                  />
                </View>
                {emailError ? (
                  <Text style={styles.errorText}>{emailError}</Text>
                ) : null}
              </View>

              {/* Campo Senha */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Senha</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    passwordError && styles.inputWrapperError,
                  ]}
                >
                  <Icon
                    name="lock-outline"
                    size={20}
                    color={
                      passwordError
                        ? Colors.errorRed
                        : ColorUtils.getThemeColor(
                            Colors.gray500,
                            Colors.gray400,
                            isDarkMode
                          )
                    }
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    value={password}
                    onChangeText={handlePasswordChange}
                    placeholder={
                      isRegisterMode
                        ? 'Crie uma senha (min. 6 caracteres)'
                        : 'Digite sua senha'
                    }
                    placeholderTextColor={ColorUtils.getThemeColor(
                      Colors.inputPlaceholder,
                      Colors.gray400,
                      isDarkMode
                    )}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="password"
                  />
                  <TouchableOpacity
                    style={styles.passwordToggle}
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.7}
                  >
                    <Icon
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={ColorUtils.getThemeColor(
                        Colors.gray500,
                        Colors.gray400,
                        isDarkMode
                      )}
                    />
                  </TouchableOpacity>
                </View>
                {passwordError ? (
                  <Text style={styles.errorText}>{passwordError}</Text>
                ) : null}
              </View>

              {/* Campo Confirmar Senha (apenas no registro) */}
              {isRegisterMode && (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Confirmar Senha</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      confirmPasswordError && styles.inputWrapperError,
                    ]}
                  >
                    <Icon
                      name="lock-check-outline"
                      size={20}
                      color={
                        confirmPasswordError
                          ? Colors.errorRed
                          : ColorUtils.getThemeColor(
                              Colors.gray500,
                              Colors.gray400,
                              isDarkMode
                            )
                      }
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      value={confirmPassword}
                      onChangeText={handleConfirmPasswordChange}
                      placeholder="Confirme sua senha"
                      placeholderTextColor={ColorUtils.getThemeColor(
                        Colors.inputPlaceholder,
                        Colors.gray400,
                        isDarkMode
                      )}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="password"
                    />
                    <TouchableOpacity
                      style={styles.passwordToggle}
                      onPress={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      activeOpacity={0.7}
                    >
                      <Icon
                        name={
                          showConfirmPassword
                            ? 'eye-off-outline'
                            : 'eye-outline'
                        }
                        size={20}
                        color={ColorUtils.getThemeColor(
                          Colors.gray500,
                          Colors.gray400,
                          isDarkMode
                        )}
                      />
                    </TouchableOpacity>
                  </View>
                  {confirmPasswordError ? (
                    <Text style={styles.errorText}>{confirmPasswordError}</Text>
                  ) : null}
                </View>
              )}
            </View>

            {/* Botão Principal */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                (!isFormValid || isLoading) && styles.loginButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!isFormValid || isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <Icon name="loading" size={20} color={Colors.white} />
                  <Text style={styles.loadingText}>
                    {isRegisterMode ? 'Criando conta...' : 'Entrando...'}
                  </Text>
                </View>
              ) : (
                <Text
                  style={[
                    styles.loginButtonText,
                    !isFormValid && styles.loginButtonTextDisabled,
                  ]}
                >
                  {isRegisterMode ? 'Criar Conta' : 'Entrar'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Esqueci a senha (apenas no modo login) */}
            {!isRegisterMode && (
              <TouchableOpacity
                style={styles.forgotPasswordButton}
                onPress={handleForgotPassword}
                activeOpacity={0.8}
              >
                <Text style={styles.forgotPasswordText}>
                  Esqueci minha senha
                </Text>
              </TouchableOpacity>
            )}

            {/* Texto de alternativa */}
            <View style={styles.alternativeContainer}>
              <Text style={styles.alternativeText}>
                {isRegisterMode ? 'Já tem uma conta?' : 'Não tem uma conta?'}
              </Text>
              <TouchableOpacity
                onPress={toggleMode}
                activeOpacity={0.8}
                style={styles.alternativeButton}
              >
                <Text style={styles.alternativeButtonText}>
                  {isRegisterMode ? 'Fazer login' : 'Criar conta'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Termos (apenas no registro) */}
            {isRegisterMode && (
              <View style={styles.termsContainer}>
                <Text style={styles.termsText}>
                  Ao criar uma conta, você concorda com nossos{' '}
                  <Text style={styles.termsLink}>Termos de Uso</Text> e{' '}
                  <Text style={styles.termsLink}>Política de Privacidade</Text>.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default LoginScreen;
