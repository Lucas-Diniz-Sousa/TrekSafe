// src/components/MapControls/MapControls.styles.js
import { StyleSheet } from 'react-native';
import { Colors, Fonts, ColorUtils } from '../../theme/theme';

export const createStyles = (isDarkMode, isRecording) => StyleSheet.create({
  // Botão do menu superior
  menuButton: {
    position: 'absolute',
    top: 50,
    right: 15,
    backgroundColor: ColorUtils.getThemeColor(Colors.cardBackground, Colors.cardBackgroundDark, isDarkMode),
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    elevation: 12,
    shadowColor: Colors.shadowDark,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: ColorUtils.getThemeColor(Colors.borderMedium, Colors.borderDark, isDarkMode),
  },
  
  // Container dos controles laterais
  controlsContainer: {
    position: 'absolute',
    right: 15,
    bottom: 50,
    zIndex: 2,
  },
  
  // Botão base dos controles
  controlButton: {
    backgroundColor: ColorUtils.getThemeColor(Colors.cardBackground, Colors.cardBackgroundDark, isDarkMode),
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 8,
    shadowColor: Colors.shadowMedium,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: ColorUtils.getThemeColor(Colors.borderLight, Colors.borderDark, isDarkMode),
  },
  
  // Botão de localização (azul)
  locationButton: {
    backgroundColor: Colors.blue500,
    borderColor: Colors.blue600,
    elevation: 10,
  },
  
  // Botão de gravação (dinâmico)
  recordButton: {
    backgroundColor: isRecording ? Colors.errorRed : Colors.successGreen,
    borderColor: isRecording ? Colors.errorDark : Colors.successDark,
    elevation: 10,
    transform: isRecording ? [{ scale: 1.05 }] : [{ scale: 1 }],
  },
  
  // Botão desabilitado
  disabledButton: {
    backgroundColor: ColorUtils.getThemeColor(Colors.gray200, Colors.gray700, isDarkMode),
    borderColor: ColorUtils.getThemeColor(Colors.gray300, Colors.gray600, isDarkMode),
    opacity: 0.6,
  },
  
  // Modal overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlayBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Conteúdo do modal
  modalContent: {
    backgroundColor: ColorUtils.getThemeColor(Colors.modalBackground, Colors.modalBackgroundDark, isDarkMode),
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 320,
    elevation: 20,
    shadowColor: Colors.shadowDark,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    borderWidth: 1,
    borderColor: ColorUtils.getThemeColor(Colors.borderLight, Colors.borderDark, isDarkMode),
  },
  
  // Título do modal
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: ColorUtils.getThemeColor(Colors.textPrimary, Colors.textPrimaryDark, isDarkMode),
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: Fonts.heading,
  },
  
  // Opção do menu
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: ColorUtils.getThemeColor(Colors.backgroundSecondary, Colors.backgroundSecondaryDark, isDarkMode),
    borderWidth: 1,
    borderColor: ColorUtils.getThemeColor(Colors.borderLight, Colors.borderDark, isDarkMode),
  },
  
  // Última opção do menu (sem margem)
  menuOptionLast: {
    marginBottom: 0,
  },
  
  // Texto da opção do menu
  menuOptionText: {
    fontSize: 16,
    color: ColorUtils.getThemeColor(Colors.textPrimary, Colors.textPrimaryDark, isDarkMode),
    fontFamily: Fonts.body,
    marginLeft: 12,
    flex: 1,
  },
  
  // Badge de contagem
  trailsBadge: {
    backgroundColor: Colors.blue500,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  
  trailsBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontFamily: Fonts.button,
    fontWeight: '600',
  },
  
  // Botão de fechar
  closeButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: ColorUtils.getThemeColor(Colors.gray500, Colors.gray600, isDarkMode),
    borderRadius: 12,
    alignItems: 'center',
  },
  
  closeButtonText: {
    fontSize: 16,
    color: Colors.white,
    fontWeight: '600',
    fontFamily: Fonts.button,
  },
});