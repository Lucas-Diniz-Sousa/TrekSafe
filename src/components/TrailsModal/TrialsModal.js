// src/components/TrailsModal/TrailsModal.js
import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  Share,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, ColorUtils } from '../../theme/theme';
import { createStyles } from './TrailsModal.styles';

const TrailsModal = ({
  visible,
  isDarkMode,
  trails,
  onClose,
  onUpdateTrail,
  onDeleteTrail,
  onToggleTrailVisibility,
}) => {
  const [editingTrail, setEditingTrail] = useState(null);
  const [editName, setEditName] = useState('');
  const styles = createStyles(isDarkMode);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleEditTrail = (trail) => {
    setEditingTrail(trail.id);
    setEditName(trail.name || `Trilha ${formatDate(trail.date)}`);
  };

  const handleSaveEdit = (trailId) => {
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

  const handleDeleteTrail = (trail) => {
    Alert.alert(
      'Excluir Trilha',
      `Tem certeza que deseja excluir a trilha "${trail.name || formatDate(trail.date)}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: () => onDeleteTrail(trail.id)
        },
      ]
    );
  };

  const handleShareTrail = async (trail) => {
    try {
      const trailInfo = `🥾 Trilha: ${trail.name || formatDate(trail.date)}
📅 Data: ${formatDate(trail.date)}
📏 Distância: ${trail.distance.toFixed(2)}km
📍 Pontos: ${trail.points.length}

Gravado com TrekSafe 🌲`;

      await Share.share({
        message: trailInfo,
        title: 'Compartilhar Trilha',
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível compartilhar a trilha.');
    }
  };

  const renderTrailItem = ({ item: trail }) => {
    const isEditing = editingTrail === trail.id;
    const trailName = trail.name || `Trilha ${formatDate(trail.date)}`;

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
                placeholderTextColor={ColorUtils.getThemeColor(Colors.inputPlaceholder, Colors.gray400, isDarkMode)}
                autoFocus
              />
            ) : (
              <Text style={styles.trailName}>
                {trailName}
              </Text>
            )}
            <Text style={styles.trailDate}>
              {formatDate(trail.date)}
            </Text>
          </View>
          
          <View style={styles.visibilityContainer}>
            <Text style={styles.visibilityLabel}>
              {trail.visible ? 'Visível' : 'Oculta'}
            </Text>
            <Switch
              value={trail.visible !== false}
              onValueChange={(value) => onToggleTrailVisibility(trail.id, value)}
              trackColor={{ 
                false: ColorUtils.getThemeColor(Colors.gray300, Colors.gray600, isDarkMode),
                true: Colors.successGreen
              }}
              thumbColor={trail.visible !== false ? Colors.white : Colors.gray400}
              ios_backgroundColor={ColorUtils.getThemeColor(Colors.gray300, Colors.gray600, isDarkMode)}
            />
          </View>
        </View>

        <View style={styles.trailStats}>
          <View style={styles.statItem}>
            <Icon name="map-marker-distance" size={16} color={Colors.infoBlue} />
            <Text style={styles.statText}>
              {trail.distance.toFixed(2)}km
            </Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="map-marker-multiple" size={16} color={Colors.purple500} />
            <Text style={styles.statText}>
              {trail.points.length} pontos
            </Text>
          </View>
          {trail.visible && (
            <View style={styles.statItem}>
              <Icon name="eye" size={16} color={Colors.successGreen} />
              <Text style={styles.statText}>
                No mapa
              </Text>
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
        <TouchableOpacity 
          style={styles.modalContent}
          activeOpacity={1}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Minhas Trilhas ({trails.length})
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.8}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon 
                name="close" 
                size={20} 
                color={ColorUtils.getThemeColor(Colors.textPrimary, Colors.textPrimaryDark, isDarkMode)} 
              />
            </TouchableOpacity>
          </View>

          {trails.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon 
                name="hiking" 
                size={64} 
                color={ColorUtils.getThemeColor(Colors.gray400, Colors.gray600, isDarkMode)} 
              />
              <Text style={styles.emptyText}>
                Nenhuma trilha gravada ainda.{'\n'}
                Comece a gravar uma trilha no mapa!
              </Text>
            </View>
          ) : (
            <FlatList
              data={trails}
              renderItem={renderTrailItem}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 12 }}
            />
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default TrailsModal;