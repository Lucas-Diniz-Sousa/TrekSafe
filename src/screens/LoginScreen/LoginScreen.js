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
import { useAuth } from '../../contexts/AuthContext';

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
  const { login, recoverPassword, authState } = useAuth();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleEmailChange = (text) => {
    setEmail(text);
    if (text && !validateEmail(text)) {
      setEmailError('Email inv·lido');
    } else {
      setEmailError('');
    }
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (text && !validatePassword(text)) {
      setPasswordError('Senha deve ter pelo menos 6 caracteres');
    } else {
      setPasswordError('');
    }
  };

  const handleLogin = async () => {
    if (!isFormValid) return;

    setIsLoading(true);

    try {
      await login(email, password);
      
      Alert.alert(
        'Login realizado!',
        'Bem-vindo ao TrekSafe!',
        [
          {
            text: 'OK',
            onPress: () => {
              if (onLoginSuccess) {
                onLoginSuccess();
              } else if (navigation) {
                navigation.navigate('MapScreen');
              }
            }
          }
        ]
      );
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

  const handleForgotPassword = () => {
    if (!email.trim()) {
      Alert.alert(
        'Email necess·rio',
        'Digite seu email no campo acima para recuperar a senha.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert(
        'Email inv·lido',
        'Digite um email v·lido para recuperar a senha.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Esqueci minha senha',
      'Um link de recuperaÁ„o ser· enviado para seu email.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Enviar', 
          onPress: async () => {
             try {
               await recoverPassword(email);
               Alert.alert(
                 'Email enviado!', 
                 'Verifique sua caixa de entrada e siga as instruÁıes para redefinir sua senha.'
               );
             } catch (error) {
               Alert.alert(
                 'Erro',
                 error.message || 'Erro ao enviar email de recuperaÁ„o. Tente novamente.',
                 [{ text: 'OK' }]
               );
             }
           }
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
      
      {/* Bot√£o Voltar */}
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
                Explore com seguran√ßa
              </Text>
            </View>

            {/* Formul√°rio */}
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

            {/* Bot√£o Login */}
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