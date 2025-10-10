// src/screens/LoginScreen/LoginScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  useColorScheme,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, ColorUtils } from '../../theme/theme';
import { createStyles } from './LoginScreen.styles';

const LoginScreen = ({ navigation, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const styles = createStyles(isDarkMode);

  // Credenciais válidas
  const VALID_EMAIL = 'slucasdiniz@gmail.com';
  const VALID_PASSWORD = '123';

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (text) => {
    setEmail(text);
    if (emailError) setEmailError('');
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (passwordError) setPasswordError('');
  };

  const handleLogin = async () => {
    // Reset errors
    setEmailError('');
    setPasswordError('');

    // Validações
    let hasError = false;

    if (!email.trim()) {
      setEmailError('Email é obrigatório');
      hasError = true;
    } else if (!validateEmail(email)) {
      setEmailError('Email inválido');
      hasError = true;
    } else if (email !== VALID_EMAIL) {
      setEmailError('Email não encontrado');
      hasError = true;
    }

    if (!password.trim()) {
      setPasswordError('Senha é obrigatória');
      hasError = true;
    } else if (password !== VALID_PASSWORD) {
      setPasswordError('Senha incorreta');
      hasError = true;
    }

    if (hasError) return;

    setIsLoading(true);

    // Simular delay de autenticação
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Login realizado!',
        'Bem-vindo ao TrekSafe!',
        [
          {
            text: 'Continuar',
            onPress: () => {
              if (onLoginSuccess) {
                onLoginSuccess({ email, name: 'Lucas Diniz' });
              }
              if (navigation) {
                navigation.goBack();
              }
            }
          }
        ]
      );
    }, 1500);
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Esqueci minha senha',
      'Um link de recuperação será enviado para seu email.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Enviar', 
          onPress: () => Alert.alert('Email enviado!', 'Verifique sua caixa de entrada.') 
        }
      ]
    );
  };

  const isFormValid = email.trim() && password.trim() && !emailError && !passwordError;

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={ColorUtils.getThemeColor(Colors.backgroundPrimary, Colors.backgroundPrimaryDark, isDarkMode)}
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
            color={ColorUtils.getThemeColor(Colors.textPrimary, Colors.textPrimaryDark, isDarkMode)} 
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
                Explore com segurança
              </Text>
            </View>

            {/* Formulário */}
            <View style={styles.formContainer}>
              {/* Campo Email */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <View style={[
                  styles.inputWrapper,
                  emailError && styles.inputWrapperError,
                ]}>
                  <Icon 
                    name="email-outline" 
                    size={20} 
                    color={emailError 
                      ? Colors.errorRed 
                      : ColorUtils.getThemeColor(Colors.gray500, Colors.gray400, isDarkMode)
                    }
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    value={email}
                    onChangeText={handleEmailChange}
                    placeholder="Digite seu email"
                    placeholderTextColor={ColorUtils.getThemeColor(Colors.inputPlaceholder, Colors.gray400, isDarkMode)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                  />
                </View>
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
              </View>

              {/* Campo Senha */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Senha</Text>
                <View style={[
                  styles.inputWrapper,
                  passwordError && styles.inputWrapperError,
                ]}>
                  <Icon 
                    name="lock-outline" 
                    size={20} 
                    color={passwordError 
                      ? Colors.errorRed 
                      : ColorUtils.getThemeColor(Colors.gray500, Colors.gray400, isDarkMode)
                    }
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    value={password}
                    onChangeText={handlePasswordChange}
                    placeholder="Digite sua senha"
                    placeholderTextColor={ColorUtils.getThemeColor(Colors.inputPlaceholder, Colors.gray400, isDarkMode)}
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
                      name={showPassword ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color={ColorUtils.getThemeColor(Colors.gray500, Colors.gray400, isDarkMode)}
                    />
                  </TouchableOpacity>
                </View>
                {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
              </View>
            </View>

            {/* Botão Login */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                (!isFormValid || isLoading) && styles.loginButtonDisabled
              ]}
              onPress={handleLogin}
              disabled={!isFormValid || isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <Icon name="loading" size={20} color={Colors.white} />
                  <Text style={styles.loadingText}>Entrando...</Text>
                </View>
              ) : (
                <Text style={[
                  styles.loginButtonText,
                  !isFormValid && styles.loginButtonTextDisabled
                ]}>
                  Entrar
                </Text>
              )}
            </TouchableOpacity>

            {/* Esqueci a senha */}
            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={handleForgotPassword}
              activeOpacity={0.8}
            >
              <Text style={styles.forgotPasswordText}>
                Esqueci minha senha
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default LoginScreen;