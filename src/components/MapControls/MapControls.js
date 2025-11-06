// src/components/MapControls/MapControls.js
import React from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, ColorUtils } from '../../theme/theme';
import { createStyles } from './MapControls.styles';

const { width: screenWidth } = Dimensions.get('window');

const MapControls = ({
  isDarkMode,
  isMapReady,
  isRecording,
  savedTrails = [],
  publicTrails = [],
  publicTrailsVisible = true,
  loadingTrails = false,
  isSavingTrail = false,
  isAuthenticated = false,
  onZoomIn,
  onZoomOut,
  onCenterOnUser,
  onToggleRecording,
  onLogin,
  onViewTrails,
  onRefreshTrails,
  onTogglePublicTrails,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const [menuAnimation] = React.useState(new Animated.Value(0));
  const styles = createStyles(isDarkMode, isRecording);

  // ✅ ANIMAÇÃO DO MENU
  React.useEffect(() => {
    Animated.timing(menuAnimation, {
      toValue: showMenu ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showMenu, menuAnimation]);

  const handleLogin = () => {
    setShowMenu(false);
    onLogin();
  };

  const handleViewTrails = () => {
    setShowMenu(false);
    onViewTrails();
  };

  const handleRefreshTrails = () => {
    setShowMenu(false);
    if (onRefreshTrails) {
      onRefreshTrails();
    }
  };

  const handleTogglePublicTrails = () => {
    if (onTogglePublicTrails) {
      onTogglePublicTrails(!publicTrailsVisible);
    }
  };

  // ✅ FUNÇÃO PARA OBTER STATUS DA GRAVAÇÃO
  const getRecordingStatus = () => {
    if (isSavingTrail)
      return { text: 'Salvando trilha...', color: Colors.orange500 };
    if (isRecording) return { text: 'Gravando trilha', color: Colors.errorRed };
    return null;
  };

  const recordingStatus = getRecordingStatus();

  return (
    <>
      {/* ✅ BOTÃO DO MENU SUPERIOR MELHORADO */}
      <TouchableOpacity
        style={[
          styles.menuButton,
          !isMapReady && styles.disabledButton,
          showMenu && styles.menuButtonActive,
        ]}
        onPress={() => setShowMenu(true)}
        activeOpacity={0.8}
        hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        disabled={!isMapReady}
      >
        <Icon
          name={showMenu ? 'close' : 'menu'}
          size={24}
          color={
            showMenu
              ? Colors.white
              : ColorUtils.getThemeColor(
                  Colors.textPrimary,
                  Colors.textPrimaryDark,
                  isDarkMode
                )
          }
        />
        {/* Badge de notificações */}
        {(savedTrails.length > 0 || publicTrails.length > 0) && !showMenu && (
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>
              {savedTrails.length + publicTrails.length}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* ✅ INDICADOR DE STATUS MELHORADO */}
      {recordingStatus && (
        <Animated.View
          style={[
            styles.statusIndicator,
            {
              backgroundColor: recordingStatus.color + 'E6',
              transform: [
                {
                  translateY: menuAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -10],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.statusContent}>
            {isSavingTrail ? (
              <ActivityIndicator size={16} color={Colors.white} />
            ) : (
              <Animated.View
                style={[
                  styles.recordingDot,
                  {
                    transform: [
                      {
                        scale: menuAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.2],
                        }),
                      },
                    ],
                  },
                ]}
              />
            )}
            <Text style={styles.statusText}>{recordingStatus.text}</Text>
          </View>
          {isRecording && (
            <Text style={styles.statusSubtext}>
              Toque e segure no mapa para adicionar POI
            </Text>
          )}
        </Animated.View>
      )}

      {/* ✅ CONTROLES LATERAIS MELHORADOS */}
      <View style={styles.controlsContainer}>
        {/* Zoom In */}
        <TouchableOpacity
          style={[
            styles.controlButton,
            styles.zoomButton,
            !isMapReady && styles.disabledButton,
          ]}
          onPress={onZoomIn}
          activeOpacity={0.8}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          disabled={!isMapReady}
        >
          <Icon name="plus" size={22} color={Colors.white} />
        </TouchableOpacity>

        {/* Zoom Out */}
        <TouchableOpacity
          style={[
            styles.controlButton,
            styles.zoomButton,
            !isMapReady && styles.disabledButton,
          ]}
          onPress={onZoomOut}
          activeOpacity={0.8}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          disabled={!isMapReady}
        >
          <Icon name="minus" size={22} color={Colors.white} />
        </TouchableOpacity>

        {/* ✅ BOTÃO DE TRILHAS PÚBLICAS */}
        <TouchableOpacity
          style={[
            styles.controlButton,
            styles.publicTrailsButton,
            {
              backgroundColor: publicTrailsVisible
                ? Colors.blue500
                : ColorUtils.getThemeColor(
                    Colors.gray400,
                    Colors.gray600,
                    isDarkMode
                  ),
              opacity: publicTrails.length > 0 ? 1 : 0.5,
            },
            !isMapReady && styles.disabledButton,
          ]}
          onPress={handleTogglePublicTrails}
          activeOpacity={0.8}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          disabled={publicTrails.length === 0 || !isMapReady}
        >
          <Icon
            name={publicTrailsVisible ? 'earth' : 'earth-off'}
            size={20}
            color={Colors.white}
          />
          {publicTrails.length > 0 && (
            <View style={styles.trailsBadge}>
              <Text style={styles.trailsBadgeText}>{publicTrails.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Botão de Localização */}
        <TouchableOpacity
          style={[
            styles.controlButton,
            styles.locationButton,
            !isMapReady && styles.disabledButton,
          ]}
          onPress={onCenterOnUser}
          activeOpacity={0.8}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          disabled={!isMapReady}
        >
          <Icon name="crosshairs-gps" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* ✅ BOTÃO DE GRAVAÇÃO CENTRAL MELHORADO */}
      <View style={styles.recordingContainer}>
        <TouchableOpacity
          style={[
            styles.recordButton,
            isRecording && styles.recordButtonActive,
            isSavingTrail && styles.recordButtonSaving,
            !isMapReady && styles.disabledButton,
          ]}
          onPress={onToggleRecording}
          activeOpacity={0.8}
          disabled={!isMapReady || isSavingTrail}
        >
          {isSavingTrail ? (
            <ActivityIndicator size={28} color={Colors.white} />
          ) : (
            <Icon
              name={isRecording ? 'stop' : 'record'}
              size={isRecording ? 24 : 28}
              color={Colors.white}
            />
          )}
        </TouchableOpacity>

        <Text style={styles.recordingLabel}>
          {isSavingTrail ? 'Salvando...' : isRecording ? 'Parar' : 'Gravar'}
        </Text>
      </View>

      {/* ✅ MODAL DO MENU MELHORADO */}
      <Modal
        visible={showMenu}
        transparent={true}
        animationType="none"
        onRequestClose={() => setShowMenu(false)}
        statusBarTranslucent
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [
                  {
                    translateX: menuAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-screenWidth * 0.8, 0],
                    }),
                  },
                ],
                opacity: menuAnimation,
              },
            ]}
          >
            {/* Header do Menu */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>TrekSafe</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowMenu(false)}
                activeOpacity={0.8}
              >
                <Icon name="close" size={24} color={Colors.gray500} />
              </TouchableOpacity>
            </View>

            {/* ✅ STATUS DE AUTENTICAÇÃO MELHORADO */}
            <View
              style={[
                styles.authStatus,
                {
                  backgroundColor: isAuthenticated
                    ? Colors.successGreen + '15'
                    : Colors.gray500 + '15',
                },
              ]}
            >
              <View style={styles.authStatusIcon}>
                <Icon
                  name={isAuthenticated ? 'account-check' : 'account-outline'}
                  size={24}
                  color={isAuthenticated ? Colors.successGreen : Colors.gray500}
                />
              </View>
              <View style={styles.authStatusInfo}>
                <Text
                  style={[
                    styles.authStatusText,
                    {
                      color: isAuthenticated
                        ? Colors.successGreen
                        : Colors.gray500,
                    },
                  ]}
                >
                  {isAuthenticated ? 'Conectado' : 'Não conectado'}
                </Text>
                <Text style={styles.authStatusSubtext}>
                  {isAuthenticated
                    ? 'Suas trilhas estão sincronizadas'
                    : 'Faça login para sincronizar trilhas'}
                </Text>
              </View>
            </View>

            {/* ✅ OPÇÕES DO MENU MELHORADAS */}
            <View style={styles.menuOptions}>
              {/* Login/Logout */}
              <TouchableOpacity
                style={styles.menuOption}
                onPress={handleLogin}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.menuOptionIcon,
                    { backgroundColor: Colors.blue500 + '20' },
                  ]}
                >
                  <Icon
                    name={isAuthenticated ? 'logout' : 'login'}
                    size={22}
                    color={Colors.blue500}
                  />
                </View>
                <View style={styles.menuOptionContent}>
                  <Text style={styles.menuOptionText}>
                    {isAuthenticated ? 'Trocar Conta' : 'Entrar na Conta'}
                  </Text>
                  <Text style={styles.menuOptionSubtext}>
                    {isAuthenticated
                      ? 'Fazer logout ou trocar usuário'
                      : 'Sincronize suas trilhas'}
                  </Text>
                </View>
                <Icon name="chevron-right" size={20} color={Colors.gray400} />
              </TouchableOpacity>

              {/* Minhas Trilhas */}
              <TouchableOpacity
                style={styles.menuOption}
                onPress={handleViewTrails}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.menuOptionIcon,
                    { backgroundColor: Colors.successGreen + '20' },
                  ]}
                >
                  <Icon name="hiking" size={22} color={Colors.successGreen} />
                </View>
                <View style={styles.menuOptionContent}>
                  <Text style={styles.menuOptionText}>Minhas Trilhas</Text>
                  <Text style={styles.menuOptionSubtext}>
                    {savedTrails.length} trilha
                    {savedTrails.length !== 1 ? 's' : ''} gravada
                    {savedTrails.length !== 1 ? 's' : ''}
                  </Text>
                </View>
                {savedTrails.length > 0 && (
                  <View
                    style={[
                      styles.trailsBadge,
                      { backgroundColor: Colors.successGreen },
                    ]}
                  >
                    <Text style={styles.trailsBadgeText}>
                      {savedTrails.length}
                    </Text>
                  </View>
                )}
                <Icon name="chevron-right" size={20} color={Colors.gray400} />
              </TouchableOpacity>

              {/* Trilhas Públicas */}
              <TouchableOpacity
                style={styles.menuOption}
                onPress={handleRefreshTrails}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.menuOptionIcon,
                    { backgroundColor: Colors.orange500 + '20' },
                  ]}
                >
                  <Icon name="earth" size={22} color={Colors.orange500} />
                </View>
                <View style={styles.menuOptionContent}>
                  <Text style={styles.menuOptionText}>Trilhas Públicas</Text>
                  <Text style={styles.menuOptionSubtext}>
                    {loadingTrails
                      ? 'Carregando...'
                      : `${publicTrails.length} trilha${
                          publicTrails.length !== 1 ? 's' : ''
                        } na região`}
                  </Text>
                </View>
                {loadingTrails ? (
                  <ActivityIndicator
                    size={20}
                    color={Colors.orange500}
                    style={{ marginRight: 8 }}
                  />
                ) : publicTrails.length > 0 ? (
                  <View
                    style={[
                      styles.trailsBadge,
                      { backgroundColor: Colors.orange500 },
                    ]}
                  >
                    <Text style={styles.trailsBadgeText}>
                      {publicTrails.length}
                    </Text>
                  </View>
                ) : null}
                <Icon name="chevron-right" size={20} color={Colors.gray400} />
              </TouchableOpacity>

              {/* ✅ NOVA OPÇÃO: CONFIGURAÇÕES */}
              <TouchableOpacity
                style={styles.menuOption}
                onPress={() => {
                  setShowMenu(false);
                  // TODO: Implementar tela de configurações
                }}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.menuOptionIcon,
                    { backgroundColor: Colors.purple500 + '20' },
                  ]}
                >
                  <Icon name="cog" size={22} color={Colors.purple500} />
                </View>
                <View style={styles.menuOptionContent}>
                  <Text style={styles.menuOptionText}>Configurações</Text>
                  <Text style={styles.menuOptionSubtext}>
                    Preferências e ajustes do app
                  </Text>
                </View>
                <Icon name="chevron-right" size={20} color={Colors.gray400} />
              </TouchableOpacity>

              {/* ✅ NOVA OPÇÃO: SOBRE */}
              <TouchableOpacity
                style={styles.menuOption}
                onPress={() => {
                  setShowMenu(false);
                  // TODO: Implementar tela sobre
                }}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.menuOptionIcon,
                    { backgroundColor: Colors.infoBlue + '20' },
                  ]}
                >
                  <Icon name="information" size={22} color={Colors.infoBlue} />
                </View>
                <View style={styles.menuOptionContent}>
                  <Text style={styles.menuOptionText}>Sobre</Text>
                  <Text style={styles.menuOptionSubtext}>
                    Versão 1.0.0 • TrekSafe
                  </Text>
                </View>
                <Icon name="chevron-right" size={20} color={Colors.gray400} />
              </TouchableOpacity>
            </View>

            {/* ✅ FOOTER DO MENU */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowMenu(false)}
                activeOpacity={0.8}
              >
                <Icon name="close-circle" size={20} color={Colors.gray500} />
                <Text style={styles.closeButtonText}>Fechar Menu</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default MapControls;
