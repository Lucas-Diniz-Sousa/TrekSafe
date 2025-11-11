// src/components/MapControls/MapControls.js
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, ColorUtils } from '../../theme/theme';
import { createStyles } from './MapControls.styles';

const MapControls = ({
  isDarkMode,
  isMapReady,
  isRecording,
  savedTrails,
  publicTrails,
  publicTrailsVisible,
  loadingTrails,
  isSavingTrail,
  isAuthenticated,
  onZoomIn,
  onZoomOut,
  onCenterOnUser,
  onToggleRecording,
  onLogin,
  onLogout,
  onViewTrails,
  onRefreshTrails,
  onTogglePublicTrails,
}) => {
  // ✅ ESTADOS
  const [expandedPanel, setExpandedPanel] = useState(null);
  const [animatedValue] = useState(new Animated.Value(0));

  // ✅ ESTILOS
  const styles = createStyles(isDarkMode);

  // ✅ CORES DINÂMICAS BASEADAS NO TEMA
  const themedColors = useMemo(
    () => ({
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
      primaryBrand: Colors.verdeFlorestaProfundo,
      accentBrand: Colors.douradoNobre,
    }),
    [isDarkMode]
  );

  // ✅ ESTATÍSTICAS CALCULADAS
  const stats = useMemo(
    () => ({
      totalTrails: savedTrails.length,
      visibleTrails: savedTrails.filter(t => t.visible !== false).length,
      totalPublicTrails: publicTrails.length,
      visiblePublicTrails: publicTrailsVisible ? publicTrails.length : 0,
      totalDistance: savedTrails.reduce(
        (sum, trail) => sum + (trail.distance || 0),
        0
      ),
    }),
    [savedTrails, publicTrails, publicTrailsVisible]
  );

  // ✅ FUNÇÃO PARA ALTERNAR PAINEL EXPANDIDO
  const togglePanel = useCallback(
    panelName => {
      const isExpanding = expandedPanel !== panelName;
      setExpandedPanel(isExpanding ? panelName : null);

      Animated.timing(animatedValue, {
        toValue: isExpanding ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    },
    [expandedPanel, animatedValue]
  );

  // ✅ FUNÇÃO PARA CONFIRMAR LOGOUT
  const handleLogout = useCallback(() => {
    Alert.alert(
      'Fazer Logout',
      'Tem certeza que deseja sair da sua conta?\n\nSuas trilhas locais serão mantidas, mas você precisará fazer login novamente para sincronizar.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: () => {
            togglePanel(null);
            onLogout();
          },
        },
      ]
    );
  }, [onLogout, togglePanel]);

  // ✅ COMPONENTE DE BOTÃO PRINCIPAL
  const ControlButton = ({
    icon,
    onPress,
    style,
    iconColor,
    size = 24,
    disabled = false,
    loading = false,
    badge = null,
    longPress = false,
  }) => (
    <TouchableOpacity
      style={[styles.controlButton, disabled && styles.disabledButton, style]}
      onPress={disabled ? undefined : onPress}
      onLongPress={longPress ? onPress : undefined}
      activeOpacity={disabled ? 1 : 0.7}
      disabled={disabled}
    >
      {loading ? (
        <ActivityIndicator
          size={size * 0.75}
          color={iconColor || themedColors.textMuted}
        />
      ) : (
        <Icon name={icon} size={size} color={iconColor || themedColors.text} />
      )}
      {badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  // ✅ COMPONENTE DE PAINEL EXPANDIDO
  const ExpandedPanel = ({ title, children, visible }) => {
    if (!visible) return null;

    return (
      <Animated.View
        style={[
          styles.expandedPanel,
          {
            opacity: animatedValue,
            transform: [
              {
                translateY: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>{title}</Text>
          <TouchableOpacity
            onPress={() => togglePanel(null)}
            style={styles.closeButton}
          >
            <Icon name="close" size={20} color={themedColors.textMuted} />
          </TouchableOpacity>
        </View>
        <View style={styles.panelContent}>{children}</View>
      </Animated.View>
    );
  };

  // ✅ COMPONENTE DE ESTATÍSTICA
  const StatItem = ({ icon, label, value, color = themedColors.text }) => (
    <View style={styles.statItem}>
      <Icon name={icon} size={16} color={color} />
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );

  // ✅ COMPONENTE DE BOTÃO DE AÇÃO
  const ActionButton = ({
    icon,
    label,
    onPress,
    color = Colors.infoBlue,
    disabled = false,
  }) => (
    <TouchableOpacity
      style={[
        styles.actionButton,
        {
          backgroundColor: disabled
            ? ColorUtils.getThemeColor(
                Colors.gray200,
                Colors.gray700,
                isDarkMode
              )
            : ColorUtils.withOpacity(color, 0.1),
          borderColor: disabled
            ? ColorUtils.getThemeColor(
                Colors.gray300,
                Colors.gray600,
                isDarkMode
              )
            : color,
        },
      ]}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Icon
        name={icon}
        size={18}
        color={disabled ? themedColors.textMuted : color}
      />
      <Text
        style={[
          styles.actionButtonText,
          { color: disabled ? themedColors.textMuted : color },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <>
      {/* ✅ CONTROLES PRINCIPAIS - LADO DIREITO */}
      <View style={styles.rightControls}>
        {/* ZOOM IN */}
        <ControlButton icon="plus" onPress={onZoomIn} disabled={!isMapReady} />

        {/* ZOOM OUT */}
        <ControlButton
          icon="minus"
          onPress={onZoomOut}
          disabled={!isMapReady}
          style={{ marginTop: 8 }}
        />

        {/* CENTRALIZAR NO USUÁRIO */}
        <ControlButton
          icon="crosshairs-gps"
          onPress={onCenterOnUser}
          disabled={!isMapReady}
          iconColor={Colors.infoBlue}
          style={{ marginTop: 16 }}
        />

        {/* ESTATÍSTICAS */}
        <ControlButton
          icon="chart-line"
          onPress={() => togglePanel('stats')}
          disabled={!isMapReady}
          iconColor={Colors.successGreen}
          style={{ marginTop: 16 }}
          badge={stats.totalTrails > 0 ? stats.totalTrails : null}
        />

        {/* TRILHAS */}
        <ControlButton
          icon="map-marker-path"
          onPress={onViewTrails}
          disabled={!isMapReady}
          iconColor={Colors.purple500}
          style={{ marginTop: 8 }}
        />
      </View>

      {/* ✅ CONTROLES INFERIORES */}
      <View style={styles.bottomControls}>
        {/* PAINEL DE INFORMAÇÕES */}
        <View style={styles.infoPanel}>
          {/* STATUS DE GRAVAÇÃO */}
          {isRecording && (
            <View style={styles.recordingStatus}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>Gravando</Text>
            </View>
          )}

          {/* STATUS DE SALVAMENTO */}
          {isSavingTrail && (
            <View style={styles.savingStatus}>
              <ActivityIndicator size={16} color={Colors.infoBlue} />
              <Text style={styles.savingText}>Salvando trilha...</Text>
            </View>
          )}

          {/* STATUS DE CARREGAMENTO */}
          {loadingTrails && (
            <View style={styles.loadingStatus}>
              <ActivityIndicator size={16} color={Colors.warningOrange} />
              <Text style={styles.loadingText}>Carregando trilhas...</Text>
            </View>
          )}

          {/* STATUS NORMAL */}
          {!isRecording && !isSavingTrail && !loadingTrails && (
            <View style={styles.normalStatus}>
              <Icon
                name={isAuthenticated ? 'account-check' : 'account-off'}
                size={16}
                color={
                  isAuthenticated ? Colors.successGreen : themedColors.textMuted
                }
              />
              <Text style={styles.statusText}>
                {isAuthenticated ? 'Conectado' : 'Offline'}
              </Text>
              {stats.totalTrails > 0 && (
                <>
                  <Text style={styles.separator}>•</Text>
                  <Text
                    style={[
                      styles.statusText,
                      { color: themedColors.textMuted },
                    ]}
                  >
                    {stats.totalTrails} trilha
                    {stats.totalTrails !== 1 ? 's' : ''}
                  </Text>
                </>
              )}
            </View>
          )}
        </View>

        {/* BOTÃO PRINCIPAL DE GRAVAÇÃO */}
        <TouchableOpacity
          style={[
            styles.recordButton,
            {
              backgroundColor: isRecording
                ? Colors.errorRed
                : themedColors.primaryBrand,
            },
            !isMapReady && styles.disabledButton,
          ]}
          onPress={onToggleRecording}
          disabled={!isMapReady}
          activeOpacity={0.8}
        >
          <Icon
            name={isRecording ? 'stop' : 'play'}
            size={28}
            color={Colors.white}
          />
        </TouchableOpacity>

        {/* BOTÃO DE LOGIN/MENU */}
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => togglePanel('menu')}
          activeOpacity={0.7}
        >
          <Icon
            name={isAuthenticated ? 'account-circle' : 'login'}
            size={24}
            color={
              isAuthenticated ? themedColors.primaryBrand : themedColors.text
            }
          />
        </TouchableOpacity>
      </View>

      {/* ✅ PAINEL DE ESTATÍSTICAS */}
      <ExpandedPanel title="Estatísticas" visible={expandedPanel === 'stats'}>
        <StatItem
          icon="map-marker-path"
          label="Trilhas Salvas"
          value={`${stats.visibleTrails}/${stats.totalTrails}`}
          color={Colors.successGreen}
        />
        <StatItem
          icon="earth"
          label="Trilhas Públicas"
          value={`${stats.visiblePublicTrails}/${stats.totalPublicTrails}`}
          color={Colors.infoBlue}
        />
        <StatItem
          icon="map-marker-distance"
          label="Distância Total"
          value={`${stats.totalDistance.toFixed(1)} km`}
          color={Colors.warningOrange}
        />
        <StatItem
          icon="eye"
          label="Visibilidade Públicas"
          value={publicTrailsVisible ? 'Visíveis no mapa' : 'Ocultas no mapa'}
          color={
            publicTrailsVisible ? Colors.successGreen : themedColors.textMuted
          }
        />

        <View style={styles.actionButtonsRow}>
          <ActionButton
            icon={publicTrailsVisible ? 'eye-off' : 'eye'}
            label={
              publicTrailsVisible ? 'Ocultar Públicas' : 'Mostrar Públicas'
            }
            onPress={() => onTogglePublicTrails(!publicTrailsVisible)}
            color={Colors.infoBlue}
          />
          <ActionButton
            icon="refresh"
            label="Atualizar"
            onPress={onRefreshTrails}
            color={Colors.warningOrange}
            disabled={loadingTrails}
          />
        </View>
      </ExpandedPanel>

      {/* ✅ PAINEL DE MENU */}
      <ExpandedPanel title="Menu" visible={expandedPanel === 'menu'}>
        {!isAuthenticated ? (
          <>
            <View style={styles.loginPrompt}>
              <Icon name="account-plus" size={32} color={Colors.infoBlue} />
              <Text style={styles.loginTitle}>Faça Login</Text>
              <Text style={styles.loginSubtitle}>
                Sincronize suas trilhas na nuvem e acesse de qualquer
                dispositivo
              </Text>
            </View>
            <ActionButton
              icon="login"
              label="Fazer Login"
              onPress={onLogin}
              color={Colors.infoBlue}
            />
          </>
        ) : (
          <>
            <View style={styles.userInfo}>
              <Icon
                name="account-check-outline"
                size={24}
                color={Colors.successGreen}
              />
              <Text style={styles.userText}>Conectado com sucesso</Text>
            </View>
            <View style={styles.actionButtonsRow}>
              <ActionButton
                icon="map-marker-path"
                label="Minhas Trilhas"
                onPress={onViewTrails}
                color={Colors.purple500}
              />
              <ActionButton
                icon="logout"
                label="Sair"
                onPress={handleLogout}
                color={Colors.errorRed}
              />
            </View>
          </>
        )}
      </ExpandedPanel>

      {/* ✅ OVERLAY PARA FECHAR PAINÉIS */}
      {expandedPanel && (
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => togglePanel(null)}
          activeOpacity={1}
        />
      )}
    </>
  );
};

export default MapControls;
