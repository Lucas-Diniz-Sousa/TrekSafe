// src/components/TrailsModal/TrailsModal.styles.js
import { StyleSheet } from 'react-native';
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
  };

  return StyleSheet.create({
    // ========== MODAL ==========
    overlay: {
      flex: 1,
      backgroundColor: Colors.overlayBackground,
      justifyContent: 'flex-end',
    },
    container: {
      height: '90%',
      backgroundColor: themedColors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },

    // ========== CABEÇALHO ==========
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: themedColors.border,
    },
    title: {
      fontSize: 20,
      fontWeight: '600',
      color: themedColors.text,
    },
    closeButton: {
      padding: 4,
    },

    // ========== BANNER DE CONECTIVIDADE ==========
    connectivityBanner: {
      backgroundColor: Colors.errorRed,
      paddingHorizontal: 20,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    connectivityText: {
      color: Colors.white,
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 8,
    },

    // ========== TABS ==========
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: themedColors.backgroundSecondary,
      margin: 20,
      borderRadius: 12,
      padding: 4,
    },
    tab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
    },
    activeTab: {
      backgroundColor: Colors.verdeFlorestaProfundo,
    },
    tabText: {
      fontSize: 14,
      fontWeight: '600',
      color: themedColors.textMuted,
      marginLeft: 8,
    },
    activeTabText: {
      color: Colors.white,
    },

    // ========== CONTEÚDO ==========
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    tabContent: {
      flex: 1,
    },

    // ========== PROMPT DE LOGIN ==========
    loginPrompt: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    loginPromptTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: themedColors.text,
      marginTop: 16,
      marginBottom: 8,
    },
    loginPromptText: {
      fontSize: 14,
      color: themedColors.textMuted,
      textAlign: 'center',
      lineHeight: 20,
    },

    // ========== CONTROLES PÚBLICOS ==========
    publicControlsHeader: {
      marginBottom: 16,
      padding: 16,
      backgroundColor: themedColors.backgroundSecondary,
      borderRadius: 12,
    },

    // ========== ITENS DE TRILHA ==========
    trailItem: {
      backgroundColor: themedColors.backgroundSecondary,
      borderRadius: 12,
      marginBottom: 12,
      overflow: 'hidden',
    },
    trailHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
    },
    trailHeaderLeft: {
      flex: 1,
    },
    trailHeaderRight: {
      marginLeft: 12,
    },
    trailTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    trailTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: themedColors.text,
      flex: 1,
      marginRight: 8,
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statusText: {
      fontSize: 12,
      color: themedColors.textMuted,
      marginLeft: 4,
    },
    trailMetrics: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
    },
    metric: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    metricText: {
      fontSize: 12,
      color: themedColors.textMuted,
      marginLeft: 4,
    },

    // ========== DETALHES DA TRILHA ==========
    trailDetails: {
      borderTopWidth: 1,
      borderTopColor: themedColors.border,
      padding: 16,
    },
    detailSection: {
      marginBottom: 12,
    },
    detailLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: themedColors.textMuted,
      marginBottom: 4,
    },
    detailText: {
      fontSize: 14,
      color: themedColors.text,
      lineHeight: 20,
    },

    // ========== CONTROLES ==========
    trailControls: {
      marginTop: 16,
    },
    controlRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    controlLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: themedColors.text,
      flex: 1,
    },

    // ========== BOTÕES DE AÇÃO ==========
    actionButtons: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 12,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      gap: 6,
    },
    editButton: {
      backgroundColor: Colors.infoBlue,
    },
    deleteButton: {
      backgroundColor: Colors.errorRed,
    },
    actionButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: Colors.white,
    },

    // ========== LISTA VAZIA ==========
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: themedColors.text,
      marginTop: 16,
      marginBottom: 8,
      textAlign: 'center',
    },
    emptySubtitle: {
      fontSize: 14,
      color: themedColors.textMuted,
      textAlign: 'center',
      lineHeight: 20,
    },

    // ========== FOOTER ==========
    footer: {
      borderTopWidth: 1,
      borderTopColor: themedColors.border,
      padding: 20,
      backgroundColor: themedColors.backgroundSecondary,
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    statusItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statusText: {
      fontSize: 12,
      color: themedColors.textMuted,
      marginLeft: 6,
    },
    refreshButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 6,
      backgroundColor: ColorUtils.withOpacity(
        Colors.verdeFlorestaProfundo,
        0.1
      ),
    },
    refreshButtonText: {
      fontSize: 12,
      fontWeight: '600',
      color: Colors.verdeFlorestaProfundo,
      marginLeft: 4,
    },
  });
};
