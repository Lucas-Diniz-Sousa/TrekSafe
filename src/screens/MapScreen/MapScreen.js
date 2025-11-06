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
  useColorScheme,
  View,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AddPOIModal from '../../components/AddPOIModal/AddPOIModal';
import MapControls from '../../components/MapControls/MapControls';
import TrailsModal from '../../components/TrailsModal/TrialsModal';
import { useAuth } from '../../contexts/AuthContext';
import ApiService from '../../services/api';
import { Colors, ColorUtils } from '../../theme/theme';
import { createStyles } from './MapScreen.styles';

const MapScreen = ({ navigation }) => {
  const { authState, user, isAuthenticated } = useAuth();

  const initialRegion = {
    latitude: -19.916667,
    longitude: -43.933333,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const [region, setRegion] = useState(initialRegion);
  const [locationPermissionGranted, setLocationPermissionGranted] =
    useState(false);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasLocation, setHasLocation] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapKey, setMapKey] = useState(0);

  // Estados para gravação de trilha
  const [isRecording, setIsRecording] = useState(false);
  const [currentTrail, setCurrentTrail] = useState([]);
  const [savedTrails, setSavedTrails] = useState([]);
  const [currentTrailId, setCurrentTrailId] = useState(null);
  const [isSavingTrail, setIsSavingTrail] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState(null);

  // Estados para trilhas da API
  const [publicTrails, setPublicTrails] = useState([]);
  const [loadingTrails, setLoadingTrails] = useState(false);
  const [publicTrailsVisible, setPublicTrailsVisible] = useState(true);
  const [visiblePublicTrails, setVisiblePublicTrails] = useState(new Set());

  // Estados para POIs
  const [pois, setPois] = useState([]);
  const [allPOIs, setAllPOIs] = useState([]);
  const [showAddPOI, setShowAddPOI] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loadingPOI, setLoadingPOI] = useState(false);

  // Estado para modal de trilhas
  const [showTrailsModal, setShowTrailsModal] = useState(false);

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const styles = createStyles(isDarkMode);

  const mapRef = useRef(null);
  const appState = useRef(AppState.currentState);
  const isUpdatingRegion = useRef(false);
  const watchId = useRef(null);

  console.log('🔐 Estado de autenticação:', {
    authState,
    isAuthenticated,
    user: user ? 'EXISTE' : 'NÃO EXISTE',
    userPreview: user ? { id: user.id, email: user.email } : null,
  });

  console.log('region atual:', region);
  console.log('Gravando trilha:', isRecording, 'Pontos:', currentTrail.length);
  console.log('POIs atuais:', pois.length, 'Todos POIs:', allPOIs.length);
  console.log(
    'Trilhas públicas:',
    publicTrails.length,
    'Visíveis:',
    visiblePublicTrails.size
  );

  // Estilo de mapa simplificado e visualmente agradável
  const mapStyle = useMemo(() => {
    if (isDarkMode) {
      return [
        {
          elementType: 'geometry',
          stylers: [{ color: Colors.mapDarkBase }],
        },
        {
          elementType: 'labels.icon',
          stylers: [{ visibility: 'off' }],
        },
        {
          elementType: 'labels.text.fill',
          stylers: [{ color: Colors.mapTextDark }],
        },
        {
          elementType: 'labels.text.stroke',
          stylers: [{ color: Colors.mapDarkBase }],
        },
        {
          featureType: 'administrative',
          elementType: 'geometry',
          stylers: [{ color: Colors.mapLandmarkDark }],
        },
        {
          featureType: 'administrative.country',
          elementType: 'labels.text.fill',
          stylers: [{ color: Colors.mapTextDark }],
        },
        {
          featureType: 'administrative.land_parcel',
          stylers: [{ visibility: 'off' }],
        },
        {
          featureType: 'administrative.locality',
          elementType: 'labels.text.fill',
          stylers: [{ color: Colors.mapTextDark }],
        },
        {
          featureType: 'poi',
          elementType: 'labels.text.fill',
          stylers: [{ color: Colors.mapTextDark }],
        },
        {
          featureType: 'poi.park',
          elementType: 'geometry',
          stylers: [{ color: Colors.verdeFlorestaProfundo }],
        },
        {
          featureType: 'poi.park',
          elementType: 'labels.text.fill',
          stylers: [{ color: Colors.verdeMusgo }],
        },
        {
          featureType: 'poi.park',
          elementType: 'labels.text.stroke',
          stylers: [{ color: Colors.mapDarkBase }],
        },
        {
          featureType: 'road',
          elementType: 'geometry.fill',
          stylers: [{ color: Colors.mapRoadDark }],
        },
        {
          featureType: 'road',
          elementType: 'labels.text.fill',
          stylers: [{ color: Colors.mapTextDark }],
        },
        {
          featureType: 'road.arterial',
          elementType: 'geometry',
          stylers: [{ color: Colors.mapRoadDark }],
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry',
          stylers: [{ color: Colors.mapRoadDark }],
        },
        {
          featureType: 'road.highway.controlled_access',
          elementType: 'geometry',
          stylers: [{ color: Colors.mapRoadDark }],
        },
        {
          featureType: 'road.local',
          elementType: 'labels.text.fill',
          stylers: [{ color: Colors.mapTextDark }],
        },
        {
          featureType: 'transit',
          elementType: 'labels.text.fill',
          stylers: [{ color: Colors.mapTextDark }],
        },
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ color: Colors.mapWaterDark }],
        },
        {
          featureType: 'water',
          elementType: 'labels.text.fill',
          stylers: [{ color: Colors.mapTextDark }],
        },
      ];
    } else {
      return [
        {
          elementType: 'geometry',
          stylers: [{ color: Colors.mapLightBase }],
        },
        {
          elementType: 'labels.icon',
          stylers: [{ visibility: 'off' }],
        },
        {
          elementType: 'labels.text.fill',
          stylers: [{ color: Colors.mapTextLight }],
        },
        {
          elementType: 'labels.text.stroke',
          stylers: [{ color: Colors.mapLightBase }],
        },
        {
          featureType: 'administrative',
          elementType: 'geometry',
          stylers: [{ color: Colors.mapLandmarkLight }],
        },
        {
          featureType: 'administrative.country',
          elementType: 'labels.text.fill',
          stylers: [{ color: Colors.mapTextLight }],
        },
        {
          featureType: 'administrative.land_parcel',
          stylers: [{ visibility: 'off' }],
        },
        {
          featureType: 'administrative.locality',
          elementType: 'labels.text.fill',
          stylers: [{ color: Colors.mapTextLight }],
        },
        {
          featureType: 'poi',
          elementType: 'labels.text.fill',
          stylers: [{ color: Colors.mapTextLight }],
        },
        {
          featureType: 'poi.park',
          elementType: 'geometry',
          stylers: [{ color: Colors.verdeMusgo }],
        },
        {
          featureType: 'poi.park',
          elementType: 'labels.text.fill',
          stylers: [{ color: Colors.verdeFlorestaProfundo }],
        },
        {
          featureType: 'poi.park',
          elementType: 'labels.text.stroke',
          stylers: [{ color: Colors.mapLightBase }],
        },
        {
          featureType: 'road',
          elementType: 'geometry.fill',
          stylers: [{ color: Colors.mapRoadLight }],
        },
        {
          featureType: 'road',
          elementType: 'labels.text.fill',
          stylers: [{ color: Colors.mapTextLight }],
        },
        {
          featureType: 'road.arterial',
          elementType: 'geometry',
          stylers: [{ color: Colors.mapRoadLight }],
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry',
          stylers: [{ color: Colors.mapRoadLight }],
        },
        {
          featureType: 'road.highway.controlled_access',
          elementType: 'geometry',
          stylers: [{ color: Colors.mapRoadLight }],
        },
        {
          featureType: 'road.local',
          elementType: 'labels.text.fill',
          stylers: [{ color: Colors.mapTextLight }],
        },
        {
          featureType: 'transit',
          elementType: 'labels.text.fill',
          stylers: [{ color: Colors.mapTextLight }],
        },
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ color: Colors.mapWaterLight }],
        },
        {
          featureType: 'water',
          elementType: 'labels.text.fill',
          stylers: [{ color: Colors.mapTextLight }],
        },
      ];
    }
  }, [isDarkMode]);

  const requestLocationPermission = useCallback(async () => {
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
        console.log('Permissão de localização concedida');
        setLocationPermissionGranted(true);
      } else {
        console.log('Permissão de localização negada');
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
  }, []);

  const getCurrentLocation = useCallback(() => {
    if (!locationPermissionGranted) {
      console.log('Permissão de localização não concedida.');
      setError('Permissão de localização não concedida.');
      return;
    }

    setLoading(true);
    setError(null);

    const locationOptions = {
      enableHighAccuracy: false,
      timeout: 30000,
      maximumAge: 60000,
    };

    Geolocation.getCurrentPosition(
      position => {
        console.log('position.coords', position.coords);
        const { latitude, longitude, accuracy } = position.coords;

        console.log('Localização obtida:', { latitude, longitude, accuracy });
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
        console.warn('Erro ao obter localização:', error);
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

        const defaultRegion = {
          latitude: -19.916667,
          longitude: -43.933333,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
        setRegion(defaultRegion);
        setMapKey(prev => prev + 1);
      },
      locationOptions
    );
  }, [locationPermissionGranted]);

  // Função para calcular distância entre pontos
  const calculateDistance = useCallback(points => {
    if (points.length < 2) return 0;

    let distance = 0;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];

      const R = 6371; // Raio da Terra em km
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

  // Função para obter ícone do POI baseado na categoria
  const getPOIIcon = useCallback(category => {
    const icons = {
      landmark: 'map-marker-star',
      viewpoint: 'binoculars',
      water: 'water',
      shelter: 'home-variant',
      danger: 'alert-triangle',
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

  // Função para obter cor do POI baseado na categoria
  const getPOIColor = useCallback(category => {
    const colors = {
      landmark: Colors.orange500,
      viewpoint: Colors.blue500,
      water: Colors.blue400,
      shelter: Colors.green500,
      danger: Colors.errorRed,
      parking: Colors.gray500,
      food: Colors.purple500,
      other: Colors.gray600,
      camping: Colors.green600,
      bridge: '#8B4513',
      cave: Colors.gray700,
      summit: Colors.red500,
      waterfall: '#20B2AA',
      wildlife: '#DAA520',
      photo: Colors.pink500,
      rest: '#4B0082',
    };
    return colors[category] || Colors.orange500;
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

  // FUNÇÕES DE POI CORRIGIDAS
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
        const result = await ApiService.criarPOI({
          trekId: currentTrailId,
          name: poiData.name,
          description: poiData.description,
          lat: poiData.latitude,
          lng: poiData.longitude,
          category: poiData.category,
        });

        if (result.success) {
          const newPOI = result.data;
          setPois(prev => [...prev, newPOI]);
          setAllPOIs(prev => [...prev, newPOI]);
          setShowAddPOI(false);
          Alert.alert('Sucesso', 'POI adicionado com sucesso!');
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        console.warn('Erro ao criar POI:', error);
        Alert.alert('Erro', 'Não foi possível adicionar o POI.');
      } finally {
        setLoadingPOI(false);
      }
    },
    [currentTrailId]
  );

  // FUNÇÃO PARA CARREGAR TODOS OS POIs DE TODAS AS TRILHAS
  const loadAllPOIs = useCallback(async () => {
    try {
      console.log('📍 Carregando todos os POIs...');
      const allTrailPOIs = [];

      // Carregar POIs das trilhas salvas localmente
      for (const trail of savedTrails) {
        if (trail.pois && trail.pois.length > 0) {
          allTrailPOIs.push(...trail.pois);
        }

        // Se a trilha tem ID da API, carregar POIs da API também
        if (trail.apiId) {
          try {
            const trailDetails = await ApiService.getTrilhaDetalhes(
              trail.apiId
            );
            if (trailDetails.success && trailDetails.data.pois) {
              allTrailPOIs.push(...trailDetails.data.pois);
            }
          } catch (error) {
            console.warn(
              `Erro ao carregar POIs da trilha ${trail.apiId}:`,
              error
            );
          }
        }
      }

      // Carregar POIs das trilhas públicas
      for (const trail of publicTrails) {
        if (trail.pois && trail.pois.length > 0) {
          allTrailPOIs.push(...trail.pois);
        } else if (trail._id || trail.id) {
          try {
            const trailDetails = await ApiService.getTrilhaDetalhes(
              trail._id || trail.id
            );
            if (trailDetails.success && trailDetails.data.pois) {
              allTrailPOIs.push(...trailDetails.data.pois);
            }
          } catch (error) {
            console.warn(
              `Erro ao carregar POIs da trilha pública ${
                trail._id || trail.id
              }:`,
              error
            );
          }
        }
      }

      // Remover duplicatas baseado no ID
      const uniquePOIs = allTrailPOIs.filter(
        (poi, index, self) =>
          index === self.findIndex(p => (p._id || p.id) === (poi._id || poi.id))
      );

      setAllPOIs(uniquePOIs);
      console.log(`✅ Carregados ${uniquePOIs.length} POIs únicos`);
    } catch (error) {
      console.warn('⚠️ Erro ao carregar POIs:', error);
    }
  }, [savedTrails, publicTrails]);

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
            { text: 'Iniciar Gravação', onPress: () => startRecording() },
          ]
        );
      }
    },
    [isRecording]
  );

  // FUNÇÕES DE GRAVAÇÃO CORRIGIDAS
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
    setIsRecording(true);
    setCurrentTrail([]);
    setCurrentTrailId(null);
    setPois([]);
    setRecordingStartTime(startTime);

    // SEMPRE criar trilha na API se autenticado
    if (isAuthenticated && user) {
      try {
        const trailData = {
          title: `Trilha ${startTime.toLocaleDateString(
            'pt-BR'
          )} ${startTime.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })}`,
          description: 'Trilha gravada automaticamente',
          startedAt: startTime.toISOString(),
          endedAt: null,
          totalDistance: 0,
          durationSeconds: 0,
          isOnline: true,
          isPublic: false,
          initialLat: location?.latitude || region.latitude,
          initialLng: location?.longitude || region.longitude,
        };

        const result = await ApiService.criarTrilha(trailData);

        if (result.success) {
          setCurrentTrailId(result.data.id);
          console.log('✅ Trilha criada na API:', result.data.id);
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        console.warn('⚠️ Erro ao criar trilha na API:', error);
        Alert.alert(
          'Aviso',
          'Não foi possível sincronizar com o servidor. A trilha será gravada apenas localmente.'
        );
      }
    }

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

        console.log('📍 Novo ponto da trilha:', newPoint);
        setCurrentTrail(prev => [...prev, newPoint]);
        setLocation({ latitude, longitude });

        // Adicionar coordenada à trilha na API se disponível
        if (currentTrailId && isAuthenticated) {
          try {
            await ApiService.salvarPontoTrilha(currentTrailId, newPoint);
          } catch (error) {
            console.warn('⚠️ Erro ao adicionar coordenada à trilha:', error);
          }
        }
      },
      error => {
        console.warn('💥 Erro ao rastrear posição:', error);
        setError('Erro ao rastrear posição durante gravação.');
      },
      watchOptions
    );
  }, [
    locationPermissionGranted,
    isAuthenticated,
    user,
    location,
    region,
    currentTrailId,
  ]);

  const stopRecording = useCallback(async () => {
    console.log('⏹️ Parando gravação de trilha');
    setIsRecording(false);
    setIsSavingTrail(true);

    if (watchId.current !== null) {
      Geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }

    const endTime = new Date();
    const distance = calculateDistance(currentTrail);
    const duration = recordingStartTime
      ? Math.round((endTime.getTime() - recordingStartTime.getTime()) / 1000)
      : 0;

    // SEMPRE salvar trilha, mesmo sem pontos
    const newTrail = {
      id: currentTrailId || Date.now(),
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
      apiId: currentTrailId,
      pois: [...pois],
      startTime: recordingStartTime?.toISOString(),
      endTime: endTime.toISOString(),
    };

    // Finalizar trilha na API se disponível
    if (currentTrailId && isAuthenticated) {
      try {
        await ApiService.atualizarTrilha(currentTrailId, {
          endedAt: endTime.toISOString(),
          totalDistance: distance,
          durationSeconds: duration,
        });
        console.log('✅ Trilha finalizada na API');
      } catch (error) {
        console.warn('⚠️ Erro ao finalizar trilha na API:', error);
      }
    }

    setSavedTrails(prev => [...prev, newTrail]);

    // Atualizar lista de POIs
    setAllPOIs(prev => [...prev, ...pois]);

    Alert.alert(
      'Trilha Salva',
      `Trilha gravada com ${currentTrail.length} pontos, ${
        pois.length
      } POIs e ${distance.toFixed(2)}km de distância.${
        currentTrailId ? ' Sincronizada com a nuvem.' : ''
      }`
    );

    setCurrentTrail([]);
    setCurrentTrailId(null);
    setPois([]);
    setRecordingStartTime(null);
    setIsSavingTrail(false);
  }, [
    currentTrail,
    pois,
    calculateDistance,
    currentTrailId,
    isAuthenticated,
    recordingStartTime,
  ]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  // FUNÇÃO PARA ALTERNAR VISIBILIDADE DE TRILHA PÚBLICA ESPECÍFICA
  const handleTogglePublicTrailVisibility = useCallback((trailId, visible) => {
    setVisiblePublicTrails(prev => {
      const newSet = new Set(prev);
      if (visible) {
        newSet.add(trailId);
      } else {
        newSet.delete(trailId);
      }
      return newSet;
    });
  }, []);

  // Adicionar esta linha junto com os outros useRef no início do componente
  const loadingTimeout = useRef(null);

  // FUNÇÃO DE CARREGAR TRILHAS PÚBLICAS CORRIGIDA - SEM DEPENDÊNCIAS CIRCULARES

  // USEEFFECT CORRIGIDO - SEM LOOP INFINITO
  useEffect(() => {
    if (!isMapReady) return;

    // Limpar timeout anterior
    if (loadingTimeout.current) {
      clearTimeout(loadingTimeout.current);
    }

    // Debounce para evitar muitas chamadas
    loadingTimeout.current = setTimeout(() => {
      console.log('�� Carregando trilhas para região (debounced):', region);
      loadPublicTrails();
    }, 2000); // 2 segundos de debounce

    return () => {
      if (loadingTimeout.current) {
        clearTimeout(loadingTimeout.current);
      }
    };
  }, [
    Math.round(region.latitude * 1000) / 1000, // Arredondar para evitar mudanças mínimas
    Math.round(region.longitude * 1000) / 1000,
    Math.round(region.latitudeDelta * 1000) / 1000,
    Math.round(region.longitudeDelta * 1000) / 1000,
    isMapReady,
  ]); // Dependências específicas e arredondadas

  // Carregar dados iniciais quando o mapa estiver pronto - APENAS UMA VEZ
  useEffect(() => {
    if (isMapReady) {
      console.log('🗺️ Mapa pronto - carregando dados iniciais');
      loadMyTrails();
      loadPublicTrails(true); // Force load inicial
    }
  }, [isMapReady]); // Apenas quando mapa ficar pronto

  // Cleanup do timeout
  useEffect(() => {
    return () => {
      if (loadingTimeout.current) {
        clearTimeout(loadingTimeout.current);
      }
    };
  }, []);
  // USEEFFECT CORRIGIDO - SEM LOOP INFINITO
  useEffect(() => {
    if (!isMapReady) return;

    // Limpar timeout anterior
    if (loadingTimeout.current) {
      clearTimeout(loadingTimeout.current);
    }

    // Debounce para evitar muitas chamadas
    loadingTimeout.current = setTimeout(() => {
      console.log('🔄 Carregando trilhas para região (debounced):', region);
      loadPublicTrails();
    }, 2000); // 2 segundos de debounce

    return () => {
      if (loadingTimeout.current) {
        clearTimeout(loadingTimeout.current);
      }
    };
  }, [
    Math.round(region.latitude * 1000) / 1000, // Arredondar para evitar mudanças mínimas
    Math.round(region.longitude * 1000) / 1000,
    Math.round(region.latitudeDelta * 1000) / 1000,
    Math.round(region.longitudeDelta * 1000) / 1000,
    isMapReady,
  ]); // Dependências específicas e arredondadas

  // Carregar dados iniciais quando o mapa estiver pronto - APENAS UMA VEZ
  useEffect(() => {
    if (isMapReady) {
      console.log('🗺️ Mapa pronto - carregando dados iniciais');
      loadMyTrails();
      loadPublicTrails(true); // Force load inicial
    }
  }, [isMapReady]); // Apenas quando mapa ficar pronto

  // Cleanup do timeout
  useEffect(() => {
    return () => {
      if (loadingTimeout.current) {
        clearTimeout(loadingTimeout.current);
      }
    };
  }, []);

  // FUNÇÃO DE CARREGAR MINHAS TRILHAS CORRIGIDA
  const loadMyTrails = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      console.log('📋 Carregando minhas trilhas da API...');
      const result = await ApiService.getMinhasTrilhas();

      if (result.success) {
        console.log(`✅ Recebidas ${result.data.length} trilhas da API`);

        setSavedTrails(currentTrails => {
          const mergedTrails = [...currentTrails];

          result.data.forEach(apiTrail => {
            const existingIndex = mergedTrails.findIndex(
              local => local.apiId === apiTrail._id
            );

            const processedTrail = {
              ...apiTrail,
              id: apiTrail._id,
              apiId: apiTrail._id,
              visible: true,
              points: apiTrail.coordinates || apiTrail.points || [],
              pois: apiTrail.pois || [],
            };

            if (existingIndex >= 0) {
              mergedTrails[existingIndex] = {
                ...mergedTrails[existingIndex],
                ...processedTrail,
              };
            } else {
              mergedTrails.push(processedTrail);
            }
          });

          return mergedTrails;
        });

        console.log(`✅ Processadas ${result.data.length} trilhas da API`);
      } else {
        console.warn('⚠️ Erro na resposta da API:', result.message);
      }
    } catch (error) {
      console.warn('⚠️ Erro ao carregar minhas trilhas:', error);
    }
  }, [isAuthenticated]);

  // USEEFFECTS CORRIGIDOS
  useEffect(() => {
    if (!isMapReady) return;

    const timeoutId = setTimeout(() => {
      console.log('🔄 Carregando trilhas para região:', region);
      loadPublicTrails();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [
    region.latitude,
    region.longitude,
    region.latitudeDelta,
    region.longitudeDelta,
    isMapReady,
    loadPublicTrails,
  ]);

  // Carregar dados iniciais quando o mapa estiver pronto
  useEffect(() => {
    if (isMapReady) {
      console.log('🗺️ Mapa pronto - carregando dados iniciais');
      loadMyTrails();
      loadPublicTrails();
    }
  }, [isMapReady, loadMyTrails, loadPublicTrails]);

  // Carregar POIs quando trilhas mudarem
  useEffect(() => {
    if (savedTrails.length > 0 || publicTrails.length > 0) {
      loadAllPOIs();
    }
  }, [savedTrails, publicTrails, loadAllPOIs]);

  // Funções para gerenciar trilhas
  const handleUpdateTrail = useCallback(
    async (trailId, updates) => {
      setSavedTrails(prev =>
        prev.map(trail => {
          if (trail.id === trailId) {
            const updatedTrail = { ...trail, ...updates };

            if (updatedTrail.apiId && isAuthenticated) {
              ApiService.atualizarTrilha(updatedTrail.apiId, {
                title: updates.name,
                ...updates,
              }).catch(error => {
                console.warn('⚠️ Erro ao atualizar trilha na API:', error);
              });
            }

            return updatedTrail;
          }
          return trail;
        })
      );
    },
    [isAuthenticated]
  );

  const handleDeleteTrail = useCallback(
    async trailId => {
      const trail = savedTrails.find(t => t.id === trailId);

      if (trail?.apiId && isAuthenticated) {
        try {
          console.log(
            '🗑️ Trilha removida localmente (API delete não implementado)'
          );
        } catch (error) {
          console.warn('⚠️ Erro ao deletar trilha na API:', error);
        }
      }

      setSavedTrails(prev => prev.filter(trail => trail.id !== trailId));
    },
    [savedTrails, isAuthenticated]
  );

  const handleToggleTrailVisibility = useCallback((trailId, visible) => {
    setSavedTrails(prev =>
      prev.map(trail => (trail.id === trailId ? { ...trail, visible } : trail))
    );
  }, []);

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

  // Filtrar trilhas visíveis para exibir no mapa
  const visibleTrails = useMemo(
    () => savedTrails.filter(trail => trail.visible !== false),
    [savedTrails]
  );

  // FUNÇÃO PARA ALTERNAR TODAS AS TRILHAS PÚBLICAS - CORRIGIDA
  const handleToggleAllPublicTrails = useCallback(
    visible => {
      console.log(
        '🔄 Alternando visibilidade de todas as trilhas públicas:',
        visible
      );
      setPublicTrailsVisible(visible);

      if (visible) {
        // Tornar todas as trilhas públicas visíveis
        const allPublicTrailIds = publicTrails.map(
          trail => trail._id || trail.id
        );
        setVisiblePublicTrails(new Set(allPublicTrailIds));
        console.log(
          '✅ Trilhas públicas tornadas visíveis:',
          allPublicTrailIds.length
        );
      } else {
        // Ocultar todas as trilhas públicas
        setVisiblePublicTrails(new Set());
        console.log('❌ Todas as trilhas públicas ocultadas');
      }
    },
    [publicTrails]
  );

  // FUNÇÃO DE CARREGAR TRILHAS PÚBLICAS CORRIGIDA
  const loadPublicTrails = useCallback(
    async (forceLoad = false) => {
      if (!isMapReady || loadingTrails) return;

      // Verificar se já carregou para esta região recentemente
      const currentRegionKey = `${region.latitude.toFixed(
        4
      )}_${region.longitude.toFixed(4)}_${region.latitudeDelta.toFixed(4)}`;

      if (!forceLoad && lastRegionLoad.current === currentRegionKey) {
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

        const result = await ApiService.getTrilhasPorArea(
          latitude,
          longitude,
          Math.max(latitudeDelta, longitudeDelta) * 111
        );

        if (result.success) {
          console.log(
            `✅ Recebidas ${result.data.length} trilhas públicas da API`
          );
          setPublicTrails(result.data);

          // CORRIGIDO: Automaticamente tornar visíveis TODAS as trilhas se a opção estiver habilitada
          if (publicTrailsVisible) {
            const allTrailIds = result.data.map(trail => trail._id || trail.id);
            setVisiblePublicTrails(new Set(allTrailIds));
            console.log(
              `✅ ${allTrailIds.length} trilhas públicas tornadas visíveis automaticamente`
            );
          }

          // Marcar região como carregada
          lastRegionLoad.current = currentRegionKey;
          console.log(
            `✅ Carregadas ${result.data.length} trilhas públicas da região`
          );
        } else {
          console.warn('⚠️ Erro na resposta da API:', result.message);
        }
      } catch (error) {
        console.warn('⚠️ Erro ao carregar trilhas públicas:', error);
      } finally {
        setLoadingTrails(false);
      }
    },
    [
      region.latitude,
      region.longitude,
      region.latitudeDelta,
      region.longitudeDelta,
      isMapReady,
      loadingTrails,
      publicTrailsVisible,
    ]
  );

  // USEEFFECT PARA INICIALIZAR VISIBILIDADE DAS TRILHAS PÚBLICAS
  useEffect(() => {
    if (publicTrails.length > 0 && publicTrailsVisible) {
      const allTrailIds = publicTrails.map(trail => trail._id || trail.id);
      setVisiblePublicTrails(new Set(allTrailIds));
      console.log(
        `🔄 Inicializando visibilidade de ${allTrailIds.length} trilhas públicas`
      );
    }
  }, [publicTrails, publicTrailsVisible]);

  // FILTRAR TRILHAS PÚBLICAS VISÍVEIS - CORRIGIDO
  const visiblePublicTrailsFiltered = useMemo(() => {
    const filtered = publicTrails.filter(trail => {
      const trailId = trail._id || trail.id;
      const isVisible = publicTrailsVisible && visiblePublicTrails.has(trailId);
      return isVisible;
    });

    console.log(
      `🔍 Trilhas públicas filtradas: ${filtered.length}/${publicTrails.length} visíveis`
    );
    return filtered;
  }, [publicTrails, publicTrailsVisible, visiblePublicTrails]);

  // Cleanup ao desmontar componente
  useEffect(() => {
    return () => {
      if (watchId.current !== null) {
        Geolocation.clearWatch(watchId.current);
      }
    };
  }, []);

  // Gerenciamento do ciclo de vida do app
  useEffect(() => {
    const handleAppStateChange = nextAppState => {
      console.log('📱 App state mudou:', appState.current, '->', nextAppState);

      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('🔄 App voltou para foreground');
        if (mapRef.current && region && isMapReady) {
          setTimeout(() => {
            console.log(
              '🔄 Forçando atualização do mapa após voltar do background'
            );
            setMapKey(prev => prev + 1);
            try {
              mapRef.current.animateToRegion(region, 100);
            } catch (error) {
              console.warn(
                '⚠️ Erro ao animar região após voltar do background:',
                error
              );
            }
          }, 100);
        }
      }

      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    );

    return () => {
      subscription?.remove();
    };
  }, [region, isMapReady]);

  useEffect(() => {
    console.log('🔐 useEffect: Solicitando permissão de localização...');
    requestLocationPermission();
  }, [requestLocationPermission]);

  useEffect(() => {
    if (locationPermissionGranted) {
      console.log(
        '✅ useEffect: Permissão concedida, obtendo localização atual...'
      );
      getCurrentLocation();
    }
  }, [locationPermissionGranted, getCurrentLocation]);

  useEffect(() => {
    console.log('📍 Region state mudou:', region);
  }, [region]);

  if (loading && !isMapReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={ColorUtils.getThemeColor(
            Colors.verdeFlorestaProfundo,
            Colors.douradoNobre,
            isDarkMode
          )}
        />
        <Text style={styles.loadingText}>Carregando mapa...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        key={`map-${mapKey}`}
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        customMapStyle={mapStyle}
        loadingEnabled={true}
        showsUserLocation={false}
        followsUserLocation={false}
        loadingIndicatorColor={ColorUtils.getThemeColor(
          Colors.verdeFlorestaProfundo,
          Colors.douradoNobre,
          isDarkMode
        )}
        loadingBackgroundColor={ColorUtils.getThemeColor(
          Colors.backgroundPrimary,
          Colors.backgroundPrimaryDark,
          isDarkMode
        )}
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
        mapPadding={{
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        }}
      >
        {/* Localização do usuário */}
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
              <Icon name="hiking" size={20} color={Colors.white} />
            </View>
          </Marker>
        )}

        {/* Trilha atual sendo gravada */}
        {isRecording && currentTrail.length > 1 && (
          <Polyline
            coordinates={currentTrail}
            strokeColor={ColorUtils.getThemeColor(
              Colors.trailActive,
              Colors.douradoNobre,
              isDarkMode
            )}
            strokeWidth={4}
            lineDashPattern={[5, 5]}
          />
        )}

        {/* Trilhas salvas (apenas as visíveis) */}
        {visibleTrails.map(trail => (
          <Polyline
            key={trail.id}
            coordinates={trail.points || trail.coordinates || []}
            strokeColor={ColorUtils.getThemeColor(
              Colors.trailSaved,
              Colors.verdeMusgo,
              isDarkMode
            )}
            strokeWidth={3}
          />
        ))}

        {/* Trilhas públicas da API - APENAS AS VISÍVEIS */}
        {visiblePublicTrailsFiltered.map(trail => (
          <Polyline
            key={`public-${trail.id || trail._id}`}
            coordinates={trail.coordinates || trail.points || []}
            strokeColor={ColorUtils.getThemeColor(
              Colors.blue500,
              Colors.blue400,
              isDarkMode
            )}
            strokeWidth={2}
            strokeOpacity={0.7}
          />
        ))}

        {/* POIs da trilha atual sendo gravada */}
        {pois.map(poi => {
          const iconName = getPOIIcon(poi.category);
          const iconColor = getPOIColor(poi.category);
          const iconSize = getPOISize(poi.category);

          return (
            <Marker
              key={`current-poi-${poi._id || poi.id}`}
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
                <Icon name={iconName} size={iconSize} color={Colors.white} />
              </View>
            </Marker>
          );
        })}

        {/* TODOS OS POIs - das trilhas salvas e públicas */}
        {allPOIs.map(poi => {
          const iconName = getPOIIcon(poi.category);
          const iconColor = getPOIColor(poi.category);
          const iconSize = Math.max(getPOISize(poi.category) - 2, 16);

          return (
            <Marker
              key={`all-poi-${poi._id || poi.id}`}
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
                    width: iconSize + 10,
                    height: iconSize + 10,
                    borderRadius: (iconSize + 10) / 2,
                    opacity: 0.9,
                  },
                ]}
              >
                <Icon name={iconName} size={iconSize} color={Colors.white} />
              </View>
            </Marker>
          );
        })}

        {/* Marker de exemplo */}
        <Marker
          coordinate={{
            latitude: -19.921,
            longitude: -43.938,
          }}
          title="Mirante da Serra"
          description="Ótima vista da cidade!"
        >
          <View style={styles.markerContainer}>
            <Icon
              name="terrain"
              size={20}
              color={Colors.verdeFlorestaProfundo}
            />
          </View>
        </Marker>
      </MapView>

      {/* Indicador de gravação com POI */}
      {isRecording && (
        <View style={styles.recordingIndicator}>
          <View style={styles.recordingDot} />
          <Text style={styles.recordingText}>
            Gravando trilha • {currentTrail.length} pontos • {pois.length} POIs
          </Text>
          <Text style={styles.recordingSubtext}>
            Toque e segure no mapa para adicionar POI
          </Text>
        </View>
      )}

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
        onRefreshTrails={loadPublicTrails}
        onTogglePublicTrails={handleToggleAllPublicTrails}
      />

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
        onRefreshPublicTrails={loadPublicTrails}
      />

      <AddPOIModal
        visible={showAddPOI}
        isDarkMode={isDarkMode}
        location={selectedLocation}
        loading={loadingPOI}
        onClose={() => setShowAddPOI(false)}
        onSave={handleAddPOI}
      />

      {loading && isMapReady && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator
            size="large"
            color={ColorUtils.getThemeColor(
              Colors.verdeFlorestaProfundo,
              Colors.douradoNobre,
              isDarkMode
            )}
          />
        </View>
      )}

      {isSavingTrail && (
        <View style={styles.savingOverlay}>
          <ActivityIndicator
            size="large"
            color={ColorUtils.getThemeColor(
              Colors.verdeFlorestaProfundo,
              Colors.douradoNobre,
              isDarkMode
            )}
          />
          <Text style={styles.savingText}>Salvando trilha...</Text>
        </View>
      )}

      {error && (
        <View style={styles.overlayError}>
          <Text style={styles.overlayErrorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

export default MapScreen;
