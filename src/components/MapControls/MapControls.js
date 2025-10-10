// src/components/MapControls/MapControls.js
import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Modal,
} from 'react-native';
import { Colors, ColorUtils } from '../../theme/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { createStyles } from './MapControls.styles';

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
  const styles = createStyles(isDarkMode, isRecording);

  const handleLogin = () => {
    setShowMenu(false);
    onLogin();
  };

  const handleViewTrails = () => {
    setShowMenu(false);
    onViewTrails();
  };

  return (
    <>
      {/* Botão do menu superior */}
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => setShowMenu(true)}
        activeOpacity={0.8}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Icon 
          name="menu" 
          size={24} 
          color={ColorUtils.getThemeColor(Colors.textPrimary, Colors.textPrimaryDark, isDarkMode)} 
        />
      </TouchableOpacity>

      {/* Controles laterais */}
      <View style={styles.controlsContainer}>
        {/* Zoom In */}
        <TouchableOpacity
          style={[
            styles.controlButton,
            !isMapReady && styles.disabledButton
          ]}
          onPress={onZoomIn}
          activeOpacity={0.8}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          disabled={!isMapReady}
        >
          <Icon 
            name="plus" 
            size={22} 
            color={!isMapReady 
              ? ColorUtils.getThemeColor(Colors.gray400, Colors.gray500, isDarkMode)
              : ColorUtils.getThemeColor(Colors.textPrimary, Colors.textPrimaryDark, isDarkMode)
            } 
          />
        </TouchableOpacity>
        
        {/* Zoom Out */}
        <TouchableOpacity
          style={[
            styles.controlButton,
            !isMapReady && styles.disabledButton
          ]}
          onPress={onZoomOut}
          activeOpacity={0.8}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          disabled={!isMapReady}
        >
          <Icon 
            name="minus" 
            size={22} 
            color={!isMapReady 
              ? ColorUtils.getThemeColor(Colors.gray400, Colors.gray500, isDarkMode)
              : ColorUtils.getThemeColor(Colors.textPrimary, Colors.textPrimaryDark, isDarkMode)
            } 
          />
        </TouchableOpacity>
        
        {/* Botão de Gravação */}
        <TouchableOpacity
          style={[
            styles.controlButton, 
            styles.recordButton,
            !isMapReady && styles.disabledButton
          ]}
          onPress={onToggleRecording}
          activeOpacity={0.8}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          disabled={!isMapReady}
        >
          <Icon 
            name={isRecording ? 'stop' : 'record'} 
            size={isRecording ? 18 : 20} 
            color={Colors.white}
          />
        </TouchableOpacity>
        
        {/* Botão de Localização */}
        <TouchableOpacity
          style={[
            styles.controlButton, 
            styles.locationButton,
            !isMapReady && styles.disabledButton
          ]}
          onPress={onCenterOnUser}
          activeOpacity={0.8}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          disabled={!isMapReady}
        >
          <Icon 
            name="crosshairs-gps" 
            size={20} 
            color={Colors.white} 
          />
        </TouchableOpacity>
      </View>

      {/* Modal do menu */}
      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
        statusBarTranslucent
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Menu</Text>
            
            {/* Opção Login */}
            <TouchableOpacity 
              style={styles.menuOption}
              onPress={handleLogin}
              activeOpacity={0.8}
            >
              <Icon 
                name="account-circle" 
                size={22} 
                color={Colors.blue500} 
              />
              <Text style={styles.menuOptionText}>Entrar na Conta</Text>
              <Icon 
                name="chevron-right" 
                size={18} 
                color={ColorUtils.getThemeColor(Colors.textMuted, Colors.textMutedDark, isDarkMode)} 
              />
            </TouchableOpacity>
            
            {/* Opção Trilhas */}
            <TouchableOpacity 
              style={[styles.menuOption, styles.menuOptionLast]}
              onPress={handleViewTrails}
              activeOpacity={0.8}
            >
              <Icon 
                name="hiking" 
                size={22} 
                color={Colors.successGreen} 
              />
              <Text style={styles.menuOptionText}>Minhas Trilhas</Text>
              {savedTrails.length > 0 && (
                <View style={styles.trailsBadge}>
                  <Text style={styles.trailsBadgeText}>
                    {savedTrails.length}
                  </Text>
                </View>
              )}
              <Icon 
                name="chevron-right" 
                size={18} 
                color={ColorUtils.getThemeColor(Colors.textMuted, Colors.textMutedDark, isDarkMode)} 
              />
            </TouchableOpacity>
            
            {/* Botão Fechar */}
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowMenu(false)}
              activeOpacity={0.8}
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