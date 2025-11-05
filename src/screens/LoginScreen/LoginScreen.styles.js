// src/screens/LoginScreen/LoginScreen.styles.js
import { Platform, StyleSheet } from 'react-native';
import { Colors, ColorUtils, Fonts } from '../../theme/theme';

export const createStyles = isDarkMode =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: ColorUtils.getThemeColor(
        Colors.backgroundPrimary,
        Colors.backgroundPrimaryDark,
        isDarkMode
      ),
    },
    scrollContainer: {
      flexGrow: 1,
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
      justifyContent: 'center',
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: 48,
    },
    logoIcon: {
      marginBottom: 16,
    },
    logoText: {
      fontSize: 32,
      fontWeight: 'bold',
      color: Colors.verdeFlorestaProfundo,
      fontFamily: Fonts.heading,
      textAlign: 'center',
    },
    logoSubtext: {
      fontSize: 16,
      color: ColorUtils.getThemeColor(
        Colors.textSecondary,
        Colors.textSecondaryDark,
        isDarkMode
      ),
      fontFamily: Fonts.body,
      textAlign: 'center',
      marginTop: 4,
    },
    formContainer: {
      marginBottom: 32,
    },
    inputContainer: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: ColorUtils.getThemeColor(
        Colors.textPrimary,
        Colors.textPrimaryDark,
        isDarkMode
      ),
      fontFamily: Fonts.bodyBold,
      marginBottom: 8,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: ColorUtils.getThemeColor(
        Colors.inputBackground,
        Colors.inputBackgroundDark,
        isDarkMode
      ),
      borderWidth: 1.5,
      borderColor: ColorUtils.getThemeColor(
        Colors.inputBorder,
        Colors.borderDark,
        isDarkMode
      ),
      borderRadius: 12,
      paddingHorizontal: 16,
      height: 52,
    },
    inputWrapperFocused: {
      borderColor: Colors.blue500,
      shadowColor: Colors.blue500,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 2,
    },
    inputWrapperError: {
      borderColor: Colors.errorRed,
    },
    inputIcon: {
      marginRight: 12,
    },
    textInput: {
      flex: 1,
      fontSize: 16,
      color: ColorUtils.getThemeColor(
        Colors.inputText,
        Colors.inputTextDark,
        isDarkMode
      ),
      fontFamily: Fonts.body,
    },
    passwordToggle: {
      padding: 4,
      marginLeft: 8,
    },
    errorText: {
      fontSize: 12,
      color: Colors.errorRed,
      fontFamily: Fonts.body,
      marginTop: 6,
      marginLeft: 4,
    },
    loginButton: {
      backgroundColor: Colors.verdeFlorestaProfundo,
      borderRadius: 12,
      height: 52,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
      elevation: 3,
      shadowColor: Colors.shadowMedium,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    loginButtonDisabled: {
      backgroundColor: ColorUtils.getThemeColor(
        Colors.gray300,
        Colors.gray600,
        isDarkMode
      ),
      elevation: 0,
      shadowOpacity: 0,
    },
    loginButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: Colors.white,
      fontFamily: Fonts.button,
    },
    loginButtonTextDisabled: {
      color: ColorUtils.getThemeColor(
        Colors.gray500,
        Colors.gray400,
        isDarkMode
      ),
    },
    forgotPasswordButton: {
      alignItems: 'center',
      paddingVertical: 12,
    },
    forgotPasswordText: {
      fontSize: 14,
      color: Colors.blue500,
      fontFamily: Fonts.body,
      textDecorationLine: 'underline',
    },
    // Adicionar aos estilos existentes:

    modeToggleContainer: {
      flexDirection: 'row',
      backgroundColor: ColorUtils.getThemeColor(
        Colors.gray100,
        Colors.gray800,
        isDarkMode
      ),
      borderRadius: 25,
      padding: 4,
      marginBottom: 30,
      marginHorizontal: 20,
    },

    modeToggleButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 20,
      alignItems: 'center',
    },

    modeToggleButtonActive: {
      backgroundColor: Colors.verdeFlorestaProfundo,
      shadowColor: Colors.verdeFlorestaProfundo,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },

    modeToggleText: {
      fontSize: 14,
      fontWeight: '600',
      color: ColorUtils.getThemeColor(
        Colors.gray600,
        Colors.gray400,
        isDarkMode
      ),
    },

    modeToggleTextActive: {
      color: Colors.white,
    },

    alternativeContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 10,
    },

    alternativeText: {
      fontSize: 14,
      color: ColorUtils.getThemeColor(
        Colors.gray600,
        Colors.gray400,
        isDarkMode
      ),
    },

    alternativeButton: {
      marginLeft: 5,
    },

    alternativeButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: Colors.verdeFlorestaProfundo,
    },

    termsContainer: {
      marginTop: 20,
      paddingHorizontal: 20,
    },

    termsText: {
      fontSize: 12,
      textAlign: 'center',
      lineHeight: 18,
      color: ColorUtils.getThemeColor(
        Colors.gray500,
        Colors.gray400,
        isDarkMode
      ),
    },

    termsLink: {
      color: Colors.verdeFlorestaProfundo,
      fontWeight: '600',
    },
    backButton: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? 50 : 30,
      left: 20,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: ColorUtils.getThemeColor(
        Colors.cardBackground,
        Colors.cardBackgroundDark,
        isDarkMode
      ),
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
      shadowColor: Colors.shadowMedium,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      zIndex: 1,
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    loadingText: {
      marginLeft: 8,
      fontSize: 16,
      fontWeight: '600',
      color: Colors.white,
      fontFamily: Fonts.button,
    },
  });
