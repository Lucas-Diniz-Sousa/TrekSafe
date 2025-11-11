// src/screens/MapScreen/MapScreen.styles.js
import { Dimensions, Platform, StatusBar, StyleSheet } from 'react-native';

const { width, height } = Dimensions.get('window');
const statusBarHeight =
  Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0;

export const createStyles = (isDarkMode, showMapTypeSelector = false) => {
  const colors = {
    // ========== CORES BASE ==========
    background: isDarkMode ? '#000000' : '#ffffff',
    backgroundSecondary: isDarkMode ? '#1a1a1a' : '#f8f9fa',
    backgroundTertiary: isDarkMode ? '#2a2a2a' : '#e9ecef',

    // ========== CORES DE TEXTO ==========
    text: isDarkMode ? '#ffffff' : '#212529',
    textMuted: isDarkMode ? '#adb5bd' : '#6c757d',
    textSecondary: isDarkMode ? '#dee2e6' : '#495057',
    textInverse: isDarkMode ? '#212529' : '#ffffff',

    // ========== CORES DE SUPERFÍCIE ==========
    surface: isDarkMode ? '#1e1e1e' : '#ffffff',
    surfaceElevated: isDarkMode ? '#2d2d2d' : '#f8f9fa',
    surfacePressed: isDarkMode ? '#3a3a3a' : '#e9ecef',

    // ========== CORES DE BORDA ==========
    border: isDarkMode ? '#343a40' : '#dee2e6',
    borderLight: isDarkMode ? '#495057' : '#f1f3f4',
    borderFocus: isDarkMode ? '#6c757d' : '#0d6efd',

    // ========== CORES DE SOMBRA ==========
    shadow: isDarkMode ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.15)',
    shadowStrong: isDarkMode ? 'rgba(0,0,0,0.95)' : 'rgba(0,0,0,0.25)',
    overlay: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)',

    // ========== CORES FUNCIONAIS ==========
    success: '#198754',
    successLight: '#d1e7dd',
    error: '#dc3545',
    errorLight: '#f8d7da',
    warning: '#fd7e14',
    warningLight: '#fff3cd',
    info: '#0dcaf0',
    infoLight: '#d1ecf1',

    // ========== CORES ESPECÍFICAS ==========
    primary: '#198754',
    primaryLight: '#20c997',
    secondary: '#0dcaf0',
    secondaryLight: '#6ea8fe',

    // ========== CORES DE STATUS ==========
    recording: '#dc3545',
    recordingBackground: 'rgba(220, 53, 69, 0.95)',
    offline: '#fd7e14',
    offlineBackground: 'rgba(253, 126, 20, 0.9)',
    syncing: '#0dcaf0',
    syncingBackground: 'rgba(13, 202, 240, 0.9)',
    synced: '#198754',
    syncedBackground: 'rgba(25, 135, 84, 0.9)',
  };

  // ========== CONFIGURAÇÕES DE SOMBRA ==========
  const shadows = {
    small: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    medium: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 4,
    },
    large: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 8,
    },
    strong: {
      shadowColor: colors.shadowStrong,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 10,
    },
  };

  // ========== CONFIGURAÇÕES DE BORDAS ==========
  const borders = {
    radius: {
      small: 8,
      medium: 12,
      large: 16,
      round: 24,
    },
    width: {
      thin: 1,
      medium: 2,
      thick: 3,
    },
  };

  // ========== CONFIGURAÇÕES DE ESPAÇAMENTO ==========
  const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  };

  return StyleSheet.create({
    // ========== CONTAINER PRINCIPAL ==========
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    // ========== MAPA ==========
    map: {
      flex: 1,
      width: '100%',
      height: '100%',
    },

    // ========== LOADING STATES ==========
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
      paddingHorizontal: spacing.xxxl + spacing.sm,
    },
    loadingText: {
      fontSize: 16,
      color: colors.text,
      marginTop: spacing.lg,
      textAlign: 'center',
      fontWeight: '500',
      letterSpacing: 0.3,
    },
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.overlay,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },

    // ========== SAVING OVERLAY ==========
    savingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2000,
    },
    savingText: {
      color: '#ffffff',
      fontSize: 18,
      fontWeight: '700',
      marginTop: spacing.lg,
      textAlign: 'center',
      letterSpacing: 0.5,
    },
    savingSubtext: {
      color: 'rgba(255, 255, 255, 0.8)',
      fontSize: 14,
      marginTop: spacing.sm,
      textAlign: 'center',
      fontWeight: '400',
    },

    // ========== SELETOR DE TIPO DE MAPA ==========
    mapTypeSelectorContainer: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? 60 : 40,
      left: spacing.xl,
      backgroundColor: colors.surface,
      borderRadius: borders.radius.medium,
      padding: spacing.sm,
      ...shadows.large,
      borderWidth: borders.width.thin,
      borderColor: colors.border,
      zIndex: 200,
      maxWidth: 140,
      minWidth: 120,
    },
    mapTypeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + 2,
      borderRadius: borders.radius.small,
      marginBottom: spacing.xs,
      minWidth: 110,
      transition: 'all 0.2s ease',
    },
    mapTypeButtonActive: {
      backgroundColor: colors.primary,
      ...shadows.small,
    },
    mapTypeButtonInactive: {
      backgroundColor: 'transparent',
    },
    mapTypeButtonText: {
      marginLeft: spacing.sm,
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      letterSpacing: 0.2,
    },
    mapTypeButtonTextActive: {
      color: '#ffffff',
    },
    mapTypeToggle: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? 60 : 40,
      left: spacing.xl,
      width: 48,
      height: 48,
      borderRadius: borders.radius.round,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      ...shadows.medium,
      borderWidth: borders.width.thin,
      borderColor: colors.border,
      zIndex: 100,
    },

    // ========== INDICADOR DE GRAVAÇÃO ==========
    recordingIndicator: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? 60 : 40,
      left: showMapTypeSelector ? 180 : 80,
      right: spacing.xl,
      backgroundColor: colors.recordingBackground,
      borderRadius: borders.radius.large,
      padding: spacing.lg,
      ...shadows.strong,
      zIndex: 150,
      backdropFilter: 'blur(10px)',
    },
    recordingHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
    },
    recordingDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: '#ffffff',
      marginRight: spacing.sm,
      ...shadows.small,
    },
    recordingText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '700',
      flex: 1,
      letterSpacing: 0.3,
    },
    syncStatusIndicator: {
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    recordingStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
      gap: spacing.xs,
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
      minWidth: 0,
    },
    statText: {
      color: '#ffffff',
      fontSize: 12,
      fontWeight: '600',
      marginLeft: spacing.xs,
      letterSpacing: 0.2,
    },
    recordingSubtext: {
      color: 'rgba(255, 255, 255, 0.9)',
      fontSize: 12,
      textAlign: 'center',
      marginBottom: spacing.xs,
      fontWeight: '500',
      letterSpacing: 0.2,
    },
    bufferText: {
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: 11,
      textAlign: 'center',
      fontStyle: 'italic',
      letterSpacing: 0.1,
    },

    // ========== INDICADORES DE CONECTIVIDADE ==========
    offlineIndicator: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? 60 : 40,
      left: showMapTypeSelector ? 180 : 80,
      right: spacing.xl,
      backgroundColor: colors.offlineBackground,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: borders.radius.medium,
      ...shadows.medium,
      zIndex: 140,
    },
    offlineText: {
      color: '#ffffff',
      fontSize: 14,
      fontWeight: '600',
      marginLeft: spacing.sm,
      flex: 1,
      letterSpacing: 0.2,
    },
    queueText: {
      color: '#ffffff',
      fontSize: 12,
      marginTop: spacing.xs,
      textDecorationLine: 'underline',
      fontWeight: '500',
      letterSpacing: 0.1,
    },
    syncIndicator: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? 60 : 40,
      left: showMapTypeSelector ? 180 : 80,
      right: spacing.xl,
      backgroundColor: colors.syncingBackground,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: borders.radius.medium,
      ...shadows.medium,
      zIndex: 140,
    },
    syncText: {
      color: '#ffffff',
      fontSize: 14,
      fontWeight: '600',
      marginLeft: spacing.sm,
      letterSpacing: 0.2,
    },

    // ========== TOAST DISCRETO DE SINCRONIZAÇÃO ==========
    syncToastDiscrete: {
      position: 'absolute',
      bottom: 160,
      right: spacing.xl,
      backgroundColor: colors.syncedBackground,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: borders.radius.round,
      ...shadows.small,
      zIndex: 250,
      minWidth: 100,
      maxWidth: 150,
    },
    syncToastDiscreteText: {
      color: '#ffffff',
      fontSize: 12,
      fontWeight: '600',
      marginLeft: spacing.xs + 2,
      letterSpacing: 0.2,
    },

    // ========== MARCADORES E POIs ==========
    markerContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      borderRadius: borders.radius.round,
      borderWidth: borders.width.thick,
      borderColor: '#ffffff',
      ...shadows.medium,
    },
    userMarkerContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.info,
    },
    poiMarker: {
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: borders.width.thick,
      borderColor: '#ffffff',
      ...shadows.medium,
    },

    // ========== OVERLAY DE ERRO ==========
    overlayError: {
      position: 'absolute',
      bottom: 120,
      left: spacing.xl,
      right: spacing.xl,
      backgroundColor: colors.error,
      borderRadius: borders.radius.medium,
      padding: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      ...shadows.large,
      zIndex: 300,
    },
    overlayErrorText: {
      color: '#ffffff',
      fontSize: 14,
      fontWeight: '600',
      flex: 1,
      marginLeft: spacing.md,
      letterSpacing: 0.2,
    },
    errorAction: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs + 2,
      borderRadius: spacing.xs - 2,
    },
    errorActionText: {
      color: '#ffffff',
      fontSize: 12,
      fontWeight: '600',
      letterSpacing: 0.2,
    },

    // ========== CONTROLES AUXILIARES ==========
    controlButton: {
      width: 48,
      height: 48,
      borderRadius: borders.radius.round,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      ...shadows.medium,
      borderWidth: borders.width.thin,
      borderColor: colors.border,
    },
    controlButtonPressed: {
      backgroundColor: colors.primary,
      ...shadows.large,
    },
    controlButtonDisabled: {
      opacity: 0.5,
    },

    // ========== RESPONSIVIDADE PARA TELAS PEQUENAS ==========
    ...(width < 375 && {
      recordingIndicator: {
        padding: spacing.md,
        left: showMapTypeSelector ? 160 : 70,
      },
      recordingText: {
        fontSize: 14,
      },
      statText: {
        fontSize: 11,
      },
      mapTypeButton: {
        paddingHorizontal: spacing.sm + 2,
        paddingVertical: spacing.sm,
        minWidth: 100,
      },
      mapTypeSelectorContainer: {
        maxWidth: 120,
        minWidth: 100,
      },
      syncToastDiscrete: {
        paddingVertical: spacing.xs + 2,
        paddingHorizontal: spacing.sm + 2,
        minWidth: 80,
      },
      syncToastDiscreteText: {
        fontSize: 11,
      },
      offlineIndicator: {
        paddingVertical: spacing.sm + 2,
        paddingHorizontal: spacing.md,
        left: showMapTypeSelector ? 160 : 70,
      },
      syncIndicator: {
        paddingVertical: spacing.sm + 2,
        paddingHorizontal: spacing.md,
        left: showMapTypeSelector ? 160 : 70,
      },
    }),

    // ========== RESPONSIVIDADE PARA TELAS GRANDES ==========
    ...(width > 414 && {
      recordingIndicator: {
        padding: spacing.xl,
        left: showMapTypeSelector ? 200 : 90,
      },
      recordingText: {
        fontSize: 18,
      },
      statText: {
        fontSize: 13,
      },
      mapTypeButton: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        minWidth: 140,
      },
      mapTypeSelectorContainer: {
        maxWidth: 160,
        minWidth: 140,
      },
      syncToastDiscrete: {
        paddingVertical: spacing.sm + 2,
        paddingHorizontal: spacing.md + 2,
        minWidth: 120,
      },
      syncToastDiscreteText: {
        fontSize: 13,
      },
      offlineIndicator: {
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.xl,
        left: showMapTypeSelector ? 200 : 90,
      },
      syncIndicator: {
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.xl,
        left: showMapTypeSelector ? 200 : 90,
      },
    }),

    // ========== ACESSIBILIDADE ==========
    accessibilityButton: {
      minWidth: 44,
      minHeight: 44,
    },
    accessibilityLabel: {
      fontSize: 16,
      color: colors.text,
    },

    // ========== HELPERS DE ANIMAÇÃO ==========
    fadeIn: {
      opacity: 1,
    },
    fadeOut: {
      opacity: 0,
    },
    slideIn: {
      transform: [{ translateY: 0 }],
    },
    slideOut: {
      transform: [{ translateY: 100 }],
    },

    // ========== ESTILOS DE DEBUG (OPCIONAL) ==========
    debugContainer: {
      position: 'absolute',
      top: statusBarHeight + 200,
      left: spacing.xl,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderRadius: borders.radius.small,
      padding: spacing.md,
      zIndex: 1000,
    },
    debugText: {
      fontSize: 12,
      color: '#ffffff',
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },

    // ========== ESTILOS ADICIONAIS PARA MELHOR UX ==========
    gradientOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 100,
      zIndex: 50,
    },

    // ========== ESTILOS PARA DIFERENTES ESTADOS DE CONEXÃO ==========
    connectionStatusGood: {
      backgroundColor: colors.success,
    },
    connectionStatusPoor: {
      backgroundColor: colors.warning,
    },
    connectionStatusNone: {
      backgroundColor: colors.error,
    },

    // ========== ESTILOS PARA DIFERENTES TIPOS DE TRILHA ==========
    trailTypeEasy: {
      strokeColor: colors.success,
    },
    trailTypeMedium: {
      strokeColor: colors.warning,
    },
    trailTypeHard: {
      strokeColor: colors.error,
    },

    // ========== ESTILOS PARA DIFERENTES CATEGORIAS DE POI ==========
    poiCategoryDanger: {
      backgroundColor: colors.error,
      borderColor: '#ffffff',
      borderWidth: borders.width.medium,
    },
    poiCategoryLandmark: {
      backgroundColor: '#ff9800',
      borderColor: '#ffffff',
      borderWidth: borders.width.thin,
    },
    poiCategoryWater: {
      backgroundColor: colors.info,
      borderColor: '#ffffff',
      borderWidth: borders.width.thin,
    },

    // ========== MELHORIAS VISUAIS ADICIONAIS ==========
    glassmorphism: {
      backgroundColor: isDarkMode
        ? 'rgba(255, 255, 255, 0.1)'
        : 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(10px)',
      borderWidth: borders.width.thin,
      borderColor: isDarkMode
        ? 'rgba(255, 255, 255, 0.2)'
        : 'rgba(255, 255, 255, 0.3)',
    },

    // ========== TRANSIÇÕES SUAVES ==========
    smoothTransition: {
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },

    // ========== ESTADOS DE HOVER PARA WEB (FUTURO) ==========
    buttonHover: {
      transform: [{ scale: 1.05 }],
      ...shadows.large,
    },
  });
};

export default createStyles;
