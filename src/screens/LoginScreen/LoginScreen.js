// src/screens/LoginScreen/LoginScreen.js
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
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

const { width, height } = Dimensions.get('window');

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

  // Estado para controle da imagem
  const [imageError, setImageError] = useState(false);

  // Animações simplificadas
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const formSlideAnim = useRef(new Animated.Value(0)).current;

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const styles = createStyles(isDarkMode);
  const { login, register, recoverPassword, authState } = useAuth();

  // Animação inicial simplificada
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // Animação de transição entre modos
  const animateFormTransition = () => {
    Animated.sequence([
      Animated.timing(formSlideAnim, {
        toValue: isRegisterMode ? -10 : 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(formSlideAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Validações
  const validateEmail = email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = password => {
    return password.length >= 6;
  };

  const validateName = name => {
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
    animateFormTransition();
    setIsRegisterMode(!isRegisterMode);
    setNameError('');
    setConfirmPasswordError('');
    if (!isRegisterMode) {
      setName('');
      setConfirmPassword('');
    }
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

  // Handle Register
  const handleRegister = async () => {
    if (!isRegisterFormValid) return;

    setIsLoading(true);

    try {
      const result = await register({
        name: name.trim(),
        email: email.trim(),
        password: password,
      });

      if (result.success) {
        Alert.alert(
          'Conta criada!',
          'Sua conta foi criada com sucesso. Bem-vindo ao TrekSafe!',
          [
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
      Alert.alert(
        'Erro no registro',
        error.message || 'Erro ao criar conta. Tente novamente.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle principal
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
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Background simplificado */}
      <View style={styles.backgroundGradient} />

      {/* Elementos decorativos simplificados */}
      <View style={styles.decorativeElements}>
        <View style={styles.mountain1} />
        <View style={styles.mountain2} />
      </View>

      {/* Botão Voltar
      {navigation && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Icon name="arrow-left" size={24} color={Colors.white} />
        </TouchableOpacity>
      )} */}

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
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            {/* Logo Section Compacta */}
            <View style={styles.logoContainer}>
              <View style={styles.logoWrapper}>
                {!imageError ? (
                  <Image
                    source={require('../../img/Logo.png')}
                    style={styles.logoImage}
                    resizeMode="contain"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <View style={styles.logoFallback}>
                    <Icon name="mountain" size={40} color={Colors.white} />
                  </View>
                )}
              </View>

              <Text style={styles.logoText}>TrekSafe</Text>
              <Text style={styles.logoSubtext}>
                {isRegisterMode
                  ? 'Comece sua jornada'
                  : 'Descubra trilhas incríveis'}
              </Text>
            </View>

            {/* Card Container Compacto */}
            <Animated.View
              style={[
                styles.cardContainer,
                {
                  transform: [{ translateY: formSlideAnim }],
                },
              ]}
            >
              {/* Mode Toggle */}
              <View style={styles.modeToggleContainer}>
                <TouchableOpacity
                  style={[
                    styles.modeToggleButton,
                    !isRegisterMode && styles.modeToggleButtonActive,
                  ]}
                  onPress={() => !isRegisterMode || toggleMode()}
                  activeOpacity={0.8}
                >
                  <Icon
                    name="login"
                    size={16}
                    color={
                      !isRegisterMode
                        ? Colors.white
                        : isDarkMode
                        ? Colors.gray300
                        : Colors.gray600
                    }
                    style={styles.modeToggleIcon}
                  />
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
                  <Icon
                    name="account-plus"
                    size={16}
                    color={
                      isRegisterMode
                        ? Colors.white
                        : isDarkMode
                        ? Colors.gray300
                        : Colors.gray600
                    }
                    style={styles.modeToggleIcon}
                  />
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

              {/* Form */}
              <View style={styles.formContainer}>
                {/* Campo Nome */}
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
                      <View style={styles.errorContainer}>
                        <Icon
                          name="alert-circle"
                          size={14}
                          color={Colors.errorRed}
                        />
                        <Text style={styles.errorText}>{nameError}</Text>
                      </View>
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
                    <View style={styles.errorContainer}>
                      <Icon
                        name="alert-circle"
                        size={14}
                        color={Colors.errorRed}
                      />
                      <Text style={styles.errorText}>{emailError}</Text>
                    </View>
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
                    <View style={styles.errorContainer}>
                      <Icon
                        name="alert-circle"
                        size={14}
                        color={Colors.errorRed}
                      />
                      <Text style={styles.errorText}>{passwordError}</Text>
                    </View>
                  ) : null}
                </View>

                {/* Campo Confirmar Senha */}
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
                      <View style={styles.errorContainer}>
                        <Icon
                          name="alert-circle"
                          size={14}
                          color={Colors.errorRed}
                        />
                        <Text style={styles.errorText}>
                          {confirmPasswordError}
                        </Text>
                      </View>
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
                <View style={styles.buttonContent}>
                  {isLoading ? (
                    <>
                      <Icon name="loading" size={18} color={Colors.white} />
                      <Text style={styles.loginButtonText}>
                        {isRegisterMode ? 'Criando...' : 'Entrando...'}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Icon
                        name={isRegisterMode ? 'account-plus' : 'hiking'}
                        size={18}
                        color={Colors.white}
                        style={styles.buttonIcon}
                      />
                      <Text style={styles.loginButtonText}>
                        {isRegisterMode ? 'Criar Conta' : 'Entrar'}
                      </Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>

              {/* Links de ação */}
              <View style={styles.actionsContainer}>
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

                <TouchableOpacity
                  onPress={toggleMode}
                  activeOpacity={0.8}
                  style={styles.alternativeButton}
                >
                  <Text style={styles.alternativeText}>
                    {isRegisterMode ? 'Já tem conta? ' : 'Não tem conta? '}
                    <Text style={styles.alternativeButtonText}>
                      {isRegisterMode ? 'Entrar' : 'Criar conta'}
                    </Text>
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Termos */}
              {isRegisterMode && (
                <View style={styles.termsContainer}>
                  <Text style={styles.termsText}>
                    Ao criar conta, você aceita nossos{' '}
                    <Text style={styles.termsLink}>Termos</Text> e{' '}
                    <Text style={styles.termsLink}>
                      Política de Privacidade
                    </Text>
                  </Text>
                </View>
              )}
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default LoginScreen;
