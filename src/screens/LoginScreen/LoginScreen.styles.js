// src/screens/LoginScreen/LoginScreen.styles.js
import { Dimensions, StyleSheet } from 'react-native';
import { Colors } from '../../theme/theme';

const { width, height } = Dimensions.get('window');

export const createStyles = isDarkMode =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? '#0a0a0a' : '#1a2f3a',
    },

    // Background com gradiente natural de montanha
    backgroundGradient: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      backgroundColor: isDarkMode ? '#0a0a0a' : '#1a2f3a',
      background: isDarkMode
        ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)'
        : 'linear-gradient(135deg, #1a2f3a 0%, #2d5a87 50%, #4a90a4 100%)',
    },

    // Montanhas no background
    mountainContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: height * 0.4,
      zIndex: 1,
    },

    mountain1: {
      position: 'absolute',
      bottom: 0,
      left: -50,
      width: width * 0.6,
      height: height * 0.25,
      backgroundColor: isDarkMode
        ? 'rgba(255, 255, 255, 0.03)'
        : 'rgba(255, 255, 255, 0.08)',
      transform: [{ skewX: '-15deg' }],
      borderTopLeftRadius: 100,
      borderTopRightRadius: 80,
    },

    mountain2: {
      position: 'absolute',
      bottom: 0,
      right: -30,
      width: width * 0.5,
      height: height * 0.2,
      backgroundColor: isDarkMode
        ? 'rgba(255, 255, 255, 0.02)'
        : 'rgba(255, 255, 255, 0.06)',
      transform: [{ skewX: '10deg' }],
      borderTopLeftRadius: 60,
      borderTopRightRadius: 120,
    },

    mountain3: {
      position: 'absolute',
      bottom: 0,
      left: width * 0.3,
      width: width * 0.4,
      height: height * 0.15,
      backgroundColor: isDarkMode
        ? 'rgba(255, 255, 255, 0.025)'
        : 'rgba(255, 255, 255, 0.04)',
      transform: [{ skewX: '5deg' }],
      borderTopLeftRadius: 40,
      borderTopRightRadius: 60,
    },

    // Nuvens animadas
    cloudsContainer: {
      position: 'absolute',
      top: height * 0.1,
      left: 0,
      right: 0,
      height: height * 0.3,
      zIndex: 1,
    },

    cloud1: {
      position: 'absolute',
      top: '20%',
      left: '10%',
      width: 80,
      height: 30,
      backgroundColor: isDarkMode
        ? 'rgba(255, 255, 255, 0.02)'
        : 'rgba(255, 255, 255, 0.1)',
      borderRadius: 15,
    },

    cloud2: {
      position: 'absolute',
      top: '40%',
      right: '15%',
      width: 60,
      height: 25,
      backgroundColor: isDarkMode
        ? 'rgba(255, 255, 255, 0.015)'
        : 'rgba(255, 255, 255, 0.08)',
      borderRadius: 12,
    },

    cloud3: {
      position: 'absolute',
      top: '10%',
      right: '30%',
      width: 40,
      height: 20,
      backgroundColor: isDarkMode
        ? 'rgba(255, 255, 255, 0.01)'
        : 'rgba(255, 255, 255, 0.06)',
      borderRadius: 10,
    },

    backButtonContainer: {
      position: 'absolute',
      top: 50,
      left: 20,
      zIndex: 1000,
    },

    backButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },

    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: 24,
      paddingVertical: 60,
      zIndex: 2,
    },

    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },

    logoContainer: {
      alignItems: 'center',
      marginBottom: 50,
    },

    logoWrapper: {
      position: 'relative',
      marginBottom: 24,
    },

    logoImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: 'transparent',
    },

    logoFallback: {
      width: 120,
      height: 120,
      justifyContent: 'center',
      alignItems: 'center',
    },

    logoCircle: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: '#2d5a87',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: Colors.black,
      shadowOffset: { width: 0, height: 15 },
      shadowOpacity: 0.4,
      shadowRadius: 25,
      elevation: 15,
      borderWidth: 3,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },

    logoGlow: {
      position: 'absolute',
      top: -10,
      left: -10,
      right: -10,
      bottom: -10,
      borderRadius: 70,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      zIndex: -1,
    },

    logoText: {
      fontSize: 42,
      fontWeight: '800',
      color: Colors.white,
      marginBottom: 8,
      textShadowColor: 'rgba(0, 0, 0, 0.5)',
      textShadowOffset: { width: 0, height: 3 },
      textShadowRadius: 6,
      letterSpacing: 1,
    },

    logoSubtext: {
      fontSize: 16,
      color: 'rgba(255, 255, 255, 0.85)',
      textAlign: 'center',
      maxWidth: 300,
      lineHeight: 24,
      fontWeight: '400',
    },

    cardContainer: {
      width: '100%',
      maxWidth: 420,
      backgroundColor: isDarkMode
        ? 'rgba(255, 255, 255, 0.08)'
        : 'rgba(255, 255, 255, 0.95)',
      borderRadius: 28,
      padding: 32,
      shadowColor: Colors.black,
      shadowOffset: { width: 0, height: 25 },
      shadowOpacity: 0.3,
      shadowRadius: 35,
      elevation: 20,
      borderWidth: 1,
      borderColor: isDarkMode
        ? 'rgba(255, 255, 255, 0.1)'
        : 'rgba(255, 255, 255, 0.8)',
    },

    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 32,
    },

    cardHeaderLine: {
      flex: 1,
      height: 1,
      backgroundColor: isDarkMode
        ? 'rgba(255, 255, 255, 0.1)'
        : 'rgba(0, 0, 0, 0.1)',
    },

    cardHeaderText: {
      fontSize: 18,
      fontWeight: '600',
      color: isDarkMode ? Colors.white : Colors.gray700,
      marginHorizontal: 16,
    },

    modeToggleContainer: {
      flexDirection: 'row',
      backgroundColor: isDarkMode
        ? 'rgba(255, 255, 255, 0.05)'
        : 'rgba(0, 0, 0, 0.03)',
      borderRadius: 16,
      padding: 6,
      marginBottom: 28,
    },

    modeToggleButton: {
      flex: 1,
      paddingVertical: 14,
      paddingHorizontal: 16,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      flexDirection: 'row',
    },

    modeToggleButtonActive: {
      backgroundColor: '#2d5a87',
      shadowColor: Colors.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 6,
    },

    modeToggleIcon: {
      marginRight: 8,
    },

    modeToggleText: {
      fontSize: 15,
      fontWeight: '600',
      color: isDarkMode ? Colors.gray300 : Colors.gray600,
    },

    modeToggleTextActive: {
      color: Colors.white,
    },

    formContainer: {
      marginBottom: 28,
    },

    inputContainer: {
      marginBottom: 24,
    },

    inputLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: isDarkMode ? Colors.white : Colors.gray700,
      marginBottom: 10,
      flexDirection: 'row',
      alignItems: 'center',
    },

    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : Colors.white,
      borderRadius: 16,
      paddingHorizontal: 20,
      paddingVertical: 4,
      borderWidth: 1.5,
      borderColor: isDarkMode
        ? 'rgba(255, 255, 255, 0.15)'
        : 'rgba(0, 0, 0, 0.08)',
      shadowColor: Colors.black,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 3,
      minHeight: 60,
    },

    inputWrapperError: {
      borderColor: Colors.errorRed,
      borderWidth: 2,
    },

    inputIcon: {
      marginRight: 16,
    },

    textInput: {
      flex: 1,
      paddingVertical: 20,
      fontSize: 16,
      color: isDarkMode ? Colors.white : Colors.gray800,
      fontWeight: '400',
    },

    passwordToggle: {
      padding: 12,
    },

    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
      paddingHorizontal: 4,
    },

    errorText: {
      fontSize: 12,
      color: Colors.errorRed,
      marginLeft: 6,
      fontWeight: '500',
    },

    buttonContainer: {
      marginBottom: 20,
    },

    loginButton: {
      borderRadius: 16,
      overflow: 'hidden',
      shadowColor: Colors.black,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 8,
      minHeight: 60,
    },

    buttonGradient: {
      backgroundColor: '#2d5a87',
      paddingVertical: 20,
      paddingHorizontal: 32,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 60,
    },

    buttonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },

    buttonIcon: {
      marginRight: 12,
    },

    loginButtonText: {
      fontSize: 18,
      fontWeight: '700',
      color: Colors.white,
      letterSpacing: 0.5,
    },

    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },

    loadingSpinner: {
      marginRight: 12,
    },

    loadingText: {
      fontSize: 16,
      fontWeight: '600',
      color: Colors.white,
    },

    forgotPasswordButton: {
      alignItems: 'center',
      paddingVertical: 16,
      marginBottom: 24,
      flexDirection: 'row',
      justifyContent: 'center',
    },

    forgotPasswordText: {
      fontSize: 14,
      color: isDarkMode ? Colors.blue300 : Colors.blue600,
      fontWeight: '500',
      marginLeft: 6,
    },

    alternativeContainer: {
      alignItems: 'center',
      marginBottom: 24,
    },

    dividerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
      width: '100%',
    },

    divider: {
      flex: 1,
      height: 1,
      backgroundColor: isDarkMode
        ? 'rgba(255, 255, 255, 0.1)'
        : 'rgba(0, 0, 0, 0.1)',
    },

    dividerText: {
      fontSize: 14,
      color: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : Colors.gray500,
      marginHorizontal: 16,
      fontWeight: '500',
    },

    alternativeButton: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      backgroundColor: isDarkMode
        ? 'rgba(255, 255, 255, 0.05)'
        : 'rgba(0, 0, 0, 0.02)',
    },

    alternativeIcon: {
      marginRight: 8,
    },

    alternativeButtonText: {
      fontSize: 15,
      color: isDarkMode ? Colors.blue300 : Colors.blue600,
      fontWeight: '600',
    },

    termsContainer: {
      paddingTop: 20,
      borderTopWidth: 1,
      borderTopColor: isDarkMode
        ? 'rgba(255, 255, 255, 0.1)'
        : 'rgba(0, 0, 0, 0.1)',
      flexDirection: 'row',
      alignItems: 'flex-start',
    },

    termsText: {
      fontSize: 12,
      color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : Colors.gray500,
      textAlign: 'center',
      lineHeight: 18,
      marginLeft: 8,
      flex: 1,
    },

    termsLink: {
      color: isDarkMode ? Colors.blue300 : Colors.blue600,
      fontWeight: '600',
      textDecorationLine: 'underline',
    },

    // Estados específicos
    loginButtonDisabled: {
      opacity: 0.6,
    },

    loginButtonTextDisabled: {
      color: 'rgba(255, 255, 255, 0.7)',
    },
  });
