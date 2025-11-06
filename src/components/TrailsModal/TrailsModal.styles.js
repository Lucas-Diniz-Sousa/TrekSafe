// src/components/TrailsModal/TrailsModal.styles.js
import { StyleSheet } from 'react-native';
import { Colors, ColorUtils } from '../../theme/theme';

export const createStyles = isDarkMode =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    modalContent: {
      backgroundColor: ColorUtils.getThemeColor(
        Colors.backgroundPrimary,
        Colors.backgroundPrimaryDark,
        isDarkMode
      ),
      borderRadius: 16,
      width: '100%',
      maxHeight: '80%',
      paddingVertical: 20,
      paddingHorizontal: 16,
      shadowColor: Colors.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: ColorUtils.getThemeColor(
        Colors.gray200,
        Colors.gray700,
        isDarkMode
      ),
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: ColorUtils.getThemeColor(
        Colors.textPrimary,
        Colors.textPrimaryDark,
        isDarkMode
      ),
    },
    closeButton: {
      padding: 4,
    },

    // Tabs
    tabContainer: {
      flexDirection: 'row',
      marginBottom: 16,
      backgroundColor: ColorUtils.getThemeColor(
        Colors.gray100,
        Colors.gray800,
        isDarkMode
      ),
      borderRadius: 8,
      padding: 4,
    },
    tabButton: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 6,
      alignItems: 'center',
    },
    tabButtonActive: {
      backgroundColor: ColorUtils.getThemeColor(
        Colors.white,
        Colors.gray700,
        isDarkMode
      ),
      shadowColor: Colors.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    tabButtonText: {
      fontSize: 14,
      fontWeight: '500',
      color: ColorUtils.getThemeColor(
        Colors.textMuted,
        Colors.textMutedDark,
        isDarkMode
      ),
    },
    tabButtonTextActive: {
      color: ColorUtils.getThemeColor(
        Colors.textPrimary,
        Colors.textPrimaryDark,
        isDarkMode
      ),
    },
    refreshButton: {
      padding: 8,
      marginLeft: 8,
    },

    // Header das trilhas públicas
    publicTrailsHeader: {
      backgroundColor: ColorUtils.getThemeColor(
        Colors.blue500 + '10',
        Colors.blue500 + '20',
        isDarkMode
      ),
      padding: 16,
      marginBottom: 8,
      borderRadius: 8,
      marginHorizontal: 16,
    },
    publicTrailsInfo: {
      marginBottom: 12,
    },
    publicTrailsTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: Colors.blue500,
      marginBottom: 4,
    },
    publicTrailsSubtitle: {
      fontSize: 14,
      color: ColorUtils.getThemeColor(
        Colors.textMuted,
        Colors.textMutedDark,
        isDarkMode
      ),
    },
    publicTrailsControls: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    toggleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      gap: 4,
    },
    toggleButtonText: {
      color: Colors.white,
      fontSize: 12,
      fontWeight: '500',
    },

    // Lista vazia
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 40,
    },
    emptyText: {
      fontSize: 16,
      textAlign: 'center',
      color: ColorUtils.getThemeColor(
        Colors.textMuted,
        Colors.textMutedDark,
        isDarkMode
      ),
      marginTop: 16,
      lineHeight: 22,
    },
    emptySubtext: {
      fontSize: 14,
      textAlign: 'center',
      color: ColorUtils.getThemeColor(
        Colors.blue500,
        Colors.blue400,
        isDarkMode
      ),
      marginTop: 12,
      fontStyle: 'italic',
    },

    // Item da trilha
    trailItem: {
      backgroundColor: ColorUtils.getThemeColor(
        Colors.backgroundSecondary,
        Colors.backgroundSecondaryDark,
        isDarkMode
      ),
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      marginHorizontal: 16,
      borderWidth: 1,
      borderColor: ColorUtils.getThemeColor(
        Colors.gray200,
        Colors.gray700,
        isDarkMode
      ),
    },
    trailHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    trailInfo: {
      flex: 1,
      marginRight: 12,
    },
    trailName: {
      fontSize: 16,
      fontWeight: '600',
      color: ColorUtils.getThemeColor(
        Colors.textPrimary,
        Colors.textPrimaryDark,
        isDarkMode
      ),
      marginBottom: 4,
    },
    trailDate: {
      fontSize: 14,
      color: ColorUtils.getThemeColor(
        Colors.textMuted,
        Colors.textMutedDark,
        isDarkMode
      ),
    },
    badgeContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 4,
      gap: 4,
    },
    syncBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: ColorUtils.getThemeColor(
        Colors.successGreen + '20',
        Colors.successGreen + '30',
        isDarkMode
      ),
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      alignSelf: 'flex-start',
    },
    syncText: {
      fontSize: 12,
      color: Colors.successGreen,
      marginLeft: 4,
      fontWeight: '500',
    },
    editInput: {
      backgroundColor: ColorUtils.getThemeColor(
        Colors.white,
        Colors.gray800,
        isDarkMode
      ),
      borderWidth: 1,
      borderColor: Colors.blue500,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: 16,
      color: ColorUtils.getThemeColor(
        Colors.textPrimary,
        Colors.textPrimaryDark,
        isDarkMode
      ),
    },
    visibilityContainer: {
      alignItems: 'center',
    },
    visibilityLabel: {
      fontSize: 12,
      color: ColorUtils.getThemeColor(
        Colors.textMuted,
        Colors.textMutedDark,
        isDarkMode
      ),
      marginBottom: 4,
    },

    // Estatísticas da trilha
    trailStats: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 12,
      gap: 12,
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statText: {
      fontSize: 14,
      color: ColorUtils.getThemeColor(
        Colors.textMuted,
        Colors.textMutedDark,
        isDarkMode
      ),
      marginLeft: 4,
      fontWeight: '500',
    },

    // Ações da trilha
    trailActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      flexWrap: 'wrap',
      gap: 8,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      minWidth: 40,
      justifyContent: 'center',
    },
    actionButtonText: {
      color: Colors.white,
      fontSize: 12,
      fontWeight: '500',
      marginLeft: 4,
    },
    editButton: {
      backgroundColor: Colors.blue500,
    },
    shareButton: {
      backgroundColor: Colors.purple500,
    },
    exportButton: {
      backgroundColor: Colors.orange500,
    },
    detailsButton: {
      backgroundColor: Colors.infoBlue,
    },
    deleteButton: {
      backgroundColor: Colors.errorRed,
    },
    saveButton: {
      backgroundColor: Colors.successGreen,
    },
    cancelButton: {
      backgroundColor: Colors.gray500,
    },
  });
