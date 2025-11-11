// src/components/AddPOIModal/AddPOIModal.styles.js
import { Platform, StyleSheet } from 'react-native';
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
    // ========== MODAL OVERLAY ==========
    overlay: {
      flex: 1,
      backgroundColor: Colors.overlayBackground,
      justifyContent: 'flex-end',
    },

    // ========== CONTAINER PRINCIPAL ==========
    container: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '85%',
      backgroundColor: themedColors.background,
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

    // ========== CONTEÚDO ==========
    content: {
      padding: 20,
    },

    // ========== INFORMAÇÕES DE LOCALIZAÇÃO ==========
    locationInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
      padding: 12,
      backgroundColor: ColorUtils.withOpacity(Colors.infoBlue, 0.1),
      borderRadius: 8,
      borderColor: ColorUtils.withOpacity(Colors.infoBlue, 0.3),
      borderWidth: 1,
    },
    locationText: {
      marginLeft: 8,
      fontSize: 14,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      color: themedColors.textMuted,
    },

    // ========== DEBUG INFO ==========
    debugInfo: {
      backgroundColor: ColorUtils.withOpacity(Colors.warningYellow, 0.1),
      padding: 10,
      marginBottom: 10,
      borderRadius: 8,
      borderColor: ColorUtils.withOpacity(Colors.warningYellow, 0.5),
      borderWidth: 1,
    },
    debugText: {
      fontSize: 12,
      color: themedColors.text,
    },
    debugError: {
      color: Colors.errorRed,
    },

    // ========== GRUPOS DE INPUT ==========
    inputGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      fontWeight: '500',
      marginBottom: 8,
      color: themedColors.text,
    },
    required: {
      color: Colors.errorRed,
    },

    // ========== INPUTS ==========
    input: {
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: 16,
      backgroundColor: themedColors.backgroundSecondary,
      borderColor: themedColors.border,
      color: themedColors.text,
    },
    inputError: {
      borderColor: Colors.errorRed,
      borderWidth: 2,
    },
    textArea: {
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: 16,
      textAlignVertical: 'top',
      minHeight: 100,
      backgroundColor: themedColors.backgroundSecondary,
      borderColor: themedColors.border,
      color: themedColors.text,
    },
    textAreaError: {
      borderColor: Colors.errorRed,
      borderWidth: 2,
    },

    // ========== CONTADOR DE CARACTERES ==========
    charCount: {
      textAlign: 'right',
      fontSize: 12,
      marginTop: 4,
      color: themedColors.textMuted,
    },
    charCountNearLimit: {
      color: Colors.warningOrange,
    },
    charCountAtLimit: {
      color: Colors.errorRed,
    },

    // ========== TEXTO DE ERRO ==========
    errorText: {
      color: Colors.errorRed,
      fontSize: 12,
      marginTop: 4,
      fontWeight: '500',
    },

    // ========== GRID DE CATEGORIAS ==========
    categoriesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    categoryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      marginBottom: 8,
      backgroundColor: themedColors.backgroundSecondary,
      borderColor: themedColors.border,
    },
    categoryButtonSelected: {
      // backgroundColor e borderColor serão definidos dinamicamente
    },
    categoryText: {
      marginLeft: 6,
      fontSize: 14,
      fontWeight: '500',
      color: themedColors.text,
    },
    categoryTextSelected: {
      color: Colors.white,
    },

    // ========== FOOTER ==========
    footer: {
      flexDirection: 'row',
      padding: 20,
      gap: 12,
      borderTopWidth: 1,
      borderTopColor: themedColors.border,
      backgroundColor: themedColors.backgroundSecondary,
    },
    button: {
      flex: 1,
      flexDirection: 'row',
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      minHeight: 48,
    },
    cancelButton: {
      backgroundColor: Colors.gray400,
    },
    cancelButtonText: {
      color: Colors.gray700,
      fontSize: 16,
      fontWeight: '500',
    },
    saveButton: {
      // backgroundColor será definido dinamicamente
    },
    saveButtonEnabled: {
      backgroundColor: Colors.verdeFlorestaProfundo,
    },
    saveButtonDisabled: {
      backgroundColor: Colors.disabledButton,
    },
    saveButtonText: {
      color: Colors.white,
      fontSize: 16,
      fontWeight: '500',
    },

    // ========== ESTADOS DE LOADING ==========
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
};
