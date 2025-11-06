// src/components/TrailsModal/TrailsModal.js
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Share,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ApiService from '../../services/api';
import { Colors, ColorUtils } from '../../theme/theme';
import { createStyles } from './TrailsModal.styles';

const TrailsModal = ({
  visible,
  isDarkMode,
  trails,
  publicTrails = [],
  visiblePublicTrails = new Set(),
  publicTrailsVisible = true,
  isAuthenticated,
  onClose,
  onUpdateTrail,
  onDeleteTrail,
  onToggleTrailVisibility,
  onTogglePublicTrailVisibility,
  onToggleAllPublicTrails,
  onRefreshPublicTrails,
}) => {
  const [editingTrail, setEditingTrail] = useState(null);
  const [editName, setEditName] = useState('');
  const [activeTab, setActiveTab] = useState('mine');
  const [loadingExport, setLoadingExport] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(null);
  const styles = createStyles(isDarkMode);

  const formatDate = dateString => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString('pt-BR') +
      ' ' +
      date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    );
  };

  const formatDuration = seconds => {
    if (!seconds) return '0min';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  };

  const handleEditTrail = trail => {
    setEditingTrail(trail.id);
    setEditName(
      trail.name || `Trilha ${formatDate(trail.date || trail.createdAt)}`
    );
  };

  const handleSaveEdit = trailId => {
    if (editName.trim()) {
      onUpdateTrail(trailId, { name: editName.trim() });
      setEditingTrail(null);
      setEditName('');
    }
  };

  const handleCancelEdit = () => {
    setEditingTrail(null);
    setEditName('');
  };

  const handleDeleteTrail = trail => {
    Alert.alert(
      'Excluir Trilha',
      `Tem certeza que deseja excluir a trilha "${
        trail.name || formatDate(trail.date || trail.createdAt)
      }"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => onDeleteTrail(trail.id),
        },
      ]
    );
  };

  const handleShareTrail = async trail => {
    try {
      const trailInfo = `🥾 Trilha: ${
        trail.name || formatDate(trail.date || trail.createdAt)
      }
📅 Data: ${formatDate(trail.date || trail.createdAt)}
📏 Distância: ${(trail.distance || trail.totalDistance || 0).toFixed(2)}km
⏱️ Duração: ${formatDuration(trail.duration || trail.durationSeconds)}
📍 Pontos: ${trail.points?.length || trail.coords?.length || 0}
🎯 POIs: ${trail.pois?.length || 0}

Gravado com TrekSafe 🌲`;

      await Share.share({
        message: trailInfo,
        title: 'Compartilhar Trilha',
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível compartilhar a trilha.');
    }
  };

  // EXPORTAÇÃO CORRIGIDA COM ENDPOINTS REAIS
  const handleExportTrail = async (trail, format) => {
    if (!trail.apiId) {
      Alert.alert(
        'Aviso',
        'Esta trilha não está sincronizada com o servidor. Apenas trilhas online podem ser exportadas.'
      );
      return;
    }

    setLoadingExport(trail.id);

    try {
      console.log(`📤 Exportando trilha ${trail.apiId} em formato ${format}`);

      const result = await ApiService.exportarTrilha(trail.apiId, format);

      if (result.success) {
        const fileName = `${trail.name || 'trilha'}.${format}`;

        let shareData;
        if (format === 'json') {
          shareData = {
            message: JSON.stringify(result.data, null, 2),
            title: fileName,
          };
        } else {
          shareData = {
            message: result.data,
            title: fileName,
          };
        }

        await Share.share(shareData);
        console.log('✅ Trilha exportada com sucesso');
      } else {
        throw new Error(result.message || 'Erro ao exportar trilha');
      }
    } catch (error) {
      console.error('❌ Erro ao exportar trilha:', error);
      Alert.alert(
        'Erro',
        `Não foi possível exportar a trilha: ${error.message}`
      );
    } finally {
      setLoadingExport(null);
    }
  };

  const handleExportOptions = trail => {
    Alert.alert('Exportar Trilha', 'Escolha o formato de exportação:', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'GPX (GPS)',
        onPress: () => handleExportTrail(trail, 'gpx'),
        style: 'default',
      },
      {
        text: 'JSON (Dados)',
        onPress: () => handleExportTrail(trail, 'json'),
        style: 'default',
      },
      {
        text: 'TXT (Texto)',
        onPress: () => handleExportTrail(trail, 'txt'),
        style: 'default',
      },
    ]);
  };

  // DETALHES DA TRILHA COM ENDPOINT CORRETO
  const handleViewTrailDetails = async trail => {
    if (!trail.apiId) {
      Alert.alert(
        'Info',
        'Detalhes completos disponíveis apenas para trilhas sincronizadas.'
      );
      return;
    }

    setLoadingDetails(trail.id);

    try {
      const result = await ApiService.getTrilhaDetalhes(trail.apiId);

      if (result.success) {
        const details = result.data;
        const detailsText = `📊 DETALHES DA TRILHA

🏷️ Nome: ${details.title || trail.name}
📅 Data: ${formatDate(details.createdAt)}
📏 Distância: ${(details.totalDistance || 0).toFixed(2)}km
⏱️ Duração: ${formatDuration(details.durationSeconds)}
📍 Coordenadas: ${details.coords?.length || 0}
🎯 POIs: ${details.pois?.length || 0}
🌐 Pública: ${details.isPublic ? 'Sim' : 'Não'}
☁️ Online: ${details.isOnline ? 'Sim' : 'Não'}

📝 Descrição:
${details.description || 'Sem descrição'}`;

        Alert.alert('Detalhes da Trilha', detailsText, [
          { text: 'Fechar', style: 'cancel' },
          {
            text: 'Compartilhar',
            onPress: () => Share.share({ message: detailsText }),
          },
        ]);
      } else {
        throw new Error(result.message || 'Erro ao carregar detalhes');
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
      Alert.alert(
        'Erro',
        `Não foi possível carregar os detalhes: ${error.message}`
      );
    } finally {
      setLoadingDetails(null);
    }
  };

  const renderTrailItem = ({ item: trail }) => {
    const isEditing = editingTrail === trail.id;
    const trailName =
      trail.name || `Trilha ${formatDate(trail.date || trail.createdAt)}`;
    const isExporting = loadingExport === trail.id;
    const isLoadingDetails = loadingDetails === trail.id;

    return (
      <View style={styles.trailItem}>
        <View style={styles.trailHeader}>
          <View style={styles.trailInfo}>
            {isEditing ? (
              <TextInput
                style={styles.editInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Nome da trilha"
                placeholderTextColor={ColorUtils.getThemeColor(
                  Colors.inputPlaceholder,
                  Colors.gray400,
                  isDarkMode
                )}
                autoFocus
              />
            ) : (
              <>
                <TouchableOpacity
                  onPress={() => handleViewTrailDetails(trail)}
                  disabled={!trail.apiId}
                  activeOpacity={trail.apiId ? 0.7 : 1}
                >
                  <Text
                    style={[
                      styles.trailName,
                      trail.apiId && { textDecorationLine: 'underline' },
                    ]}
                  >
                    {trailName}
                    {isLoadingDetails && (
                      <ActivityIndicator
                        size={12}
                        color={Colors.blue500}
                        style={{ marginLeft: 8 }}
                      />
                    )}
                  </Text>
                </TouchableOpacity>

                <View style={styles.badgeContainer}>
                  {trail.apiId && (
                    <View style={styles.syncBadge}>
                      <Icon
                        name="cloud-check"
                        size={12}
                        color={Colors.successGreen}
                      />
                      <Text style={styles.syncText}>Sincronizada</Text>
                    </View>
                  )}
                </View>
              </>
            )}
            <Text style={styles.trailDate}>
              {formatDate(trail.date || trail.createdAt)}
            </Text>
          </View>

          <View style={styles.visibilityContainer}>
            <Text style={styles.visibilityLabel}>
              {trail.visible ? 'Visível' : 'Oculta'}
            </Text>
            <Switch
              value={trail.visible !== false}
              onValueChange={value => onToggleTrailVisibility(trail.id, value)}
              trackColor={{
                false: ColorUtils.getThemeColor(
                  Colors.gray300,
                  Colors.gray600,
                  isDarkMode
                ),
                true: Colors.successGreen,
              }}
              thumbColor={
                trail.visible !== false ? Colors.white : Colors.gray400
              }
              ios_backgroundColor={ColorUtils.getThemeColor(
                Colors.gray300,
                Colors.gray600,
                isDarkMode
              )}
            />
          </View>
        </View>

        <View style={styles.trailStats}>
          <View style={styles.statItem}>
            <Icon
              name="map-marker-distance"
              size={16}
              color={Colors.infoBlue}
            />
            <Text style={styles.statText}>
              {(trail.distance || trail.totalDistance || 0).toFixed(2)}km
            </Text>
          </View>

          <View style={styles.statItem}>
            <Icon name="timer" size={16} color={Colors.orange500} />
            <Text style={styles.statText}>
              {formatDuration(trail.duration || trail.durationSeconds)}
            </Text>
          </View>

          <View style={styles.statItem}>
            <Icon
              name="map-marker-multiple"
              size={16}
              color={Colors.purple500}
            />
            <Text style={styles.statText}>
              {trail.points?.length || trail.coords?.length || 0} pts
            </Text>
          </View>

          {(trail.pois?.length || 0) > 0 && (
            <View style={styles.statItem}>
              <Icon name="map-marker-star" size={16} color={Colors.orange500} />
              <Text style={styles.statText}>{trail.pois.length} POIs</Text>
            </View>
          )}

          {trail.visible && (
            <View style={styles.statItem}>
              <Icon name="eye" size={16} color={Colors.successGreen} />
              <Text style={styles.statText}>No mapa</Text>
            </View>
          )}
        </View>

        <View style={styles.trailActions}>
          {isEditing ? (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.saveButton]}
                onPress={() => handleSaveEdit(trail.id)}
                activeOpacity={0.8}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="check" size={16} color={Colors.white} />
                <Text style={styles.actionButtonText}>Salvar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={handleCancelEdit}
                activeOpacity={0.8}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="close" size={16} color={Colors.white} />
                <Text style={styles.actionButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => handleEditTrail(trail)}
                activeOpacity={0.8}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="pencil" size={16} color={Colors.white} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.shareButton]}
                onPress={() => handleShareTrail(trail)}
                activeOpacity={0.8}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="share-variant" size={16} color={Colors.white} />
              </TouchableOpacity>

              {trail.apiId && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.exportButton]}
                  onPress={() => handleExportOptions(trail)}
                  activeOpacity={0.8}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <ActivityIndicator size={16} color={Colors.white} />
                  ) : (
                    <Icon name="download" size={16} color={Colors.white} />
                  )}
                </TouchableOpacity>
              )}

              {trail.apiId && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.detailsButton]}
                  onPress={() => handleViewTrailDetails(trail)}
                  activeOpacity={0.8}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  disabled={isLoadingDetails}
                >
                  {isLoadingDetails ? (
                    <ActivityIndicator size={16} color={Colors.white} />
                  ) : (
                    <Icon name="information" size={16} color={Colors.white} />
                  )}
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDeleteTrail(trail)}
                activeOpacity={0.8}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="delete" size={16} color={Colors.white} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  // RENDERIZAR TRILHA PÚBLICA COM CONTROLE DE VISIBILIDADE
  const renderPublicTrailItem = ({ item: trail }) => {
    const trailId = trail._id || trail.id;
    const isVisible = visiblePublicTrails.has(trailId);
    const isLoadingDetails = loadingDetails === trailId;

    return (
      <View style={styles.trailItem}>
        <View style={styles.trailHeader}>
          <View style={styles.trailInfo}>
            <TouchableOpacity
              onPress={() => handleViewTrailDetails(trail)}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.trailName, { textDecorationLine: 'underline' }]}
              >
                {trail.title ||
                  trail.name ||
                  `Trilha ${formatDate(trail.createdAt)}`}
                {isLoadingDetails && (
                  <ActivityIndicator
                    size={12}
                    color={Colors.blue500}
                    style={{ marginLeft: 8 }}
                  />
                )}
              </Text>
            </TouchableOpacity>

            <View style={styles.badgeContainer}>
              <View
                style={[
                  styles.syncBadge,
                  { backgroundColor: Colors.blue500 + '20' },
                ]}
              >
                <Icon name="earth" size={12} color={Colors.blue500} />
                <Text style={[styles.syncText, { color: Colors.blue500 }]}>
                  Pública
                </Text>
              </View>
              {trail.user && (
                <View
                  style={[
                    styles.syncBadge,
                    { backgroundColor: Colors.green500 + '20' },
                  ]}
                >
                  <Icon name="account" size={12} color={Colors.green500} />
                  <Text style={[styles.syncText, { color: Colors.green500 }]}>
                    {trail.user.name || 'Usuário'}
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.trailDate}>{formatDate(trail.createdAt)}</Text>
          </View>

          {/* CONTROLE DE VISIBILIDADE PARA TRILHA PÚBLICA */}
          <View style={styles.visibilityContainer}>
            <Text style={styles.visibilityLabel}>
              {isVisible ? 'Visível' : 'Oculta'}
            </Text>
            <Switch
              value={isVisible}
              onValueChange={value =>
                onTogglePublicTrailVisibility(trailId, value)
              }
              trackColor={{
                false: ColorUtils.getThemeColor(
                  Colors.gray300,
                  Colors.gray600,
                  isDarkMode
                ),
                true: Colors.blue500,
              }}
              thumbColor={isVisible ? Colors.white : Colors.gray400}
              ios_backgroundColor={ColorUtils.getThemeColor(
                Colors.gray300,
                Colors.gray600,
                isDarkMode
              )}
            />
          </View>
        </View>

        {/* Stats da trilha */}
        <View style={styles.trailStats}>
          <View style={styles.statItem}>
            <Icon
              name="map-marker-distance"
              size={16}
              color={Colors.infoBlue}
            />
            <Text style={styles.statText}>
              {(trail.totalDistance || 0).toFixed(2)}km
            </Text>
          </View>

          <View style={styles.statItem}>
            <Icon name="timer" size={16} color={Colors.orange500} />
            <Text style={styles.statText}>
              {formatDuration(trail.durationSeconds)}
            </Text>
          </View>

          <View style={styles.statItem}>
            <Icon
              name="map-marker-multiple"
              size={16}
              color={Colors.purple500}
            />
            <Text style={styles.statText}>
              {trail.coords?.length || trail.points?.length || 0} pts
            </Text>
          </View>

          {(trail.pois?.length || 0) > 0 && (
            <View style={styles.statItem}>
              <Icon name="map-marker-star" size={16} color={Colors.orange500} />
              <Text style={styles.statText}>{trail.pois.length} POIs</Text>
            </View>
          )}

          {isVisible && (
            <View style={styles.statItem}>
              <Icon name="eye" size={16} color={Colors.blue500} />
              <Text style={styles.statText}>No mapa</Text>
            </View>
          )}
        </View>

        {/* Ações da trilha pública */}
        <View style={styles.trailActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.shareButton]}
            onPress={() => handleShareTrail(trail)}
            activeOpacity={0.8}
          >
            <Icon name="share-variant" size={16} color={Colors.white} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.detailsButton]}
            onPress={() => handleViewTrailDetails(trail)}
            activeOpacity={0.8}
            disabled={isLoadingDetails}
          >
            {isLoadingDetails ? (
              <ActivityIndicator size={16} color={Colors.white} />
            ) : (
              <Icon name="information" size={16} color={Colors.white} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // HEADER COM CONTROLE GERAL DE TRILHAS PÚBLICAS
  const renderPublicTrailsHeader = () => (
    <View style={styles.publicTrailsHeader}>
      <View style={styles.publicTrailsInfo}>
        <Text style={styles.publicTrailsTitle}>
          Trilhas Públicas ({publicTrails.length})
        </Text>
        <Text style={styles.publicTrailsSubtitle}>
          {visiblePublicTrails.size} de {publicTrails.length} visíveis no mapa
        </Text>
      </View>

      <View style={styles.publicTrailsControls}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            {
              backgroundColor: publicTrailsVisible
                ? Colors.blue500
                : Colors.gray400,
            },
          ]}
          onPress={() => onToggleAllPublicTrails(!publicTrailsVisible)}
          activeOpacity={0.8}
        >
          <Icon
            name={publicTrailsVisible ? 'eye' : 'eye-off'}
            size={16}
            color={Colors.white}
          />
          <Text style={styles.toggleButtonText}>
            {publicTrailsVisible ? 'Ocultar Todas' : 'Mostrar Todas'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTabButton = (tabKey, title, count) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tabKey && styles.tabButtonActive]}
      onPress={() => setActiveTab(tabKey)}
      activeOpacity={0.8}
    >
      <Text
        style={[
          styles.tabButtonText,
          activeTab === tabKey && styles.tabButtonTextActive,
        ]}
      >
        {title} {count > 0 && `(${count})`}
      </Text>
    </TouchableOpacity>
  );

  const currentTrails = activeTab === 'mine' ? trails : publicTrails;
  const renderItem =
    activeTab === 'mine' ? renderTrailItem : renderPublicTrailItem;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity style={styles.modalContent} activeOpacity={1}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Trilhas</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.8}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon
                name="close"
                size={20}
                color={ColorUtils.getThemeColor(
                  Colors.textPrimary,
                  Colors.textPrimaryDark,
                  isDarkMode
                )}
              />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            {renderTabButton('mine', 'Minhas', trails.length)}
            {renderTabButton('public', 'Públicas', publicTrails.length)}

            {activeTab === 'public' && (
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={onRefreshPublicTrails}
                activeOpacity={0.8}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="refresh" size={18} color={Colors.blue500} />
              </TouchableOpacity>
            )}
          </View>

          {/* Lista de trilhas */}
          {currentTrails.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon
                name={activeTab === 'mine' ? 'hiking' : 'earth'}
                size={64}
                color={ColorUtils.getThemeColor(
                  Colors.gray400,
                  Colors.gray600,
                  isDarkMode
                )}
              />
              <Text style={styles.emptyText}>
                {activeTab === 'mine'
                  ? 'Nenhuma trilha gravada ainda.\nComece a gravar uma trilha no mapa!'
                  : 'Nenhuma trilha pública encontrada\nnesta região.'}
              </Text>
              {activeTab === 'mine' && !isAuthenticated && (
                <Text style={styles.emptySubtext}>
                  💡 Faça login para sincronizar suas trilhas na nuvem
                </Text>
              )}
              {activeTab === 'mine' && isAuthenticated && (
                <Text style={styles.emptySubtext}>
                  🎯 Toque e segure no mapa para adicionar POIs durante a
                  gravação
                </Text>
              )}
            </View>
          ) : (
            <>
              {activeTab === 'public' && renderPublicTrailsHeader()}
              <FlatList
                data={currentTrails}
                renderItem={renderItem}
                keyExtractor={item => `${activeTab}-${item.id || item._id}`}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 12 }}
              />
            </>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default TrailsModal;
