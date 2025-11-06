// src/components/MapControls/MapControls.styles.js
import { Dimensions, StyleSheet } from 'react-native';
import { Colors, ColorUtils } from '../../theme/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const createStyles = (isDarkMode, isRecording = false) =>
  StyleSheet.create({
    // ✅ BOTÃO DO MENU MELHORADO
    menuButton: {
      position: 'absolute',
      top: 60,
      left: 20,
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: ColorUtils.getThemeColor(
        Colors.backgroundSecondary + 'F0',
        Colors.backgroundSecondaryDark + 'F0',
        isDarkMode
      ),
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: Colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
      borderWidth: 1,
      borderColor: ColorUtils.getThemeColor(
        Colors.gray200,
        Colors.gray700,
        isDarkMode
      ),
    },
    menuButtonActive: {
      backgroundColor: Colors.blue500,
      transform: [{ scale: 1.05 }],
    },
    notificationBadge: {
      position: 'absolute',
      top: -4,
      right: -4,
      backgroundColor: Colors.errorRed,
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: Colors.white,
    },
    notificationBadgeText: {
      color: Colors.white,
      fontSize: 10,
      fontWeight: 'bold',
    },

    // ✅ INDICADOR DE STATUS MELHORADO
    statusIndicator: {
      position: 'absolute',
      top: 120,
      left: 20,
      right: 20,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
      shadowColor: Colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
    },
    statusContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    recordingDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: Colors.white,
      marginRight: 8,
    },
    statusText: {
      color: Colors.white,
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'center',
    },
    statusSubtext: {
      color: Colors.white,
      fontSize: 12,
      marginTop: 4,
      textAlign: 'center',
      opacity: 0.9,
    },

    // ✅ CONTROLES LATERAIS MELHORADOS
    controlsContainer: {
      position: 'absolute',
      top: 180,
      right: 20,
      gap: 12,
    },
    controlButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: Colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    zoomButton: {
      backgroundColor: ColorUtils.getThemeColor(
        Colors.gray600,
        Colors.gray700,
        isDarkMode
      ),
    },
    publicTrailsButton: {
      position: 'relative',
    },
    locationButton: {
      backgroundColor: Colors.blue500,
    },
    disabledButton: {
      opacity: 0.5,
      shadowOpacity: 0.1,
      elevation: 2,
    },

    // ✅ BOTÃO DE GRAVAÇÃO CENTRAL MELHORADO
    recordingContainer: {
      position: 'absolute',
      bottom: 40,
      alignSelf: 'center',
      alignItems: 'center',
    },
    recordButton: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: Colors.errorRed,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: Colors.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 8,
      marginBottom: 8,
      borderWidth: 4,
      borderColor: Colors.white,
    },
    recordButtonActive: {
      backgroundColor: Colors.orange500,
      transform: [{ scale: 1.1 }],
    },
    recordButtonSaving: {
      backgroundColor: Colors.gray500,
      transform: [{ scale: 1 }],
    },
    recordingLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: ColorUtils.getThemeColor(
        Colors.textPrimary,
        Colors.textPrimaryDark,
        isDarkMode
      ),
      textAlign: 'center',
      backgroundColor: ColorUtils.getThemeColor(
        Colors.white + 'E6',
        Colors.gray800 + 'E6',
        isDarkMode
      ),
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },

    // ✅ MODAL MELHORADO
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-start',
    },
    modalContent: {
      width: screenWidth * 0.8,
      height: screenHeight,
      backgroundColor: ColorUtils.getThemeColor(
        Colors.backgroundPrimary,
        Colors.backgroundPrimaryDark,
        isDarkMode
      ),
      shadowColor: Colors.black,
      shadowOffset: { width: 2, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 10,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      paddingTop: 60,
      borderBottomWidth: 1,
      borderBottomColor: ColorUtils.getThemeColor(
        Colors.gray200,
        Colors.gray700,
        isDarkMode
      ),
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: ColorUtils.getThemeColor(
        Colors.textPrimary,
        Colors.textPrimaryDark,
        isDarkMode
      ),
    },
    modalCloseButton: {
      padding: 4,
    },

    // ✅ STATUS DE AUTENTICAÇÃO MELHORADO
    authStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      margin: 20,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: ColorUtils.getThemeColor(
        Colors.gray200,
        Colors.gray700,
        isDarkMode
      ),
    },
    authStatusIcon: {
      marginRight: 12,
    },
    authStatusInfo: {
      flex: 1,
    },
    authStatusText: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 2,
    },
    authStatusSubtext: {
      fontSize: 12,
      color: ColorUtils.getThemeColor(
        Colors.textMuted,
        Colors.textMutedDark,
        isDarkMode
      ),
    },

    // ✅ OPÇÕES DO MENU MELHORADAS
    menuOptions: {
      flex: 1,
      paddingHorizontal: 20,
    },
    menuOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 16,
      marginBottom: 8,
      borderRadius: 12,
      backgroundColor: ColorUtils.getThemeColor(
        Colors.backgroundSecondary,
        Colors.backgroundSecondaryDark,
        isDarkMode
      ),
      borderWidth: 1,
      borderColor: ColorUtils.getThemeColor(
        Colors.gray200,
        Colors.gray700,
        isDarkMode
      ),
    },
    menuOptionIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    menuOptionContent: {
      flex: 1,
    },
    menuOptionText: {
      fontSize: 16,
      fontWeight: '500',
      color: ColorUtils.getThemeColor(
        Colors.textPrimary,
        Colors.textPrimaryDark,
        isDarkMode
      ),
      marginBottom: 2,
    },
    menuOptionSubtext: {
      fontSize: 12,
      color: ColorUtils.getThemeColor(
        Colors.textMuted,
        Colors.textMutedDark,
        isDarkMode
      ),
    },
    trailsBadge: {
      backgroundColor: Colors.successGreen,
      borderRadius: 12,
      minWidth: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 8,
    },
    trailsBadgeText: {
      color: Colors.white,
      fontSize: 12,
      fontWeight: 'bold',
    },

    // ✅ FOOTER DO MODAL
    modalFooter: {
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: ColorUtils.getThemeColor(
        Colors.gray200,
        Colors.gray700,
        isDarkMode
      ),
    },
    closeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      backgroundColor: ColorUtils.getThemeColor(
        Colors.gray100,
        Colors.gray800,
        isDarkMode
      ),
    },
    closeButtonText: {
      fontSize: 14,
      fontWeight: '500',
      color: Colors.gray500,
      marginLeft: 8,
    },
  });
