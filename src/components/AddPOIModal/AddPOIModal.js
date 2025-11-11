// src/components/AddPOIModal/AddPOIModal.js
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, ColorUtils } from '../../theme/theme';
import { createStyles } from './AddPOIModal.styles';

const AddPOIModal = ({
  visible,
  isDarkMode,
  location,
  trekId,
  onClose,
  onSave,
  loading = false,
}) => {
  // ✅ ESTADOS
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('landmark');
  const [errors, setErrors] = useState({});

  // ✅ ESTILOS
  const styles = createStyles(isDarkMode);

  // ✅ CORES DINÂMICAS BASEADAS NO TEMA
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

  // ✅ RESETAR ESTADOS AO ABRIR/FECHAR MODAL
  useEffect(() => {
    if (visible) {
      setName('');
      setDescription('');
      setCategory('landmark');
      setErrors({});
    }
  }, [visible]);

  // ✅ DEBUG: Log para verificar valores - MELHORADO
  useEffect(() => {
    console.log('🔍 AddPOIModal Debug:', {
      visible,
      name: `"${name}"`,
      nameLength: name.length,
      nameTrimmed: `"${name.trim()}"`,
      nameTrimmedLength: name.trim().length,
      description: `"${description}"`,
      descriptionLength: description.length,
      location: location
        ? {
            lat: location.latitude,
            lng: location.longitude,
            alt: location.altitude,
          }
        : 'NULL',
      trekId: trekId || 'NULL',
      loading,
      category,
    });
  }, [visible, name, description, location, trekId, loading, category]);

  // ✅ CATEGORIAS DISPONÍVEIS
  const categories = [
    {
      key: 'landmark',
      label: 'Marco',
      icon: 'map-marker-star',
      color: Colors.orange500,
    },
    {
      key: 'viewpoint',
      label: 'Mirante',
      icon: 'binoculars',
      color: Colors.infoBlue,
    },
    {
      key: 'water',
      label: 'Água',
      icon: 'water',
      color: Colors.blue400,
    },
    {
      key: 'shelter',
      label: 'Abrigo',
      icon: 'home-variant',
      color: Colors.successGreen,
    },
    {
      key: 'danger',
      label: 'Perigo',
      icon: 'alert-triangle',
      color: Colors.errorRed,
    },
    {
      key: 'parking',
      label: 'Estacionamento',
      icon: 'parking',
      color: Colors.gray500,
    },
    {
      key: 'food',
      label: 'Alimentação',
      icon: 'food',
      color: Colors.purple500,
    },
    {
      key: 'camping',
      label: 'Camping',
      icon: 'tent',
      color: Colors.green600,
    },
    {
      key: 'bridge',
      label: 'Ponte',
      icon: 'bridge',
      color: Colors.marromRustico,
    },
    {
      key: 'cave',
      label: 'Caverna',
      icon: 'tunnel',
      color: Colors.gray700,
    },
    {
      key: 'summit',
      label: 'Pico',
      icon: 'mountain',
      color: Colors.red500,
    },
    {
      key: 'waterfall',
      label: 'Cachoeira',
      icon: 'waves',
      color: Colors.azulCascata,
    },
    {
      key: 'wildlife',
      label: 'Vida Selvagem',
      icon: 'paw',
      color: Colors.douradoNobre,
    },
    {
      key: 'photo',
      label: 'Foto',
      icon: 'camera',
      color: Colors.pink500,
    },
    {
      key: 'rest',
      label: 'Descanso',
      icon: 'chair-rolling',
      color: Colors.purple700,
    },
    {
      key: 'other',
      label: 'Outro',
      icon: 'map-marker',
      color: Colors.gray600,
    },
  ];

  // ✅ VALIDAÇÃO MELHORADA
  const validateForm = () => {
    const newErrors = {};

    // Validação do nome
    if (!name || !name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    } else if (name.trim().length > 50) {
      newErrors.name = 'Nome deve ter no máximo 50 caracteres';
    }

    // Validação da descrição (opcional, mas com limite)
    if (description && description.length > 200) {
      newErrors.description = 'Descrição deve ter no máximo 200 caracteres';
    }

    // ✅ VALIDAÇÃO DA LOCALIZAÇÃO MELHORADA
    if (!location) {
      newErrors.location = 'Localização não fornecida';
    } else if (
      typeof location.latitude !== 'number' ||
      typeof location.longitude !== 'number' ||
      isNaN(location.latitude) ||
      isNaN(location.longitude)
    ) {
      newErrors.location = 'Coordenadas de localização inválidas';
    } else if (
      location.latitude < -90 ||
      location.latitude > 90 ||
      location.longitude < -180 ||
      location.longitude > 180
    ) {
      newErrors.location = 'Coordenadas fora do intervalo válido';
    }

    // ✅ VALIDAÇÃO DO TREKID MELHORADA
    if (!trekId || trekId === null || trekId === undefined) {
      newErrors.trek = 'ID da trilha é obrigatório para adicionar POI';
    } else if (typeof trekId !== 'string' || trekId.trim().length === 0) {
      newErrors.trek = 'ID da trilha inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ LÓGICA DE HABILITAÇÃO DO BOTÃO CORRIGIDA
  const isFormValid = () => {
    // Validação do nome
    const hasValidName =
      name &&
      name.trim() &&
      name.trim().length >= 2 &&
      name.trim().length <= 50;

    // Validação da descrição
    const hasValidDescription = !description || description.length <= 200;

    // ✅ VALIDAÇÃO DA LOCALIZAÇÃO CORRIGIDA
    const hasValidLocation =
      location &&
      typeof location.latitude === 'number' &&
      typeof location.longitude === 'number' &&
      !isNaN(location.latitude) &&
      !isNaN(location.longitude) &&
      location.latitude >= -90 &&
      location.latitude <= 90 &&
      location.longitude >= -180 &&
      location.longitude <= 180;

    // ✅ VALIDAÇÃO DO TREKID CORRIGIDA
    const hasValidTrekId =
      trekId &&
      trekId !== null &&
      trekId !== undefined &&
      typeof trekId === 'string' &&
      trekId.trim().length > 0;

    const notLoading = !loading;

    const result =
      hasValidName &&
      hasValidDescription &&
      hasValidLocation &&
      hasValidTrekId &&
      notLoading;

    console.log('🔍 Validação do botão CORRIGIDA:', {
      hasValidName,
      hasValidDescription,
      hasValidLocation,
      hasValidTrekId,
      notLoading,
      result,
      locationData: location,
      trekIdData: trekId,
    });

    return result;
  };

  const canSave = isFormValid();

  // ✅ FUNÇÃO PARA SALVAR POI MELHORADA
  const handleSave = () => {
    console.log('🎯 Tentando salvar POI...');

    if (!validateForm()) {
      console.log('❌ Validação falhou:', errors);
      Alert.alert('Erro', 'Por favor, corrija os erros no formulário.');
      return;
    }

    // ✅ DADOS CORRETOS CONFORME SUA API
    const poiData = {
      trekId: trekId.trim(),
      name: name.trim(),
      description: description.trim() || '', // Garantir string vazia se não houver descrição
      lat: Number(location.latitude),
      lng: Number(location.longitude),
      alt: location.altitude ? Number(location.altitude) : undefined,
      category: category,
    };

    console.log('📍 Dados do POI para envio (CORRIGIDOS):', poiData);
    onSave(poiData);
  };

  // ✅ FUNÇÃO PARA FECHAR MODAL
  const handleClose = () => {
    setName('');
    setDescription('');
    setCategory('landmark');
    setErrors({});
    onClose();
  };

  // ✅ HANDLERS DE INPUT
  const handleNameChange = text => {
    setName(text);
    if (errors.name) {
      setErrors(prev => ({ ...prev, name: null }));
    }
  };

  const handleDescriptionChange = text => {
    setDescription(text);
    if (errors.description) {
      setErrors(prev => ({ ...prev, description: null }));
    }
  };

  // ✅ FUNÇÃO PARA OBTER ESTILO DO CONTADOR DE CARACTERES
  const getCharCountStyle = (current, max) => {
    const percentage = (current / max) * 100;
    if (percentage >= 100) return styles.charCountAtLimit;
    if (percentage >= 80) return styles.charCountNearLimit;
    return styles.charCount;
  };

  // ✅ RENDERIZAÇÃO COM VALIDAÇÕES MELHORADAS
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* ✅ CABEÇALHO */}
          <View style={styles.header}>
            <Text style={styles.title}>Adicionar POI</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={themedColors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* ✅ LOCALIZAÇÃO COM VALIDAÇÃO VISUAL */}
            <View style={styles.locationInfo}>
              <Icon
                name="map-marker"
                size={20}
                color={location ? Colors.infoBlue : Colors.errorRed}
              />
              <Text style={styles.locationText}>
                {location &&
                typeof location.latitude === 'number' &&
                typeof location.longitude === 'number'
                  ? `${location.latitude.toFixed(
                      6
                    )}, ${location.longitude.toFixed(6)}`
                  : 'Localização inválida'}
              </Text>
            </View>

            {/* ✅ DEBUG INFO MELHORADO */}
            <View style={styles.debugInfo}>
              <Text style={styles.debugText}>
                DEBUG: Nome="{name}" | TrekId={trekId || 'NULL'} | CanSave=
                {canSave ? 'SIM' : 'NÃO'}
              </Text>
              {errors.trek && (
                <Text style={styles.debugError}> ({errors.trek})</Text>
              )}
              {errors.location && (
                <Text style={styles.debugError}> ({errors.location})</Text>
              )}
            </View>

            {/* ✅ NOME */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Nome <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                value={name}
                onChangeText={handleNameChange}
                placeholder="Ex: Cachoeira do Vale"
                placeholderTextColor={themedColors.textMuted}
                maxLength={50}
                autoFocus={true}
              />
              {errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}
              <Text
                style={[styles.charCount, getCharCountStyle(name.length, 50)]}
              >
                {name.length}/50
              </Text>
            </View>

            {/* ✅ CATEGORIA */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Categoria</Text>
              <View style={styles.categoriesGrid}>
                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat.key}
                    style={[
                      styles.categoryButton,
                      category === cat.key && {
                        backgroundColor: cat.color,
                        borderColor: cat.color,
                      },
                    ]}
                    onPress={() => setCategory(cat.key)}
                    activeOpacity={0.7}
                  >
                    <Icon
                      name={cat.icon}
                      size={18}
                      color={category === cat.key ? Colors.white : cat.color}
                    />
                    <Text
                      style={[
                        styles.categoryText,
                        category === cat.key && styles.categoryTextSelected,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* ✅ DESCRIÇÃO */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Descrição</Text>
              <TextInput
                style={[
                  styles.textArea,
                  errors.description && styles.textAreaError,
                ]}
                value={description}
                onChangeText={handleDescriptionChange}
                placeholder="Descreva este ponto de interesse..."
                placeholderTextColor={themedColors.textMuted}
                multiline
                numberOfLines={4}
                maxLength={200}
                textAlignVertical="top"
              />
              {errors.description && (
                <Text style={styles.errorText}>{errors.description}</Text>
              )}
              <Text
                style={[
                  styles.charCount,
                  getCharCountStyle(description.length, 200),
                ]}
              >
                {description.length}/200
              </Text>
            </View>

            {/* ✅ ERROS DE VALIDAÇÃO GERAL */}
            {(errors.location || errors.trek) && (
              <View style={styles.debugInfo}>
                {errors.location && (
                  <Text style={[styles.debugText, styles.debugError]}>
                    ❌ Localização: {errors.location}
                  </Text>
                )}
                {errors.trek && (
                  <Text style={[styles.debugText, styles.debugError]}>
                    ❌ Trilha: {errors.trek}
                  </Text>
                )}
              </View>
            )}
          </ScrollView>

          {/* ✅ FOOTER */}
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
                canSave ? styles.saveButtonEnabled : styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={!canSave}
              activeOpacity={0.8}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size={20} color={Colors.white} />
                  <Text style={styles.saveButtonText}>Salvando...</Text>
                </View>
              ) : (
                <>
                  <Icon
                    name={canSave ? 'check' : 'lock'}
                    size={18}
                    color={Colors.white}
                  />
                  <Text style={styles.saveButtonText}>
                    {canSave ? 'Salvar POI' : 'Dados inválidos'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddPOIModal;
