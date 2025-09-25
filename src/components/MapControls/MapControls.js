// src/components/MapControls/MapControls.js
import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Modal,
  StyleSheet,
  Alert,
} from 'react-native';
import { Colors, Fonts } from '../../theme/theme'; // Ajuste o caminho conforme necessário
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Importe a biblioteca de ícones

const MapControls = ({
  isDarkMode,
  isMapReady,
  isRecording,
  savedTrails,
  onZoomIn,
  onZoomOut,
  onCenterOnUser,
  onToggleRecording,
  onLogin,
  onViewTrails,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);

  const handleLogin = () => {
    setShowMenu(false);
    onLogin();
  };

  const handleViewTrails = () => {
    setShowMenu(false);
    onViewTrails();
  };

  const styles = StyleSheet.create({
    // Menu superior
    menuButton: {
      position: 'absolute',
      top: 50,
      right: 15,
      backgroundColor: isDarkMode ? Colors.verdeFlorestaProfundo : Colors.cremeClaro,
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2,
      elevation: 8,
      shadowColor: Colors.black,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      borderWidth: 1,
      borderColor: isDarkMode ? Colors.douradoNobre : Colors.marromRustico,
    },
    // Ícone do menu (não é texto, então só o estilo do container e cor do ícone)
    menuButtonIcon: {
      color: isDarkMode ? Colors.cremeClaro : Colors.verdeFlorestaProfundo,
      fontSize: 24,
    },
    // Controles laterais
    controlsContainer: {
      position: 'absolute',
      right: 15,
      bottom: 50,
      zIndex: 2,
    },
    controlButton: {
      backgroundColor: isDarkMode ? Colors.verdeFlorestaProfundo : Colors.cremeClaro,
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 10,
      elevation: 8,
      shadowColor: Colors.black,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      borderWidth: 1,
      borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : Colors.marromRustico,
    },
    controlButtonIcon: { // Estilo para os ícones dos botões de controle
      fontSize: 24,
      color: isDarkMode ? Colors.cremeClaro : Colors.verdeFlorestaProfundo,
    },
    // Botão de localização (Azul Cascata)
    locationButton: {
      backgroundColor: Colors.azulCascata,
      borderColor: Colors.azulCascata,
    },
    locationButtonIcon: { // Ícone de localização
      color: Colors.cremeClaro,
      fontSize: 20,
    },
    // Botão de gravação (Dourado Nobre para iniciar, Verde Floresta Profundo para parar)
    recordButton: {
      backgroundColor: isRecording 
        ? Colors.verdeFlorestaProfundo // Parar gravação (cor principal da marca)
        : Colors.douradoNobre, // Iniciar gravação (accent principal)
      borderColor: isRecording 
        ? Colors.errorRed // Um toque de vermelho para sinalizar 'parar'
        : Colors.douradoNobre, 
    },
    recordButtonIcon: { // Ícone de gravação
      color: isRecording ? Colors.cremeClaro : Colors.verdeFlorestaProfundo,
      fontSize: 20,
    },
    // Modal do menu
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: isDarkMode ? Colors.verdeFlorestaProfundo : Colors.cremeClaro,
      borderRadius: 15,
      padding: 20,
      width: '80%',
      maxWidth: 300,
      elevation: 10,
      shadowColor: Colors.black,
      shadowOffset: {
        width: 0,
        height: 5,
      },
      shadowOpacity: 0.3,
      shadowRadius: 10,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: isDarkMode ? Colors.cremeClaro : Colors.verdeFlorestaProfundo,
      textAlign: 'center',
      marginBottom: 20,
      fontFamily: Fonts.oswaldBold,
    },
    menuOption: {
      flexDirection: 'row', // Para alinhar ícone e texto
      alignItems: 'center',
      paddingVertical: 15,
      paddingHorizontal: 10,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? Colors.verdeMusgo : Colors.marromRustico,
    },
    menuOptionLast: {
      borderBottomWidth: 0,
    },
    menuOptionText: {
      fontSize: 16,
      color: isDarkMode ? Colors.cremeClaro : Colors.verdeFlorestaProfundo,
      textAlign: 'left', // Alinha texto à esquerda
      fontFamily: Fonts.montserratMedium,
      marginLeft: 10, // Espaçamento entre ícone e texto
    },
    menuOptionIcon: { // Estilo para ícones das opções do menu
      fontSize: 20,
      color: isDarkMode ? Colors.douradoNobre : Colors.verdeFlorestaProfundo,
    },
    closeButton: {
      marginTop: 15,
      paddingVertical: 10,
      backgroundColor: isDarkMode ? Colors.marromRustico : Colors.verdeMusgo,
      borderRadius: 8,
    },
    closeButtonText: {
      fontSize: 16,
      color: Colors.cremeClaro,
      textAlign: 'center',
      fontWeight: '500',
      fontFamily: Fonts.montserratSemiBold,
    },
  });

  return (
    <>
      {/* Botão do menu superior */}
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => setShowMenu(true)}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Icon name="menu" style={styles.menuButtonIcon} />
      </TouchableOpacity>

      {/* Controles laterais */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={onZoomIn}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          disabled={!isMapReady}
        >
          <Icon name="plus" style={styles.controlButtonIcon} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.controlButton}
          onPress={onZoomOut}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          disabled={!isMapReady}
        >
          <Icon name="minus" style={styles.controlButtonIcon} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.controlButton, styles.recordButton]}
          onPress={onToggleRecording}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          disabled={!isMapReady}
        >
          <Icon 
            name={isRecording ? 'stop-circle-outline' : 'record-circle-outline'} 
            style={styles.recordButtonIcon} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.controlButton, styles.locationButton]}
          onPress={onCenterOnUser}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          disabled={!isMapReady}
        >
          <Icon name="crosshairs-gps" style={styles.locationButtonIcon} />
        </TouchableOpacity>
      </View>

      {/* Modal do menu */}
      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Menu</Text>
            
            <TouchableOpacity 
              style={styles.menuOption}
              onPress={handleLogin}
            >
              <Icon name="account-circle" style={styles.menuOptionIcon} />
              <Text style={styles.menuOptionText}>Login</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.menuOption, styles.menuOptionLast]}
              onPress={handleViewTrails}
            >
              <Icon name="map-marker-path" style={styles.menuOptionIcon} />
              <Text style={styles.menuOptionText}>Minhas Trilhas ({savedTrails.length})</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowMenu(false)}
            >
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default MapControls;