// src/components/AddPOIModal/AddPOIModal.js
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, ColorUtils } from '../../theme/theme';

const AddPOIModal = ({
  visible,
  isDarkMode,
  location,
  onClose,
  onSave,
  loading = false,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('landmark');

  const categories = [
    { key: 'landmark', label: 'Marco', icon: 'map-marker-star' },
    { key: 'viewpoint', label: 'Mirante', icon: 'binoculars' },
    { key: 'water', label: 'Água', icon: 'water' },
    { key: 'shelter', label: 'Abrigo', icon: 'home-variant' },
    { key: 'danger', label: 'Perigo', icon: 'alert-triangle' },
    { key: 'parking', label: 'Estacionamento', icon: 'parking' },
    { key: 'food', label: 'Alimentação', icon: 'food' },
    { key: 'camping', label: 'Camping', icon: 'tent' },
    { key: 'bridge', label: 'Ponte', icon: 'bridge' },
    { key: 'cave', label: 'Caverna', icon: 'tunnel' },
    { key: 'summit', label: 'Pico', icon: 'mountain' },
    { key: 'waterfall', label: 'Cachoeira', icon: 'waves' },
    { key: 'wildlife', label: 'Vida Selvagem', icon: 'paw' },
    { key: 'photo', label: 'Foto', icon: 'camera' },
    { key: 'rest', label: 'Descanso', icon: 'chair-rolling' },
    { key: 'other', label: 'Outro', icon: 'map-marker' },
  ];

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Digite um nome para o POI');
      return;
    }

    onSave({
      name: name.trim(),
      description: description.trim(),
      category,
      latitude: location.latitude,
      longitude: location.longitude,
    });

    // Limpar campos
    setName('');
    setDescription('');
    setCategory('landmark');
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setCategory('landmark');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            {
              backgroundColor: ColorUtils.getThemeColor(
                Colors.backgroundPrimary,
                Colors.backgroundPrimaryDark,
                isDarkMode
              ),
            },
          ]}
        >
          <View style={styles.header}>
            <Text
              style={[
                styles.title,
                {
                  color: ColorUtils.getThemeColor(
                    Colors.textPrimary,
                    Colors.textPrimaryDark,
                    isDarkMode
                  ),
                },
              ]}
            >
              Adicionar POI
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Icon
                name="close"
                size={24}
                color={ColorUtils.getThemeColor(
                  Colors.textPrimary,
                  Colors.textPrimaryDark,
                  isDarkMode
                )}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Localização */}
            <View style={styles.locationInfo}>
              <Icon name="map-marker" size={20} color={Colors.blue500} />
              <Text
                style={[
                  styles.locationText,
                  {
                    color: ColorUtils.getThemeColor(
                      Colors.textMuted,
                      Colors.textMutedDark,
                      isDarkMode
                    ),
                  },
                ]}
              >
                {location?.latitude?.toFixed(6)},{' '}
                {location?.longitude?.toFixed(6)}
              </Text>
            </View>

            {/* Nome */}
            <View style={styles.inputGroup}>
              <Text
                style={[
                  styles.label,
                  {
                    color: ColorUtils.getThemeColor(
                      Colors.textPrimary,
                      Colors.textPrimaryDark,
                      isDarkMode
                    ),
                  },
                ]}
              >
                Nome *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: ColorUtils.getThemeColor(
                      Colors.backgroundSecondary,
                      Colors.backgroundSecondaryDark,
                      isDarkMode
                    ),
                    borderColor: ColorUtils.getThemeColor(
                      Colors.gray300,
                      Colors.gray600,
                      isDarkMode
                    ),
                    color: ColorUtils.getThemeColor(
                      Colors.textPrimary,
                      Colors.textPrimaryDark,
                      isDarkMode
                    ),
                  },
                ]}
                value={name}
                onChangeText={setName}
                placeholder="Ex: Cachoeira do Vale"
                placeholderTextColor={ColorUtils.getThemeColor(
                  Colors.textMuted,
                  Colors.textMutedDark,
                  isDarkMode
                )}
                maxLength={50}
              />
            </View>

            {/* Categoria */}
            <View style={styles.inputGroup}>
              <Text
                style={[
                  styles.label,
                  {
                    color: ColorUtils.getThemeColor(
                      Colors.textPrimary,
                      Colors.textPrimaryDark,
                      isDarkMode
                    ),
                  },
                ]}
              >
                Categoria
              </Text>
              <View style={styles.categoriesGrid}>
                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat.key}
                    style={[
                      styles.categoryButton,
                      {
                        backgroundColor:
                          category === cat.key
                            ? Colors.blue500
                            : ColorUtils.getThemeColor(
                                Colors.backgroundSecondary,
                                Colors.backgroundSecondaryDark,
                                isDarkMode
                              ),
                        borderColor:
                          category === cat.key
                            ? Colors.blue500
                            : ColorUtils.getThemeColor(
                                Colors.gray300,
                                Colors.gray600,
                                isDarkMode
                              ),
                      },
                    ]}
                    onPress={() => setCategory(cat.key)}
                    activeOpacity={0.7}
                  >
                    <Icon
                      name={cat.icon}
                      size={20}
                      color={
                        category === cat.key ? Colors.white : Colors.blue500
                      }
                    />
                    <Text
                      style={[
                        styles.categoryText,
                        {
                          color:
                            category === cat.key
                              ? Colors.white
                              : ColorUtils.getThemeColor(
                                  Colors.textPrimary,
                                  Colors.textPrimaryDark,
                                  isDarkMode
                                ),
                        },
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Descrição */}
            <View style={styles.inputGroup}>
              <Text
                style={[
                  styles.label,
                  {
                    color: ColorUtils.getThemeColor(
                      Colors.textPrimary,
                      Colors.textPrimaryDark,
                      isDarkMode
                    ),
                  },
                ]}
              >
                Descrição
              </Text>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    backgroundColor: ColorUtils.getThemeColor(
                      Colors.backgroundSecondary,
                      Colors.backgroundSecondaryDark,
                      isDarkMode
                    ),
                    borderColor: ColorUtils.getThemeColor(
                      Colors.gray300,
                      Colors.gray600,
                      isDarkMode
                    ),
                    color: ColorUtils.getThemeColor(
                      Colors.textPrimary,
                      Colors.textPrimaryDark,
                      isDarkMode
                    ),
                  },
                ]}
                value={description}
                onChangeText={setDescription}
                placeholder="Descreva este ponto de interesse..."
                placeholderTextColor={ColorUtils.getThemeColor(
                  Colors.textMuted,
                  Colors.textMutedDark,
                  isDarkMode
                )}
                multiline
                numberOfLines={4}
                maxLength={200}
                textAlignVertical="top"
              />
              <Text
                style={[
                  styles.charCount,
                  {
                    color: ColorUtils.getThemeColor(
                      Colors.textMuted,
                      Colors.textMutedDark,
                      isDarkMode
                    ),
                  },
                ]}
              >
                {description.length}/200
              </Text>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.saveButton,
                {
                  opacity: !name.trim() || loading ? 0.6 : 1,
                },
              ]}
              onPress={handleSave}
              disabled={loading || !name.trim()}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size={20} color={Colors.white} />
              ) : (
                <Text style={styles.saveButtonText}>Salvar POI</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 12,
    backgroundColor: Colors.blue500 + '10',
    borderRadius: 8,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'monospace',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    marginTop: 4,
  },
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
  },
  categoryText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.gray300,
  },
  cancelButtonText: {
    color: Colors.gray700,
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: Colors.blue500,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default AddPOIModal;
