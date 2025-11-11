// src/components/MapControls/MapControls.styles.js
import { Platform, StatusBar, StyleSheet } from 'react-native';
import { Colors, ColorUtils } from '../../theme/theme';

export const createStyles = isDarkMode => {
  const themedColors = {
    background: ColorUtils.getThemeColor(
      Colors.backgroundPrimary,
      Colors.backgroundPrimaryDark,
      isDarkMode
    ),
    backgroundSecondary: ColorUtils.getThemeColor(
      Colors.backgroundSecondary,
      Colors.backgroundSecondaryDark,
      isDarkMode
    ),
    text: ColorUtils.getThemeColor(
      Colors.textPrimary,
      Colors.textPrimaryDark,
      isDarkMode
    ),
    textMuted: ColorUtils.getThemeColor(
      Colors.textMuted,
      Colors.textMutedDark,
      isDarkMode
    ),
    border: ColorUtils.getThemeColor(
      Colors.gray300,
      Colors.gray600,
      isDarkMode
    ),
    shadow: isDarkMode ? Colors.shadowDark : Colors.shadowMedium,
    overlay: isDarkMode
      ? Colors.overlayBackground
      : Colors.overlayBackgroundLight,
  };

  return StyleSheet.create({
    // ========== CONTROLES PRINCIPAIS ==========
    rightControls: {
      position: 'absolute',
      right: 16,
      alignItems: 'center',
      zIndex: 1000,
      top: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight + 20,
    },
    controlButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      backgroundColor: themedColors.background,
      borderColor: themedColors.border,
      shadowColor: themedColors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    disabledButton: {
      opacity: 0.5,
    },
    badge: {
      position: 'absolute',
      top: -4,
      right: -4,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: Colors.errorRed,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 4,
    },
    badgeText: {
      color: Colors.white,
      fontSize: 10,
      fontWeight: '600',
    },

    // ========== CONTROLES INFERIORES ==========
    bottomControls: {
      position: 'absolute',
      bottom: Platform.OS === 'ios' ? 40 : 20,
      left: 16,
      right: 16,
      flexDirection: 'row',
      alignItems: 'center',
      zIndex: 1000,
    },
    infoPanel: {
      flex: 1,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 25,
      borderWidth: 1,
      marginRight: 12,
      backgroundColor: themedColors.background,
      borderColor: themedColors.border,
      shadowColor: themedColors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
      justifyContent: 'center',
    },
    recordButton: {
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 8,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 8,
    },
    menuButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      marginLeft: 12,
      backgroundColor: themedColors.background,
      borderColor: themedColors.border,
      shadowColor: themedColors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },

    // ========== STATUS ==========
    recordingStatus: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    recordingDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: Colors.errorRed,
      marginRight: 8,
    },
    recordingText: {
      fontSize: 14,
      fontWeight: '600',
      color: Colors.errorRed,
    },
    savingStatus: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    savingText: {
      fontSize: 14,
      marginLeft: 8,
      color: themedColors.text,
    },
    loadingStatus: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 14,
      marginLeft: 8,
      color: themedColors.text,
    },
    normalStatus: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statusText: {
      fontSize: 14,
      marginLeft: 8,
      color: themedColors.text,
    },
    separator: {
      fontSize: 14,
      marginHorizontal: 8,
      color: themedColors.textMuted,
    },

    // ========== PAINÉIS EXPANDIDOS ==========
    expandedPanel: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? 120 : StatusBar.currentHeight + 80,
      left: 16,
      right: 16,
      borderRadius: 16,
      borderWidth: 1,
      backgroundColor: themedColors.background,
      borderColor: themedColors.border,
      shadowColor: themedColors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 10,
      zIndex: 2000,
    },
    panelHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: themedColors.border,
    },
    panelTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: themedColors.text,
    },
    closeButton: {
      padding: 4,
    },
    panelContent: {
      padding: 16,
    },

    // ========== ESTATÍSTICAS ==========
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    statLabel: {
      flex: 1,
      fontSize: 14,
      marginLeft: 12,
      color: themedColors.textMuted,
    },
    statValue: {
      fontSize: 14,
      fontWeight: '600',
    },

    // ========== BOTÕES DE AÇÃO ==========
    actionButtonsRow: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 16,
      flexWrap: 'wrap',
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      borderWidth: 1,
    },
    actionButtonText: {
      fontSize: 14,
      fontWeight: '500',
      marginLeft: 8,
    },

    // ========== LOGIN/MENU ==========
    loginPrompt: {
      alignItems: 'center',
      marginBottom: 20,
    },
    loginTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginTop: 12,
      marginBottom: 8,
      color: themedColors.text,
    },
    loginSubtitle: {
      fontSize: 14,
      textAlign: 'center',
      lineHeight: 20,
      color: themedColors.textMuted,
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    userText: {
      fontSize: 16,
      fontWeight: '500',
      marginLeft: 12,
      color: themedColors.text,
    },

    // ========== OVERLAY ==========
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: themedColors.overlay,
      zIndex: 1500,
    },
  });
};
