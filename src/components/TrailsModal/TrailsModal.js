// src/components/TrailsModal/TrailsModal.js
import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, ColorUtils } from '../../theme/theme';
import { createStyles } from './TrailsModal.styles';

const TrailsModal = ({
  visible,
  isDarkMode,
  trails = [],
  publicTrails = [],
  visiblePublicTrails = new Set(),
  publicTrailsVisible = true,
  isAuthenticated = false,
  isOnline = true,
  syncStatus = 'synced',
  offlineQueueCount = 0,
  onClose,
  onUpdateTrail,
  onDeleteTrail,
  onToggleTrailVisibility,
  onTogglePublicTrailVisibility,
  onToggleAllPublicTrails,
  onRefreshPublicTrails,
}) => {
  // ✅ ESTADOS
  const [activeTab, setActiveTab] = useState('mine');
  const [refreshing, setRefreshing] = useState(false);
  const [expandedTrail, setExpandedTrail] = useState(null);

  // ✅ ESTILOS
  const styles = createStyles(isDarkMode);

  // ✅ CORES DINÂMICAS
  const themedColors = {
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
  };

  // ✅ FUNÇÃO PARA REFRESH
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (onRefreshPublicTrails) {
        await onRefreshPublicTrails();
      }
    } catch (error) {
      console.warn('Erro ao atualizar trilhas:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // ✅ FUNÇÃO PARA FORMATAR DATA
  const formatDate = dateString => {
    if (!dateString) return 'Data não disponível';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Data inválida';
    }
  };

  // ✅ FUNÇÃO PARA FORMATAR DISTÂNCIA
  const formatDistance = distance => {
    if (!distance || distance === 0) return '0 km';
    if (distance < 1) {
      return `${(distance * 1000).toFixed(0)} m`;
    }
    return `${distance.toFixed(2)} km`;
  };

  // ✅ FUNÇÃO PARA FORMATAR DURAÇÃO
  const formatDuration = seconds => {
    if (!seconds || seconds === 0) return '0 min';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes} min`;
  };

  // ✅ FUNÇÃO PARA OBTER ÍCONE DE STATUS
  const getStatusIcon = trail => {
    if (trail.isPublic) return 'earth';
    if (trail.apiId) return 'cloud-check';
    return 'content-save';
  };

  // ✅ FUNÇÃO PARA OBTER COR DE STATUS
  const getStatusColor = trail => {
    if (trail.isPublic) return Colors.infoBlue;
    if (trail.apiId) return Colors.successGreen;
    return Colors.warningOrange;
  };

  // ✅ COMPONENTE DE ITEM DE TRILHA MELHORADO
  const TrailItem = ({ item, isPublic = false }) => {
    const trailId = item._id || item.id;
    const isExpanded = expandedTrail === trailId;
    const isVisible = isPublic
      ? visiblePublicTrails.has(trailId)
      : item.visible !== false;

    return (
      <View style={styles.trailItem}>
        {/* CABEÇALHO DA TRILHA */}
        <TouchableOpacity
          style={styles.trailHeader}
          onPress={() => setExpandedTrail(isExpanded ? null : trailId)}
          activeOpacity={0.7}
        >
          <View style={styles.trailHeaderLeft}>
            <View style={styles.trailTitleRow}>
              <Text style={styles.trailTitle} numberOfLines={1}>
                {item.title || item.name || 'Trilha sem nome'}
              </Text>
              <View style={styles.statusContainer}>
                <Icon
                  name={getStatusIcon(item)}
                  size={16}
                  color={getStatusColor(item)}
                />
                {isPublic && <Text style={styles.statusText}>Pública</Text>}
              </View>
            </View>

            <View style={styles.trailMetrics}>
              <View style={styles.metric}>
                <Icon
                  name="map-marker-distance"
                  size={14}
                  color={themedColors.textMuted}
                />
                <Text style={styles.metricText}>
                  {formatDistance(item.totalDistance || item.distance)}
                </Text>
              </View>

              <View style={styles.metric}>
                <Icon
                  name="clock-outline"
                  size={14}
                  color={themedColors.textMuted}
                />
                <Text style={styles.metricText}>
                  {formatDuration(item.durationSeconds || item.duration)}
                </Text>
              </View>

              <View style={styles.metric}>
                <Icon
                  name="map-marker-multiple"
                  size={14}
                  color={themedColors.textMuted}
                />
                <Text style={styles.metricText}>
                  {item.coordinates?.length || item.points?.length || 0} pts
                </Text>
              </View>

              <View style={styles.metric}>
                <Icon
                  name="map-marker-star"
                  size={14}
                  color={themedColors.textMuted}
                />
                <Text style={styles.metricText}>
                  {item.pois?.length || 0} POIs
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.trailHeaderRight}>
            <Icon
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={24}
              color={themedColors.textMuted}
            />
          </View>
        </TouchableOpacity>

        {/* DETALHES EXPANDIDOS */}
        {isExpanded && (
          <View style={styles.trailDetails}>
            {/* DESCRIÇÃO */}
            {item.description && (
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Descrição:</Text>
                <Text style={styles.detailText}>{item.description}</Text>
              </View>
            )}

            {/* DATAS */}
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Criada em:</Text>
              <Text style={styles.detailText}>
                {formatDate(item.startedAt || item.createdAt || item.date)}
              </Text>
            </View>

            {item.endedAt && (
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Finalizada em:</Text>
                <Text style={styles.detailText}>
                  {formatDate(item.endedAt)}
                </Text>
              </View>
            )}

            {/* CONTROLES */}
            <View style={styles.trailControls}>
              {/* VISIBILIDADE */}
              <View style={styles.controlRow}>
                <Text style={styles.controlLabel}>
                  {isPublic ? 'Mostrar no mapa' : 'Visível no mapa'}
                </Text>
                <Switch
                  value={isVisible}
                  onValueChange={value => {
                    if (isPublic) {
                      onTogglePublicTrailVisibility?.(trailId, value);
                    } else {
                      onToggleTrailVisibility?.(trailId, value);
                    }
                  }}
                  trackColor={{
                    false: Colors.gray300,
                    true: Colors.verdeFlorestaProfundo,
                  }}
                  thumbColor={isVisible ? Colors.white : Colors.gray500}
                />
              </View>

              {/* BOTÕES DE AÇÃO - APENAS PARA TRILHAS PRÓPRIAS */}
              {!isPublic && isAuthenticated && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => {
                      // TODO: Implementar edição de trilha
                      Alert.alert(
                        'Em breve',
                        'Funcionalidade de edição será implementada em breve.'
                      );
                    }}
                    activeOpacity={0.7}
                  >
                    <Icon name="pencil" size={16} color={Colors.white} />
                    <Text style={styles.actionButtonText}>Editar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => {
                      Alert.alert(
                        'Excluir Trilha',
                        `Tem certeza que deseja excluir "${
                          item.title || item.name
                        }"?`,
                        [
                          { text: 'Cancelar', style: 'cancel' },
                          {
                            text: 'Excluir',
                            style: 'destructive',
                            onPress: () => onDeleteTrail?.(trailId),
                          },
                        ]
                      );
                    }}
                    activeOpacity={0.7}
                  >
                    <Icon name="delete" size={16} color={Colors.white} />
                    <Text style={styles.actionButtonText}>Excluir</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}
      </View>
    );
  };

  // ✅ COMPONENTE DE LISTA VAZIA
  const EmptyListComponent = ({ isPublic = false }) => (
    <View style={styles.emptyContainer}>
      <Icon
        name={isPublic ? 'earth-off' : 'map-marker-off'}
        size={64}
        color={themedColors.textMuted}
      />
      <Text style={styles.emptyTitle}>
        {isPublic
          ? 'Nenhuma trilha pública encontrada'
          : 'Nenhuma trilha salva'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {isPublic
          ? 'Não há trilhas públicas disponíveis nesta região.'
          : isAuthenticated
          ? 'Comece gravando sua primeira trilha!'
          : 'Faça login para ver suas trilhas salvas.'}
      </Text>
    </View>
  );

  // ✅ DADOS PROCESSADOS
  const processedPublicTrails = useMemo(() => {
    return publicTrails.map(trail => ({
      ...trail,
      id: trail._id || trail.id,
      points: trail.coordinates || trail.points || [],
      pois: trail.pois || [],
    }));
  }, [publicTrails]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* ✅ CABEÇALHO */}
          <View style={styles.header}>
            <Text style={styles.title}>Trilhas</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={themedColors.text} />
            </TouchableOpacity>
          </View>

          {/* ✅ STATUS DE CONECTIVIDADE */}
          {!isOnline && (
            <View style={styles.connectivityBanner}>
              <Icon name="cloud-off-outline" size={20} color={Colors.white} />
              <Text style={styles.connectivityText}>
                Modo Offline{' '}
                {offlineQueueCount > 0 && `(${offlineQueueCount} pendentes)`}
              </Text>
            </View>
          )}

          {/* ✅ TABS */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'mine' && styles.activeTab]}
              onPress={() => setActiveTab('mine')}
              activeOpacity={0.7}
            >
              <Icon
                name="account"
                size={20}
                color={
                  activeTab === 'mine' ? Colors.white : themedColors.textMuted
                }
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'mine' && styles.activeTabText,
                ]}
              >
                Minhas ({trails.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'public' && styles.activeTab]}
              onPress={() => setActiveTab('public')}
              activeOpacity={0.7}
            >
              <Icon
                name="earth"
                size={20}
                color={
                  activeTab === 'public' ? Colors.white : themedColors.textMuted
                }
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'public' && styles.activeTabText,
                ]}
              >
                Públicas ({processedPublicTrails.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* ✅ CONTEÚDO DAS TABS */}
          <View style={styles.content}>
            {activeTab === 'mine' ? (
              /* MINHAS TRILHAS */
              <View style={styles.tabContent}>
                {!isAuthenticated ? (
                  <View style={styles.loginPrompt}>
                    <Icon
                      name="account-alert"
                      size={48}
                      color={themedColors.textMuted}
                    />
                    <Text style={styles.loginPromptTitle}>
                      Login Necessário
                    </Text>
                    <Text style={styles.loginPromptText}>
                      Faça login para ver suas trilhas salvas e sincronizar com
                      a nuvem.
                    </Text>
                  </View>
                ) : (
                  <FlatList
                    data={trails}
                    keyExtractor={item => item._id || item.id || item.date}
                    renderItem={({ item }) => (
                      <TrailItem item={item} isPublic={false} />
                    )}
                    ListEmptyComponent={() => (
                      <EmptyListComponent isPublic={false} />
                    )}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                      <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[Colors.verdeFlorestaProfundo]}
                        tintColor={Colors.verdeFlorestaProfundo}
                      />
                    }
                  />
                )}
              </View>
            ) : (
              /* TRILHAS PÚBLICAS */
              <View style={styles.tabContent}>
                {/* CONTROLE DE VISIBILIDADE GERAL */}
                <View style={styles.publicControlsHeader}>
                  <View style={styles.controlRow}>
                    <Text style={styles.controlLabel}>
                      Mostrar trilhas públicas no mapa
                    </Text>
                    <Switch
                      value={publicTrailsVisible}
                      onValueChange={onToggleAllPublicTrails}
                      trackColor={{
                        false: Colors.gray300,
                        true: Colors.verdeFlorestaProfundo,
                      }}
                      thumbColor={
                        publicTrailsVisible ? Colors.white : Colors.gray500
                      }
                    />
                  </View>
                </View>

                <FlatList
                  data={processedPublicTrails}
                  keyExtractor={item => item._id || item.id}
                  renderItem={({ item }) => (
                    <TrailItem item={item} isPublic={true} />
                  )}
                  ListEmptyComponent={() => (
                    <EmptyListComponent isPublic={true} />
                  )}
                  showsVerticalScrollIndicator={false}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={handleRefresh}
                      colors={[Colors.verdeFlorestaProfundo]}
                      tintColor={Colors.verdeFlorestaProfundo}
                    />
                  }
                />
              </View>
            )}
          </View>

          {/* ✅ FOOTER COM STATUS */}
          <View style={styles.footer}>
            <View style={styles.statusRow}>
              <View style={styles.statusItem}>
                <Icon
                  name={
                    syncStatus === 'syncing'
                      ? 'sync'
                      : syncStatus === 'synced'
                      ? 'check-circle'
                      : 'alert-circle'
                  }
                  size={16}
                  color={
                    syncStatus === 'syncing'
                      ? Colors.infoBlue
                      : syncStatus === 'synced'
                      ? Colors.successGreen
                      : Colors.errorRed
                  }
                />
                <Text style={styles.statusText}>
                  {syncStatus === 'syncing'
                    ? 'Sincronizando...'
                    : syncStatus === 'synced'
                    ? 'Sincronizado'
                    : 'Erro de sincronização'}
                </Text>
              </View>

              {isOnline && (
                <TouchableOpacity
                  style={styles.refreshButton}
                  onPress={handleRefresh}
                  disabled={refreshing}
                  activeOpacity={0.7}
                >
                  <Icon
                    name="refresh"
                    size={16}
                    color={Colors.verdeFlorestaProfundo}
                  />
                  <Text style={styles.refreshButtonText}>Atualizar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default TrailsModal;
