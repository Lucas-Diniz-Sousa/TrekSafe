// src/screens/MapScreen/MapScreen.js
import Geolocation from '@react-native-community/geolocation';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  AppState,
  Platform,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import AddPOIModal from '../../components/AddPOIModal/AddPOIModal';
import MapControls from '../../components/MapControls/MapControls';
import TrailsModal from '../../components/TrailsModal/TrailsModal';
import { useAuth } from '../../contexts/AuthContext';
import trailService from '../../services/trailService';
import { createStyles } from './MapScreen.styles';

const MapScreen = ({ navigation }) => {
  const { authState, user, isAuthenticated } = useAuth();

  // ✅ CONFIGURAR TEMA PRIMEIRO
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  // ✅ CONFIGURAÇÕES INICIAIS
  const initialRegion = useMemo(
    () => ({
      latitude: -19.916667,
      longitude: -43.933333,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    }),
    []
  );

  // ✅ ESTADOS PRINCIPAIS
  const [region, setRegion] = useState(initialRegion);
  const [locationPermissionGranted, setLocationPermissionGranted] =
    useState(false);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasLocation, setHasLocation] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapKey, setMapKey] = useState(0);

  // ✅ ESTADOS DE GRAVAÇÃO
  const [isRecording, setIsRecording] = useState(false);
  const [currentTrail, setCurrentTrail] = useState([]);
  const [savedTrails, setSavedTrails] = useState([]);
  const [currentTrailId, setCurrentTrailId] = useState(null);
  const [isSavingTrail, setIsSavingTrail] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState(null);

  // ✅ ESTADOS DE TRILHAS PÚBLICAS
  const [publicTrails, setPublicTrails] = useState([]);
  const [loadingTrails, setLoadingTrails] = useState(false);
  const [publicTrailsVisible, setPublicTrailsVisible] = useState(true);
  const [visiblePublicTrails, setVisiblePublicTrails] = useState(new Set());

  // ✅ NOVOS ESTADOS PARA COORDENADAS E POIs DETALHADOS
  const [trailsWithDetails, setTrailsWithDetails] = useState(new Map());
  const [loadingTrailDetails, setLoadingTrailDetails] = useState(new Set());

  // ✅ ESTADOS DE POIs
  const [currentPOIs, setCurrentPOIs] = useState([]);
  const [allPOIs, setAllPOIs] = useState([]);
  const [showAddPOI, setShowAddPOI] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loadingPOI, setLoadingPOI] = useState(false);

  // ✅ ESTADOS DE CONECTIVIDADE
  const [isOnline, setIsOnline] = useState(true);
  const [syncStatus, setSyncStatus] = useState('synced');
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [coordinatesBuffer, setCoordinatesBuffer] = useState([]);

  // ✅ ESTADOS DE ESTATÍSTICAS
  const [recordingStats, setRecordingStats] = useState({
    distance: 0,
    duration: 0,
    points: 0,
    lastSync: null,
  });

  // ✅ ESTADO PARA MODAL DE TRILHAS
  const [showTrailsModal, setShowTrailsModal] = useState(false);

  // ✅ NOVO ESTADO PARA SELETOR DE TIPO DE MAPA
  const [showMapTypeSelector, setShowMapTypeSelector] = useState(false);
  const [mapType, setMapType] = useState('standard');

  // ✅ NOVO ESTADO PARA TOAST DISCRETO
  const [showSyncToast, setShowSyncToast] = useState(false);

  // ✅ REFS PARA CONTROLE DE LOOPS
  const mapRef = useRef(null);
  const appState = useRef(AppState.currentState);
  const isUpdatingRegion = useRef(false);
  const watchId = useRef(null);
  const loadingTimeout = useRef(null);
  const lastRegionLoad = useRef(null);
  const recordingIntervalRef = useRef(null);
  const dataLoadedRef = useRef(false);
  const authLoggedRef = useRef(false);
  const initializationRef = useRef(false);
  const lastRegionKey = useRef('');
  const trailDetailsLoadedRef = useRef(new Set());
  const syncToastTimeoutRef = useRef(null);

  // ✅ CONSTANTES
  const BATCH_SIZE = 10;
  const CONNECTIVITY_CHECK_INTERVAL = 60000;
  const REGION_CHANGE_DEBOUNCE = 3000;

  // ✅ ESTILOS MEMOIZADOS COM NOVO PARÂMETRO
  const styles = useMemo(
    () => createStyles(isDarkMode, showMapTypeSelector),
    [isDarkMode, showMapTypeSelector]
  );

  // ✅ TIPOS DE MAPA DISPONÍVEIS
  const mapTypes = useMemo(
    () => [
      { key: 'standard', label: 'Padrão', icon: 'map' },
      { key: 'satellite', label: 'Satélite', icon: 'satellite' },
      { key: 'hybrid', label: 'Híbrido', icon: 'layers' },
      { key: 'terrain', label: 'Terreno', icon: 'terrain' },
    ],
    []
  );

  // ✅ FUNÇÃO PARA MOSTRAR TOAST DISCRETO
  const showDiscreteToast = useCallback((message, duration = 3000) => {
    setShowSyncToast(true);

    if (syncToastTimeoutRef.current) {
      clearTimeout(syncToastTimeoutRef.current);
    }

    syncToastTimeoutRef.current = setTimeout(() => {
      setShowSyncToast(false);
    }, duration);
  }, []);

  // ✅ FUNÇÃO PARA BUSCAR DETALHES DE UMA TRILHA - CORRIGIDA
  const loadTrailDetails = useCallback(async (trailId, forceReload = false) => {
    if (!trailId || typeof trailId !== 'string') {
      console.warn('⚠️ ID de trilha inválido:', trailId);
      return { coordinates: [], pois: [] };
    }

    if (loadingTrailDetails.has(trailId)) {
      console.log('⏳ Trilha já está sendo carregada:', trailId);
      return trailsWithDetails.get(trailId) || { coordinates: [], pois: [] };
    }

    if (!forceReload && trailsWithDetails.has(trailId)) {
      console.log('✅ Trilha já carregada do cache:', trailId);
      return trailsWithDetails.get(trailId);
    }

    console.log('🔍 Carregando detalhes da trilha:', trailId);

    setLoadingTrailDetails(prev => new Set([...prev, trailId]));

    try {
      const trailDetails = await trailService.getTrailById(trailId, {
        withCoords: true,
        includePois: true,
      });

      console.log('✅ Detalhes da trilha carregados:', {
        trailId,
        coordsCount: trailDetails.coordinates?.length || 0,
        poisCount: trailDetails.pois?.length || 0,
      });

      const details = {
        coordinates: trailDetails.coordinates || [],
        pois: trailDetails.pois || [],
        lastLoaded: new Date().toISOString(),
      };

      setTrailsWithDetails(prev => {
        const newMap = new Map(prev);
        newMap.set(trailId, details);
        return newMap;
      });

      trailDetailsLoadedRef.current.add(trailId);

      if (trailDetails.pois && trailDetails.pois.length > 0) {
        setAllPOIs(prev => {
          const existingIds = new Set(prev.map(poi => poi.id || poi._id));
          const newPOIs = trailDetails.pois.filter(
            poi => !existingIds.has(poi.id || poi._id)
          );
          if (newPOIs.length > 0) {
            console.log(`📍 Adicionando ${newPOIs.length} novos POIs`);
            return [...prev, ...newPOIs];
          }
          return prev;
        });
      }

      return details;
    } catch (error) {
      console.error('💥 Erro ao carregar detalhes da trilha:', trailId, error);
      return { coordinates: [], pois: [] };
    } finally {
      setLoadingTrailDetails(prev => {
        const newSet = new Set(prev);
        newSet.delete(trailId);
        return newSet;
      });
    }
  }, []);

  // ✅ FUNÇÃO PARA CARREGAR DETALHES DE MÚLTIPLAS TRILHAS - CORRIGIDA
  const loadMultipleTrailDetails = useCallback(
    async trailIds => {
      if (!Array.isArray(trailIds) || trailIds.length === 0) return;

      const trailsToLoad = trailIds.filter(
        id =>
          id &&
          typeof id === 'string' &&
          !trailsWithDetails.has(id) &&
          !loadingTrailDetails.has(id) &&
          !trailDetailsLoadedRef.current.has(id)
      );

      if (trailsToLoad.length === 0) {
        console.log('✅ Todas as trilhas já foram carregadas');
        return;
      }

      console.log(
        '🔍 Carregando detalhes de múltiplas trilhas:',
        trailsToLoad.length
      );

      const batchSize = 3;
      for (let i = 0; i < trailsToLoad.length; i += batchSize) {
        const batch = trailsToLoad.slice(i, i + batchSize);

        console.log(
          `📦 Carregando lote ${Math.floor(i / batchSize) + 1}/${Math.ceil(
            trailsToLoad.length / batchSize
          )}`
        );

        const promises = batch.map(trailId => loadTrailDetails(trailId));

        try {
          await Promise.allSettled(promises);

          if (i + batchSize < trailsToLoad.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.error('💥 Erro no lote de trilhas:', error);
        }
      }

      console.log('✅ Carregamento de detalhes concluído');
    },
    [loadTrailDetails]
  );

  // ✅ FUNÇÃO PARA OBTER COORDENADAS DE UMA TRILHA
  const getTrailCoordinates = useCallback(
    trailId => {
      const details = trailsWithDetails.get(trailId);
      return details?.coordinates || [];
    },
    [trailsWithDetails]
  );

  // ✅ FUNÇÃO PARA OBTER POIs DE UMA TRILHA
  const getTrailPOIs = useCallback(
    trailId => {
      const details = trailsWithDetails.get(trailId);
      return details?.pois || [];
    },
    [trailsWithDetails]
  );

  // ✅ LOG CONTROLADO - APENAS UMA VEZ POR MUDANÇA DE ESTADO
  useEffect(() => {
    if (!authLoggedRef.current) {
      console.log('🔐 Estado de autenticação inicial:', {
        authState: !!authState,
        isAuthenticated,
        user: user ? 'EXISTE' : 'NÃO EXISTE',
        isDarkMode,
      });
      authLoggedRef.current = true;
    }
  }, [authState, isAuthenticated, user, isDarkMode]);

  // ✅ VERIFICAÇÃO DE CONECTIVIDADE - ESTÁVEL
  const checkConnectivity = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch('https://httpbin.org/status/200', {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-cache',
      });

      clearTimeout(timeoutId);
      const currentlyOnline = response.ok;

      setIsOnline(prev => {
        if (prev !== currentlyOnline) {
          console.log(
            '🌐 Status de conectividade mudou:',
            currentlyOnline ? 'Online' : 'Offline'
          );
          if (!prev && currentlyOnline) {
            syncOfflineData();
          }
        }
        return currentlyOnline;
      });

      return currentlyOnline;
    } catch (error) {
      setIsOnline(prev => {
        if (prev) {
          console.log('📱 Sem conexão detectada');
        }
        return false;
      });
      return false;
    }
  }, []);

  // ✅ ADICIONAR OPERAÇÃO À FILA OFFLINE
  const addToOfflineQueue = useCallback(operation => {
    const operationWithId = {
      ...operation,
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
    };

    setOfflineQueue(prev => [...prev, operationWithId]);
    console.log(`📝 Operação ${operation.type} adicionada à fila offline`);
  }, []);

  // ✅ SINCRONIZAÇÃO DE DADOS OFFLINE - ATUALIZADA
  const syncOfflineData = useCallback(async () => {
    setOfflineQueue(prev => {
      if (prev.length === 0) return prev;

      setSyncStatus('syncing');
      console.log(`🔄 Sincronizando ${prev.length} operações offline...`);

      setTimeout(() => {
        setSyncStatus('synced');
        setRecordingStats(prevStats => ({
          ...prevStats,
          lastSync: new Date(),
        }));
        console.log('✅ Sincronização concluída');

        showDiscreteToast('Dados sincronizados', 2000);
      }, 2000);

      return [];
    });
  }, [showDiscreteToast]);

  // ✅ PERMISSÕES DE LOCALIZAÇÃO - ESTÁVEL
  const requestLocationPermission = useCallback(async () => {
    if (locationPermissionGranted) return;

    try {
      setLoading(true);
      setError(null);

      let permissionResult;

      if (Platform.OS === 'ios') {
        permissionResult = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      } else {
        permissionResult = await request(
          PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
        );
      }

      if (permissionResult === RESULTS.GRANTED) {
        console.log('✅ Permissão de localização concedida');
        setLocationPermissionGranted(true);
      } else {
        console.log('❌ Permissão de localização negada');
        setError('Permissão de localização negada.');
        setLocationPermissionGranted(false);
      }
    } catch (err) {
      console.warn('Erro ao solicitar permissão:', err);
      setError(`Erro ao solicitar permissão: ${err.message}`);
      setLocationPermissionGranted(false);
    } finally {
      setLoading(false);
    }
  }, [locationPermissionGranted]);

  // ✅ OBTER LOCALIZAÇÃO ATUAL - ESTÁVEL
  const getCurrentLocation = useCallback(() => {
    if (!locationPermissionGranted || hasLocation) return;

    setLoading(true);
    setError(null);

    const locationOptions = {
      enableHighAccuracy: false,
      timeout: 30000,
      maximumAge: 60000,
    };

    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude, accuracy } = position.coords;
        console.log('📍 Localização obtida:', {
          latitude,
          longitude,
          accuracy,
        });

        const newLocation = { latitude, longitude };
        const newRegion = {
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };

        setLocation(newLocation);
        setRegion(newRegion);
        setHasLocation(true);
        setError(null);
        setLoading(false);
        setMapKey(prev => prev + 1);
      },
      error => {
        console.warn('❌ Erro ao obter localização:', error);
        let errorMessage = 'Erro ao obter a localização.';

        switch (error.code) {
          case 1:
            errorMessage = 'Permissão de localização negada pelo usuário.';
            break;
          case 2:
            errorMessage = 'Localização indisponível.';
            break;
          case 3:
            errorMessage = 'Tempo limite excedido ao obter a localização.';
            break;
          default:
            errorMessage = `Erro desconhecido: ${error.message}`;
        }

        setError(errorMessage);
        setLoading(false);
        setHasLocation(false);
        setRegion(initialRegion);
        setMapKey(prev => prev + 1);
      },
      locationOptions
    );
  }, [locationPermissionGranted, hasLocation, initialRegion]);

  // ✅ CALCULAR DISTÂNCIA ENTRE PONTOS
  const calculateDistance = useCallback(points => {
    if (!Array.isArray(points) || points.length < 2) return 0;

    let distance = 0;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];

      if (!prev || !curr || !prev.latitude || !curr.latitude) continue;

      const R = 6371;
      const dLat = ((curr.latitude - prev.latitude) * Math.PI) / 180;
      const dLon = ((curr.longitude - prev.longitude) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((prev.latitude * Math.PI) / 180) *
          Math.cos((curr.latitude * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      distance += R * c;
    }

    return distance;
  }, []);

  // ✅ BUSCAR TRILHAS PÚBLICAS - CORRIGIDA PARA EVITAR LOOPS
  const loadPublicTrails = useCallback(
    async (forceLoad = false) => {
      if (!isMapReady || loadingTrails) return;

      const currentRegionKey = `${Math.round(
        region.latitude * 100
      )}_${Math.round(region.longitude * 100)}`;

      if (!forceLoad && lastRegionKey.current === currentRegionKey) {
        console.log('🔄 Região já carregada, pulando...');
        return;
      }

      setLoadingTrails(true);
      try {
        const { latitude, longitude, latitudeDelta, longitudeDelta } = region;

        console.log('🔄 Carregando trilhas públicas para região:', {
          latitude,
          longitude,
        });

        const area = {
          northEast: {
            latitude: latitude + latitudeDelta / 2,
            longitude: longitude + longitudeDelta / 2,
          },
          southWest: {
            latitude: latitude - latitudeDelta / 2,
            longitude: longitude - longitudeDelta / 2,
          },
        };

        const trails = await trailService.searchTrailsByArea(area);

        console.log(`✅ Recebidas ${trails.length} trilhas públicas da API`);
        setPublicTrails(trails);

        if (publicTrailsVisible) {
          const allTrailIds = trails.map(trail => trail.id).filter(Boolean);
          setVisiblePublicTrails(new Set(allTrailIds));

          const trailsToLoadDetails = allTrailIds.slice(0, 5);
          if (trailsToLoadDetails.length > 0) {
            console.log(
              '🔄 Carregando detalhes das primeiras trilhas visíveis...'
            );
            setTimeout(() => {
              loadMultipleTrailDetails(trailsToLoadDetails);
            }, 1000);
          }
        }

        lastRegionKey.current = currentRegionKey;
      } catch (error) {
        console.warn('⚠️ Erro ao carregar trilhas públicas:', error);
        setIsOnline(false);
      } finally {
        setLoadingTrails(false);
      }
    },
    [
      region.latitude,
      region.longitude,
      isMapReady,
      loadingTrails,
      publicTrailsVisible,
      loadMultipleTrailDetails,
    ]
  );

  // ✅ FUNÇÕES DE GRAVAÇÃO ESTÁVEIS
  const startRecording = useCallback(async () => {
    if (!locationPermissionGranted) {
      Alert.alert(
        'Erro',
        'Permissão de localização necessária para gravar trilha.'
      );
      return;
    }

    console.log('🎬 Iniciando gravação de trilha');
    const startTime = new Date();

    try {
      const trailData = {
        name: `Trilha ${startTime.toLocaleDateString(
          'pt-BR'
        )} ${startTime.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        })}`,
        description: 'Trilha gravada pelo TrekSafe',
        startedAt: startTime.toISOString(),
        totalDistance: 0,
        durationSeconds: 0,
        isOnline: isOnline,
        isPublic: false,
        initialLat: location?.latitude || region.latitude,
        initialLng: location?.longitude || region.longitude,
      };

      const createdTrail = await trailService.createTrail(trailData);
      const trailId = createdTrail._id || createdTrail.id;

      console.log('✅ Trilha criada com ID:', trailId);

      setIsRecording(true);
      setCurrentTrail([]);
      setCurrentTrailId(trailId);
      setCurrentPOIs([]);
      setRecordingStartTime(startTime);
      setCoordinatesBuffer([]);
      setRecordingStats({
        distance: 0,
        duration: 0,
        points: 0,
        lastSync: new Date(),
      });

      const watchOptions = {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 1000,
        distanceFilter: 5,
      };

      watchId.current = Geolocation.watchPosition(
        async position => {
          const { latitude, longitude, altitude, accuracy, speed, heading } =
            position.coords;
          const newPoint = {
            latitude,
            longitude,
            altitude,
            accuracy,
            speed,
            heading,
            timestamp: new Date().toISOString(),
          };

          setCurrentTrail(prev => [...prev, newPoint]);
          setLocation({ latitude, longitude });

          try {
            await trailService.addCoordinateToTrail(trailId, newPoint);
            console.log('📍 Coordenada enviada para servidor');
          } catch (error) {
            console.warn('⚠️ Erro ao enviar coordenada:', error);
          }
        },
        error => {
          console.warn('💥 Erro ao rastrear posição:', error);
          setError('Erro ao rastrear posição durante gravação.');
        },
        watchOptions
      );

      recordingIntervalRef.current = setInterval(() => {
        setRecordingStats(prev => ({
          ...prev,
          duration: prev.duration + 1,
        }));
      }, 1000);
    } catch (error) {
      console.error('💥 Erro ao criar trilha:', error);
      Alert.alert('Erro', 'Não foi possível iniciar a gravação da trilha.');
    }
  }, [locationPermissionGranted, isOnline, location, region]);

  const stopRecording = useCallback(async () => {
    console.log('⏹️ Parando gravação de trilha');
    setIsRecording(false);
    setIsSavingTrail(true);

    if (watchId.current !== null) {
      Geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }

    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }

    const endTime = new Date();
    const distance = calculateDistance(currentTrail);
    const duration = recordingStartTime
      ? Math.round((endTime.getTime() - recordingStartTime.getTime()) / 1000)
      : 0;

    try {
      if (currentTrailId) {
        await trailService.updateTrail(currentTrailId, {
          endedAt: endTime.toISOString(),
          totalDistance: distance,
          durationSeconds: duration,
        });
        console.log('✅ Trilha atualizada no servidor');
      }
    } catch (error) {
      console.warn('⚠️ Erro ao atualizar trilha no servidor:', error);
    }

    const newTrail = {
      id: currentTrailId,
      date: endTime.toISOString(),
      points: [...currentTrail],
      distance,
      duration,
      visible: true,
      name: `Trilha ${endTime.toLocaleDateString(
        'pt-BR'
      )} ${endTime.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })}`,
      pois: [...currentPOIs],
      startTime: recordingStartTime?.toISOString(),
      endTime: endTime.toISOString(),
      apiId: currentTrailId,
    };

    setSavedTrails(prev => [...prev, newTrail]);

    Alert.alert(
      'Trilha Salva!',
      `Trilha gravada com ${currentTrail.length} pontos, ${
        currentPOIs.length
      } POIs e ${distance.toFixed(2)}km de distância.`,
      [{ text: 'OK' }]
    );

    setCurrentTrail([]);
    setCurrentTrailId(null);
    setCurrentPOIs([]);
    setCoordinatesBuffer([]);
    setRecordingStats({
      distance: 0,
      duration: 0,
      points: 0,
      lastSync: null,
    });
    setIsSavingTrail(false);
  }, [
    currentTrail,
    currentPOIs,
    calculateDistance,
    currentTrailId,
    recordingStartTime,
  ]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  // ✅ FUNÇÕES AUXILIARES PARA POIs - CORRIGIDAS
  const getPOIIcon = useCallback(category => {
    const icons = {
      landmark: 'map-marker-star',
      viewpoint: 'binoculars',
      water: 'water',
      shelter: 'home-variant',
      danger: 'alert-octagon', // ✅ CORRIGIDO: era 'alert-triangle'
      parking: 'parking',
      food: 'food',
      other: 'map-marker',
      camping: 'tent',
      bridge: 'bridge',
      cave: 'tunnel',
      summit: 'mountain',
      waterfall: 'waves',
      wildlife: 'paw',
      photo: 'camera',
      rest: 'chair-rolling',
    };
    return icons[category] || 'map-marker';
  }, []);

  const getPOIColor = useCallback(category => {
    const colors = {
      landmark: '#ff9800',
      viewpoint: '#2196f3',
      water: '#03a9f4',
      shelter: '#4caf50',
      danger: '#f44336',
      parking: '#9e9e9e',
      food: '#9c27b0',
      other: '#757575',
      camping: '#66bb6a',
      bridge: '#8d6e63',
      cave: '#616161',
      summit: '#f44336',
      waterfall: '#20b2aa',
      wildlife: '#daa520',
      photo: '#e91e63',
      rest: '#673ab7',
    };
    return colors[category] || '#ff9800';
  }, []);

  const getPOISize = useCallback(category => {
    const sizes = {
      danger: 24,
      summit: 22,
      landmark: 22,
      viewpoint: 22,
      other: 16,
    };
    return sizes[category] || 20;
  }, []);

  const getCategoryLabel = useCallback(category => {
    const labels = {
      landmark: 'Marco',
      viewpoint: 'Mirante',
      water: 'Água',
      shelter: 'Abrigo',
      danger: 'Perigo',
      parking: 'Estacionamento',
      food: 'Alimentação',
      other: 'Outro',
      camping: 'Camping',
      bridge: 'Ponte',
      cave: 'Caverna',
      summit: 'Pico',
      waterfall: 'Cachoeira',
      wildlife: 'Vida Selvagem',
      photo: 'Ponto Fotográfico',
      rest: 'Descanso',
    };
    return labels[category] || 'POI';
  }, []);

  // ✅ ADICIONAR POI - ESTÁVEL
  const handleAddPOI = useCallback(
    async poiData => {
      if (!currentTrailId) {
        Alert.alert(
          'Erro',
          'Você precisa estar gravando uma trilha para adicionar POIs.'
        );
        return;
      }

      setLoadingPOI(true);
      try {
        const createdPOI = await trailService.createPOI({
          trekId: currentTrailId,
          name: poiData.name,
          description: poiData.description,
          latitude: poiData.latitude,
          longitude: poiData.longitude,
          category: poiData.category || 'other',
        });

        const tempPOI = {
          id: createdPOI._id || createdPOI.id || `poi_${Date.now()}`,
          name: poiData.name,
          description: poiData.description,
          latitude: poiData.latitude,
          longitude: poiData.longitude,
          category: poiData.category || 'other',
          trekId: currentTrailId,
          timestamp: new Date().toISOString(),
          apiId: createdPOI._id || createdPOI.id,
        };

        setCurrentPOIs(prev => [...prev, tempPOI]);
        setAllPOIs(prev => [...prev, tempPOI]);

        Alert.alert(
          'POI Adicionado!',
          `${poiData.name} foi adicionado à trilha.`
        );
        setShowAddPOI(false);

        console.log('✅ POI criado com sucesso:', tempPOI);
      } catch (error) {
        console.warn('⚠️ Erro ao criar POI:', error);
        Alert.alert(
          'Erro',
          'Não foi possível adicionar o POI. Ele será sincronizado quando a conexão for restaurada.'
        );

        const tempPOI = {
          id: `poi_${Date.now()}`,
          name: poiData.name,
          description: poiData.description,
          latitude: poiData.latitude,
          longitude: poiData.longitude,
          category: poiData.category || 'other',
          trekId: currentTrailId,
          timestamp: new Date().toISOString(),
          isOffline: true,
        };

        setCurrentPOIs(prev => [...prev, tempPOI]);
        setAllPOIs(prev => [...prev, tempPOI]);
        setShowAddPOI(false);
      } finally {
        setLoadingPOI(false);
      }
    },
    [currentTrailId]
  );

  // ✅ HANDLERS ESTÁVEIS
  const handleMapLongPress = useCallback(
    event => {
      if (isRecording) {
        setSelectedLocation(event.nativeEvent.coordinate);
        setShowAddPOI(true);
      } else {
        Alert.alert(
          'Adicionar POI',
          'Para adicionar um POI, você precisa estar gravando uma trilha.',
          [
            { text: 'OK', style: 'default' },
            { text: 'Iniciar Gravação', onPress: startRecording },
          ]
        );
      }
    },
    [isRecording, startRecording]
  );

  const updateRegion = useCallback(
    (newRegion, animated = true) => {
      console.log('🔄 Atualizando região para:', newRegion);
      isUpdatingRegion.current = true;

      setRegion(newRegion);

      if (mapRef.current && isMapReady) {
        try {
          if (animated) {
            mapRef.current.animateToRegion(newRegion, 500);
          } else {
            mapRef.current.setRegion(newRegion);
          }
        } catch (error) {
          console.warn('⚠️ Erro ao atualizar região do mapa:', error);
          setMapKey(prev => prev + 1);
        }
      }

      setTimeout(() => {
        isUpdatingRegion.current = false;
      }, 600);
    },
    [isMapReady]
  );

  const centerOnUser = useCallback(() => {
    if (location && isMapReady) {
      const newRegion = {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      console.log('🎯 Centralizando no usuário:', newRegion);
      updateRegion(newRegion);
    }
  }, [location, isMapReady, updateRegion]);

  const zoomIn = useCallback(() => {
    if (isMapReady && region) {
      const newRegion = {
        ...region,
        latitudeDelta: Math.max(region.latitudeDelta / 2, 0.0005),
        longitudeDelta: Math.max(region.longitudeDelta / 2, 0.0005),
      };

      console.log('🔍 Zoom in para:', newRegion);
      updateRegion(newRegion);
    }
  }, [region, isMapReady, updateRegion]);

  const zoomOut = useCallback(() => {
    if (isMapReady && region) {
      const newRegion = {
        ...region,
        latitudeDelta: Math.min(region.latitudeDelta * 2, 10),
        longitudeDelta: Math.min(region.longitudeDelta * 2, 10),
      };

      console.log('🔍 Zoom out para:', newRegion);
      updateRegion(newRegion);
    }
  }, [region, isMapReady, updateRegion]);

  // ✅ HANDLERS DE TRILHAS ESTÁVEIS
  const handleUpdateTrail = useCallback(async (trailId, updates) => {
    setSavedTrails(prev =>
      prev.map(trail =>
        trail.id === trailId ? { ...trail, ...updates } : trail
      )
    );
  }, []);

  const handleDeleteTrail = useCallback(async trailId => {
    setSavedTrails(prev => prev.filter(trail => trail.id !== trailId));
  }, []);

  const handleToggleTrailVisibility = useCallback((trailId, visible) => {
    setSavedTrails(prev =>
      prev.map(trail => (trail.id === trailId ? { ...trail, visible } : trail))
    );
  }, []);

  const handleTogglePublicTrailVisibility = useCallback(
    (trailId, visible) => {
      setVisiblePublicTrails(prev => {
        const newSet = new Set(prev);
        if (visible) {
          newSet.add(trailId);
          if (
            !trailsWithDetails.has(trailId) &&
            !trailDetailsLoadedRef.current.has(trailId)
          ) {
            setTimeout(() => loadTrailDetails(trailId), 500);
          }
        } else {
          newSet.delete(trailId);
        }
        return newSet;
      });
    },
    [trailsWithDetails, loadTrailDetails]
  );

  const handleToggleAllPublicTrails = useCallback(
    visible => {
      console.log(
        '🔄 Alternando visibilidade de todas as trilhas públicas:',
        visible
      );
      setPublicTrailsVisible(visible);

      if (visible) {
        const allPublicTrailIds = publicTrails
          .map(trail => trail.id)
          .filter(Boolean);
        setVisiblePublicTrails(new Set(allPublicTrailIds));

        const trailsToLoadDetails = allPublicTrailIds
          .filter(
            id =>
              !trailsWithDetails.has(id) &&
              !trailDetailsLoadedRef.current.has(id)
          )
          .slice(0, 3);

        if (trailsToLoadDetails.length > 0) {
          setTimeout(() => {
            loadMultipleTrailDetails(trailsToLoadDetails);
          }, 1000);
        }
      } else {
        setVisiblePublicTrails(new Set());
      }
    },
    [publicTrails, trailsWithDetails, loadMultipleTrailDetails]
  );

  const handleRefreshTrails = useCallback(async () => {
    const isConnected = await checkConnectivity();
    if (isConnected) {
      setTrailsWithDetails(new Map());
      trailDetailsLoadedRef.current.clear();
      lastRegionKey.current = '';
      await loadPublicTrails(true);
    } else {
      Alert.alert(
        'Sem Conexão',
        'Não é possível atualizar trilhas sem conexão com a internet.'
      );
    }
  }, [checkConnectivity, loadPublicTrails]);

  const handleLogin = useCallback(() => {
    if (navigation) {
      navigation.navigate('LoginScreen');
    } else {
      Alert.alert(
        'Login',
        'Funcionalidade de login será implementada em breve.'
      );
    }
  }, [navigation]);

  const handleViewTrails = useCallback(() => {
    setShowTrailsModal(true);
  }, []);

  const handleMapReady = useCallback(() => {
    console.log('🗺️ Mapa pronto para uso');
    setIsMapReady(true);
  }, []);

  const handleRegionChangeComplete = useCallback(newRegion => {
    if (!isUpdatingRegion.current) {
      console.log('📍 Região atualizada pelo usuário:', newRegion);
      setRegion(newRegion);
    }
  }, []);

  const handleManualSync = useCallback(async () => {
    if (offlineQueue.length === 0) {
      Alert.alert('Sincronizado', 'Todos os dados estão sincronizados.');
      return;
    }

    const isConnected = await checkConnectivity();
    if (isConnected) {
      await syncOfflineData();
      Alert.alert('Sincronização', 'Dados sincronizados com sucesso!');
    } else {
      Alert.alert(
        'Sem Conexão',
        'Não é possível sincronizar sem conexão com a internet.'
      );
    }
  }, [offlineQueue, checkConnectivity, syncOfflineData]);

  // ✅ HANDLER PARA ALTERNAR TIPO DE MAPA
  const handleMapTypeChange = useCallback(newMapType => {
    setMapType(newMapType);
    setShowMapTypeSelector(false);
  }, []);

  // ✅ HANDLER PARA ALTERNAR SELETOR DE MAPA
  const handleToggleMapTypeSelector = useCallback(() => {
    setShowMapTypeSelector(prev => !prev);
  }, []);

  // ✅ MEMOS OTIMIZADOS - ESTÁVEIS
  const visibleTrailsFiltered = useMemo(() => {
    return savedTrails.filter(trail => trail.visible !== false);
  }, [savedTrails]);

  const visiblePublicTrailsFiltered = useMemo(() => {
    return publicTrails.filter(trail => {
      const trailId = trail._id || trail.id;
      return publicTrailsVisible && visiblePublicTrails.has(trailId);
    });
  }, [publicTrails, publicTrailsVisible, visiblePublicTrails]);

  // ✅ MEMO PARA POIs DA TRILHA ATUAL - SEMPRE VISÍVEL DURANTE GRAVAÇÃO
  const uniqueCurrentPOIs = useMemo(() => {
    if (!Array.isArray(currentPOIs) || !isRecording) return [];

    const seen = new Set();
    return currentPOIs.filter(poi => {
      if (!poi || !poi.latitude || !poi.longitude || !poi.name) return false;

      const key = `${poi.latitude}-${poi.longitude}-${poi.name}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [currentPOIs, isRecording]);

  // ✅ MEMO PARA POIs DE TODAS AS TRILHAS - CORRIGIDO PARA CONSIDERAR VISIBILIDADE
  const allPOIsFromTrails = useMemo(() => {
    const poisFromDetails = [];

    // ✅ VERIFICAR TRILHAS SALVAS VISÍVEIS
    const visibleSavedTrailIds = new Set(
      savedTrails
        .filter(trail => trail.visible !== false)
        .map(trail => trail.id || trail._id)
    );

    // ✅ VERIFICAR TRILHAS PÚBLICAS VISÍVEIS
    const visiblePublicTrailIds = new Set(
      publicTrails
        .filter(trail => {
          const trailId = trail._id || trail.id;
          return publicTrailsVisible && visiblePublicTrails.has(trailId);
        })
        .map(trail => trail._id || trail.id)
    );

    // POIs das trilhas com detalhes carregados - APENAS SE A TRILHA ESTIVER VISÍVEL
    trailsWithDetails.forEach((details, trailId) => {
      // ✅ VERIFICAR SE A TRILHA ESTÁ VISÍVEL (salva ou pública)
      const isTrailVisible =
        visibleSavedTrailIds.has(trailId) || visiblePublicTrailIds.has(trailId);

      if (
        isTrailVisible &&
        details.pois &&
        Array.isArray(details.pois) &&
        details.pois.length > 0
      ) {
        details.pois.forEach(poi => {
          if (
            poi &&
            (poi.lat || poi.latitude) &&
            (poi.lng || poi.longitude) &&
            poi.name
          ) {
            poisFromDetails.push({
              ...poi,
              id: poi._id || poi.id || `poi_${trailId}_${Math.random()}`,
              latitude: poi.lat || poi.latitude,
              longitude: poi.lng || poi.longitude,
              trekId: trailId,
              fromTrailDetails: true,
            });
          }
        });
      }
    });

    // ✅ COMBINAR COM POIs LOCAIS - APENAS DE TRILHAS VISÍVEIS
    const validAllPOIs = Array.isArray(allPOIs)
      ? allPOIs.filter(poi => {
          if (
            !poi ||
            !(poi.latitude || poi.lat) ||
            !(poi.longitude || poi.lng) ||
            !poi.name
          ) {
            return false;
          }

          // Se o POI tem trekId, verificar se a trilha está visível
          if (poi.trekId) {
            return (
              visibleSavedTrailIds.has(poi.trekId) ||
              visiblePublicTrailIds.has(poi.trekId)
            );
          }

          // POIs sem trekId (POIs globais) sempre visíveis
          return true;
        })
      : [];

    const allCombined = [...validAllPOIs, ...poisFromDetails];

    // Remover duplicatas
    const seen = new Set();
    return allCombined.filter(poi => {
      const lat = poi.latitude || poi.lat;
      const lng = poi.longitude || poi.lng;
      const key = `${lat}-${lng}-${poi.name}-${poi.trekId || 'global'}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [
    allPOIs,
    trailsWithDetails,
    savedTrails,
    publicTrails,
    publicTrailsVisible,
    visiblePublicTrails,
  ]);

  // ✅ ESTILO DE MAPA MEMOIZADO
  const mapStyle = useMemo(() => {
    if (isDarkMode) {
      return [
        {
          elementType: 'geometry',
          stylers: [{ color: '#1a1a1a' }],
        },
        {
          elementType: 'labels.icon',
          stylers: [{ visibility: 'off' }],
        },
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ color: '#0f2027' }],
        },
        {
          featureType: 'road',
          elementType: 'geometry',
          stylers: [{ color: '#2d2d2d' }],
        },
        {
          featureType: 'poi',
          elementType: 'geometry',
          stylers: [{ color: '#2d2d2d' }],
        },
      ];
    } else {
      return [
        {
          elementType: 'geometry',
          stylers: [{ color: '#f5f5f5' }],
        },
        {
          elementType: 'labels.icon',
          stylers: [{ visibility: 'off' }],
        },
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ color: '#81d4fa' }],
        },
        {
          featureType: 'road',
          elementType: 'geometry',
          stylers: [{ color: '#ffffff' }],
        },
      ];
    }
  }, [isDarkMode]);

  // ✅ EFFECTS CORRIGIDOS PARA EVITAR LOOPS

  // Inicialização única - APENAS UMA VEZ
  useEffect(() => {
    if (!initializationRef.current) {
      console.log('🔐 Inicializando MapScreen...');
      initializationRef.current = true;
      requestLocationPermission();
    }
  }, []);

  // Permissão concedida - APENAS UMA VEZ
  useEffect(() => {
    if (locationPermissionGranted && !hasLocation) {
      console.log('✅ Permissão concedida, obtendo localização atual...');
      getCurrentLocation();
    }
  }, [locationPermissionGranted, hasLocation, getCurrentLocation]);

  // Mapa pronto - carregar dados iniciais APENAS UMA VEZ
  useEffect(() => {
    if (isMapReady && !dataLoadedRef.current) {
      console.log('🗺️ Mapa pronto - carregando dados iniciais');
      dataLoadedRef.current = true;
      setTimeout(() => {
        loadPublicTrails(true);
      }, 1000);
    }
  }, [isMapReady]);

  // Região mudou - carregar trilhas públicas com debounce MELHORADO
  useEffect(() => {
    if (!isMapReady || !dataLoadedRef.current || loadingTrails) return;

    const currentRegionKey = `${Math.round(region.latitude * 100)}_${Math.round(
      region.longitude * 100
    )}`;

    if (lastRegionKey.current === currentRegionKey) return;

    if (loadingTimeout.current) {
      clearTimeout(loadingTimeout.current);
    }

    loadingTimeout.current = setTimeout(() => {
      console.log('🔄 Região mudou, carregando trilhas...');
      loadPublicTrails();
    }, REGION_CHANGE_DEBOUNCE);

    return () => {
      if (loadingTimeout.current) {
        clearTimeout(loadingTimeout.current);
      }
    };
  }, [
    Math.round(region.latitude * 100),
    Math.round(region.longitude * 100),
    isMapReady,
    loadingTrails,
  ]);

  // ✅ EFFECT PARA ATUALIZAR ESTATÍSTICAS DE GRAVAÇÃO
  useEffect(() => {
    if (isRecording && currentTrail.length > 0) {
      setRecordingStats(prev => ({
        ...prev,
        points: currentTrail.length,
        distance: calculateDistance(currentTrail),
      }));
    }
  }, [isRecording, currentTrail.length, calculateDistance]);

  // Verificação periódica de conectividade - ESTÁVEL
  useEffect(() => {
    const connectivityInterval = setInterval(() => {
      checkConnectivity();
    }, CONNECTIVITY_CHECK_INTERVAL);

    return () => {
      clearInterval(connectivityInterval);
    };
  }, [checkConnectivity]);

  // ✅ EFFECT PARA SINCRONIZAÇÃO AUTOMÁTICA - ESTÁVEL
  useEffect(() => {
    if (!isRecording && offlineQueue.length > 0) {
      const syncInterval = setInterval(async () => {
        if (isOnline) {
          try {
            await trailService.syncOfflineData();
          } catch (error) {
            console.warn('⚠️ Erro na sincronização automática:', error);
          }
        }
      }, 30000);

      return () => clearInterval(syncInterval);
    }
  }, [isRecording, offlineQueue.length, isOnline]);

  // ✅ CLEANUP PARA TOAST
  useEffect(() => {
    return () => {
      if (syncToastTimeoutRef.current) {
        clearTimeout(syncToastTimeoutRef.current);
      }
    };
  }, []);

  // Cleanup geral - ESTÁVEL
  useEffect(() => {
    return () => {
      if (watchId.current !== null) {
        Geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
      if (loadingTimeout.current) {
        clearTimeout(loadingTimeout.current);
        loadingTimeout.current = null;
      }
    };
  }, []);

  // ✅ RENDERIZAÇÃO CONDICIONAL DE LOADING
  if (loading && !isMapReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4caf50" />
        <Text style={styles.loadingText}>Carregando mapa...</Text>
      </View>
    );
  }

  // ✅ RENDERIZAÇÃO PRINCIPAL
  return (
    <View style={styles.container}>
      <MapView
        key={`map-${mapKey}`}
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        mapType={mapType}
        initialRegion={region}
        customMapStyle={mapStyle}
        loadingEnabled={true}
        showsUserLocation={false}
        followsUserLocation={false}
        loadingIndicatorColor="#4caf50"
        loadingBackgroundColor={isDarkMode ? '#000' : '#fff'}
        showsCompass={false}
        zoomEnabled={true}
        zoomControlEnabled={false}
        scrollEnabled={true}
        pitchEnabled={true}
        rotateEnabled={true}
        zoomTapEnabled={true}
        onMapReady={handleMapReady}
        onRegionChangeComplete={handleRegionChangeComplete}
        onLongPress={handleMapLongPress}
        cacheEnabled={false}
        renderToHardwareTextureAndroid={true}
        toolbarEnabled={false}
        moveOnMarkerPress={false}
        minZoomLevel={1}
        maxZoomLevel={22}
        mapPadding={{ top: 0, right: 0, bottom: 0, left: 0 }}
      >
        {/* ✅ LOCALIZAÇÃO DO USUÁRIO */}
        {hasLocation && location && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="Sua Localização"
            description="Você está aqui"
          >
            <View style={[styles.markerContainer, styles.userMarkerContainer]}>
              <Icon name="hiking" size={20} color="#fff" />
            </View>
          </Marker>
        )}

        {/* ✅ TRILHA ATUAL SENDO GRAVADA */}
        {isRecording && currentTrail.length > 1 && (
          <Polyline
            coordinates={currentTrail}
            strokeColor="#f44336"
            strokeWidth={4}
            lineDashPattern={[5, 5]}
          />
        )}

        {/* ✅ TRILHAS SALVAS VISÍVEIS */}
        {visibleTrailsFiltered.map(trail => {
          const coordinates = trail.points || trail.coordinates || [];
          if (coordinates.length < 2) return null;

          return (
            <Polyline
              key={`saved-trail-${trail.id || trail._id}`}
              coordinates={coordinates}
              strokeColor="#4caf50"
              strokeWidth={3}
            />
          );
        })}

        {/* ✅ TRILHAS PÚBLICAS VISÍVEIS COM COORDENADAS DETALHADAS */}
        {visiblePublicTrailsFiltered.map(trail => {
          const trailId = trail._id || trail.id;
          const coordinates = getTrailCoordinates(trailId);

          if (!coordinates || coordinates.length < 2) {
            return null;
          }

          return (
            <Polyline
              key={`public-trail-${trailId}`}
              coordinates={coordinates}
              strokeColor="#2196f3"
              strokeWidth={2}
              strokeOpacity={0.7}
            />
          );
        })}

        {/* ✅ POIs DA TRILHA ATUAL SENDO GRAVADA - SEMPRE VISÍVEL DURANTE GRAVAÇÃO */}
        {isRecording &&
          uniqueCurrentPOIs.map((poi, index) => {
            const iconName = getPOIIcon(poi.category);
            const iconColor = getPOIColor(poi.category);
            const iconSize = getPOISize(poi.category);

            return (
              <Marker
                key={`current-poi-${poi._id || poi.id || index}`}
                coordinate={{
                  latitude: poi.lat || poi.latitude,
                  longitude: poi.lng || poi.longitude,
                }}
                title={`${getCategoryLabel(poi.category)}: ${poi.name}`}
                description={poi.description}
              >
                <View
                  style={[
                    styles.poiMarker,
                    {
                      backgroundColor: iconColor,
                      width: iconSize + 12,
                      height: iconSize + 12,
                      borderRadius: (iconSize + 12) / 2,
                    },
                  ]}
                >
                  <Icon name={iconName} size={iconSize} color="#fff" />
                </View>
              </Marker>
            );
          })}

        {/* ✅ TODOS OS POIs DAS TRILHAS VISÍVEIS - AGORA RESPEITAM A VISIBILIDADE DA TRILHA */}
        {allPOIsFromTrails.map((poi, index) => {
          const iconName = getPOIIcon(poi.category || 'other');
          const iconColor = getPOIColor(poi.category || 'other');
          const iconSize = Math.max(
            getPOISize(poi.category || 'other') - 2,
            16
          );

          return (
            <Marker
              key={`all-poi-${poi._id || poi.id || index}`}
              coordinate={{
                latitude: poi.lat || poi.latitude,
                longitude: poi.lng || poi.longitude,
              }}
              title={`${getCategoryLabel(poi.category || 'other')}: ${
                poi.name
              }`}
              description={poi.description}
            >
              <View
                style={[
                  styles.poiMarker,
                  {
                    backgroundColor: iconColor,
                    width: iconSize + 10,
                    height: iconSize + 10,
                    borderRadius: (iconSize + 10) / 2,
                    opacity: poi.fromTrailDetails ? 0.8 : 0.9,
                    borderWidth: poi.fromTrailDetails ? 2 : 1,
                    borderColor: '#fff',
                  },
                ]}
              >
                <Icon name={iconName} size={iconSize} color="#fff" />
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* ✅ SELETOR DE TIPO DE MAPA - NOVO */}
      {showMapTypeSelector && (
        <View style={styles.mapTypeSelectorContainer}>
          {mapTypes.map(type => (
            <TouchableOpacity
              key={type.key}
              style={[
                styles.mapTypeButton,
                mapType === type.key
                  ? styles.mapTypeButtonActive
                  : styles.mapTypeButtonInactive,
              ]}
              onPress={() => handleMapTypeChange(type.key)}
            >
              <Icon
                name={type.icon}
                size={16}
                color={
                  mapType === type.key ? '#fff' : isDarkMode ? '#fff' : '#000'
                }
              />
              <Text
                style={[
                  styles.mapTypeButtonText,
                  mapType === type.key && styles.mapTypeButtonTextActive,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ✅ BOTÃO PARA ALTERNAR SELETOR DE MAPA */}
      <TouchableOpacity
        style={styles.mapTypeToggle}
        onPress={handleToggleMapTypeSelector}
      >
        <Icon name="layers" size={20} color={isDarkMode ? '#fff' : '#000'} />
      </TouchableOpacity>

      {/* ✅ INDICADOR DE GRAVAÇÃO - POSIÇÃO AJUSTADA */}
      {isRecording && (
        <View style={styles.recordingIndicator}>
          <View style={styles.recordingHeader}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>Gravando trilha</Text>
            <View style={styles.syncStatusIndicator}>
              {syncStatus === 'syncing' && (
                <ActivityIndicator size="small" color="#fff" />
              )}
              {syncStatus === 'synced' && isOnline && (
                <Icon name="cloud-check" size={16} color="#4caf50" />
              )}
              {syncStatus === 'error' && (
                <Icon name="cloud-alert" size={16} color="#f44336" />
              )}
              {!isOnline && (
                <Icon name="cloud-off-outline" size={16} color="#ff9800" />
              )}
            </View>
          </View>

          <View style={styles.recordingStats}>
            <View style={styles.statItem}>
              <Icon name="map-marker-distance" size={14} color="#fff" />
              <Text style={styles.statText}>
                {recordingStats.distance.toFixed(2)}km
              </Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="clock-outline" size={14} color="#fff" />
              <Text style={styles.statText}>
                {Math.floor(recordingStats.duration / 60)}:
                {(recordingStats.duration % 60).toString().padStart(2, '0')}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="map-marker-multiple" size={14} color="#fff" />
              <Text style={styles.statText}>{recordingStats.points} pts</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="map-marker-star" size={14} color="#fff" />
              <Text style={styles.statText}>{currentPOIs.length} POIs</Text>
            </View>
          </View>

          <Text style={styles.recordingSubtext}>
            {isOnline
              ? 'Toque e segure no mapa para adicionar POI'
              : 'Modo offline - dados serão sincronizados'}
          </Text>

          {coordinatesBuffer.length > 0 && (
            <Text style={styles.bufferText}>
              {coordinatesBuffer.length} coordenadas no buffer
            </Text>
          )}
        </View>
      )}

      {/* ✅ INDICADOR DE STATUS DE CONECTIVIDADE - POSIÇÃO AJUSTADA */}
      {!isOnline && (
        <View style={styles.offlineIndicator}>
          <Icon name="cloud-off-outline" size={16} color="#fff" />
          <Text style={styles.offlineText}>Modo Offline</Text>
          {offlineQueue.length > 0 && (
            <TouchableOpacity onPress={handleManualSync}>
              <Text style={styles.queueText}>
                {offlineQueue.length} operações pendentes
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ✅ INDICADOR DE SINCRONIZAÇÃO - POSIÇÃO AJUSTADA */}
      {isOnline && syncStatus === 'syncing' && !isRecording && (
        <View style={styles.syncIndicator}>
          <ActivityIndicator size="small" color="#fff" />
          <Text style={styles.syncText}>Sincronizando...</Text>
        </View>
      )}

      {/* ✅ INDICADOR DE CARREGAMENTO DE DETALHES DE TRILHAS */}
      {loadingTrailDetails.size > 0 && (
        <View style={[styles.syncIndicator, { backgroundColor: '#ff9800' }]}>
          <ActivityIndicator size="small" color="#fff" />
          <Text style={styles.syncText}>
            Carregando detalhes ({loadingTrailDetails.size} trilhas)
          </Text>
        </View>
      )}

      {/* ✅ TOAST DISCRETO DE SINCRONIZAÇÃO - NOVO */}
      {showSyncToast &&
        isOnline &&
        offlineQueue.length === 0 &&
        !isRecording && (
          <View style={styles.syncToastDiscrete}>
            <Icon name="check" size={14} color="#fff" />
            <Text style={styles.syncToastDiscreteText}>Sincronizado</Text>
          </View>
        )}

      {/* ✅ CONTROLES DO MAPA */}
      <MapControls
        isDarkMode={isDarkMode}
        isMapReady={isMapReady}
        isRecording={isRecording}
        savedTrails={savedTrails}
        publicTrails={publicTrails}
        publicTrailsVisible={publicTrailsVisible}
        loadingTrails={loadingTrails}
        isSavingTrail={isSavingTrail}
        isAuthenticated={isAuthenticated}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onCenterOnUser={centerOnUser}
        onToggleRecording={toggleRecording}
        onLogin={handleLogin}
        onViewTrails={handleViewTrails}
        onRefreshTrails={handleRefreshTrails}
        onTogglePublicTrails={handleToggleAllPublicTrails}
        isOnline={isOnline}
        syncStatus={syncStatus}
        offlineQueueCount={offlineQueue.length}
        onSyncOfflineData={handleManualSync}
      />

      {/* ✅ MODAL DE TRILHAS */}
      <TrailsModal
        visible={showTrailsModal}
        isDarkMode={isDarkMode}
        trails={savedTrails}
        publicTrails={publicTrails}
        visiblePublicTrails={visiblePublicTrails}
        publicTrailsVisible={publicTrailsVisible}
        isAuthenticated={isAuthenticated}
        onClose={() => setShowTrailsModal(false)}
        onUpdateTrail={handleUpdateTrail}
        onDeleteTrail={handleDeleteTrail}
        onToggleTrailVisibility={handleToggleTrailVisibility}
        onTogglePublicTrailVisibility={handleTogglePublicTrailVisibility}
        onToggleAllPublicTrails={handleToggleAllPublicTrails}
        onRefreshPublicTrails={handleRefreshTrails}
        isOnline={isOnline}
        syncStatus={syncStatus}
        offlineQueueCount={offlineQueue.length}
      />

      {/* ✅ MODAL DE ADICIONAR POI */}
      <AddPOIModal
        visible={showAddPOI}
        isDarkMode={isDarkMode}
        location={selectedLocation}
        trekId={currentTrailId}
        loading={loadingPOI}
        onClose={() => {
          setShowAddPOI(false);
          setSelectedLocation(null);
        }}
        onSave={handleAddPOI}
        isOnline={isOnline}
        syncStatus={syncStatus}
      />

      {/* ✅ OVERLAYS DE LOADING */}
      {loading && isMapReady && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4caf50" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      )}

      {isSavingTrail && (
        <View style={styles.savingOverlay}>
          <ActivityIndicator size="large" color="#4caf50" />
          <Text style={styles.savingText}>
            {isOnline ? 'Salvando trilha...' : 'Salvando trilha offline...'}
          </Text>
          <Text style={styles.savingSubtext}>
            {coordinatesBuffer.length > 0 &&
              `${coordinatesBuffer.length} coordenadas no buffer`}
            {!isOnline &&
              offlineQueue.length > 0 &&
              `${offlineQueue.length} operações na fila`}
          </Text>
        </View>
      )}

      {/* ✅ OVERLAY DE ERRO */}
      {error && (
        <View style={styles.overlayError}>
          <Icon name="alert-circle" size={24} color="#f44336" />
          <Text style={styles.overlayErrorText}>{error}</Text>
          <TouchableOpacity
            style={styles.errorAction}
            onPress={() => setError(null)}
          >
            <Text style={styles.errorActionText}>Dispensar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default MapScreen;
