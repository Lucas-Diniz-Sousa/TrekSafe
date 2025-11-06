// src/screens/MapScreen/MapScreen.styles.js
import { StyleSheet } from 'react-native';
import { Colors, ColorUtils } from '../../theme/theme';

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
    map: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: ColorUtils.getThemeColor(
        Colors.backgroundPrimary,
        Colors.backgroundPrimaryDark,
        isDarkMode
      ),
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: ColorUtils.getThemeColor(
        Colors.textPrimary,
        Colors.textPrimaryDark,
        isDarkMode
      ),
    },
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    savingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    savingText: {
      marginTop: 16,
      fontSize: 16,
      color: Colors.white,
      fontWeight: '500',
    },
    overlayError: {
      position: 'absolute',
      bottom: 100,
      left: 20,
      right: 20,
      backgroundColor: ColorUtils.getThemeColor(
        Colors.errorRed + 'E6',
        Colors.errorRed + 'CC',
        isDarkMode
      ),
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 8,
      shadowColor: Colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
    },
    overlayErrorText: {
      color: Colors.white,
      fontSize: 14,
      textAlign: 'center',
    },
    markerContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: Colors.verdeFlorestaProfundo,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: Colors.white,
      shadowColor: Colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
    },
    userMarkerContainer: {
      backgroundColor: Colors.blue500,
    },
    poiMarker: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: Colors.orange500,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: Colors.white,
      shadowColor: Colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
    },
    recordingIndicator: {
      position: 'absolute',
      top: 60,
      left: 20,
      right: 20,
      backgroundColor: ColorUtils.getThemeColor(
        Colors.errorRed + 'E6',
        Colors.errorRed + 'CC',
        isDarkMode
      ),
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
      flexDirection: 'column',
      alignItems: 'center',
      shadowColor: Colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
    },
    recordingDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: Colors.white,
      marginRight: 8,
    },
    recordingText: {
      color: Colors.white,
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'center',
    },
    recordingSubtext: {
      color: Colors.white,
      fontSize: 12,
      marginTop: 4,
      textAlign: 'center',
      opacity: 0.9,
    },
  });
