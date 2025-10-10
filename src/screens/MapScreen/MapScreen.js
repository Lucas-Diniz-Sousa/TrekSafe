// src/screens/MapScreen/MapScreen.js
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  useColorScheme,
  AppState,
  Alert,
  Platform,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Geolocation from '@react-native-community/geolocation';
import MapControls from '../../components/MapControls/MapControls'; 
import { Colors, ColorUtils } from '../../theme/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { createStyles } from './MapScreen.styles';
import TrailsModal from '../../components/TrailsModal/TrialsModal';

const MapScreen = ({ navigation }) => {
  const initialRegion = {
    latitude: -19.916667,
    longitude: -43.933333,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const [region, setRegion] = useState(initialRegion);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
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
  
  // Estado para modal de trilhas
  const [showTrailsModal, setShowTrailsModal] = useState(false);
  
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const styles = createStyles(isDarkMode);
  
  const mapRef = useRef(null);
  const appState = useRef(AppState.currentState);
  const isUpdatingRegion = useRef(false);
  const watchId = useRef(null);

  console.log('region atual:', region);
  console.log('Gravando trilha:', isRecording, 'Pontos:', currentTrail.length);

  // Estilo de mapa simplificado e visualmente agradável
  const mapStyle = useMemo(() => {
    if (isDarkMode) {
      return [
        {
          "elementType": "geometry",
          "stylers": [{"color": Colors.mapDarkBase}]
        },
        {
          "elementType": "labels.icon",
          "stylers": [{"visibility": "off"}]
        },
        {
          "elementType": "labels.text.fill",
          "stylers": [{"color": Colors.mapTextDark}]
        },
        {
          "elementType": "labels.text.stroke",
          "stylers": [{"color": Colors.mapDarkBase}]
        },
        {
          "featureType": "administrative",
          "elementType": "geometry",
          "stylers": [{"color": Colors.mapLandmarkDark}]
        },
        {
          "featureType": "administrative.country",
          "elementType": "labels.text.fill",
          "stylers": [{"color": Colors.mapTextDark}]
        },
        {
          "featureType": "administrative.land_parcel",
          "stylers": [{"visibility": "off"}]
        },
        {
          "featureType": "administrative.locality",
          "elementType": "labels.text.fill",
          "stylers": [{"color": Colors.mapTextDark}]
        },
        {
          "featureType": "poi",
          "elementType": "labels.text.fill",
          "stylers": [{"color": Colors.mapTextDark}]
        },
        {
          "featureType": "poi.park",
          "elementType": "geometry",
          "stylers": [{"color": Colors.verdeFlorestaProfundo}]
        },
        {
          "featureType": "poi.park",
          "elementType": "labels.text.fill",
          "stylers": [{"color": Colors.verdeMusgo}]
        },
        {
          "featureType": "poi.park",
          "elementType": "labels.text.stroke",
          "stylers": [{"color": Colors.mapDarkBase}]
        },
        {
          "featureType": "road",
          "elementType": "geometry.fill",
          "stylers": [{"color": Colors.mapRoadDark}]
        },
        {
          "featureType": "road",
          "elementType": "labels.text.fill",
          "stylers": [{"color": Colors.mapTextDark}]
        },
        {
          "featureType": "road.arterial",
          "elementType": "geometry",
          "stylers": [{"color": Colors.mapRoadDark}]
        },
        {
          "featureType": "road.highway",
          "elementType": "geometry",
          "stylers": [{"color": Colors.mapRoadDark}]
        },
        {
          "featureType": "road.highway.controlled_access",
          "elementType": "geometry",
          "stylers": [{"color": Colors.mapRoadDark}]
        },
        {
          "featureType": "road.local",
          "elementType": "labels.text.fill",
          "stylers": [{"color": Colors.mapTextDark}]
        },
        {
          "featureType": "transit",
          "elementType": "labels.text.fill",
          "stylers": [{"color": Colors.mapTextDark}]
        },
        {
          "featureType": "water",
          "elementType": "geometry",
          "stylers": [{"color": Colors.mapWaterDark}]
        },
        {
          "featureType": "water",
          "elementType": "labels.text.fill",
          "stylers": [{"color": Colors.mapTextDark}]
        }
      ];
    } else {
      return [
        {
          "elementType": "geometry",
          "stylers": [{"color": Colors.mapLightBase}]
        },
        {
          "elementType": "labels.icon",
          "stylers": [{"visibility": "off"}]
        },
        {
          "elementType": "labels.text.fill",
          "stylers": [{"color": Colors.mapTextLight}]
        },
        {
          "elementType": "labels.text.stroke",
          "stylers": [{"color": Colors.mapLightBase}]
        },
        {
          "featureType": "administrative",
          "elementType": "geometry",
          "stylers": [{"color": Colors.mapLandmarkLight}]
        },
        {
          "featureType": "administrative.country",
          "elementType": "labels.text.fill",
          "stylers": [{"color": Colors.mapTextLight}]
        },
        {
          "featureType": "administrative.land_parcel",
          "stylers": [{"visibility": "off"}]
        },
        {
          "featureType": "administrative.locality",
          "elementType": "labels.text.fill",
          "stylers": [{"color": Colors.mapTextLight}]
        },
        {
          "featureType": "poi",
          "elementType": "labels.text.fill",
          "stylers": [{"color": Colors.mapTextLight}]
        },
        {
          "featureType": "poi.park",
          "elementType": "geometry",
          "stylers": [{"color": Colors.verdeMusgo}]
        },
        {
          "featureType": "poi.park",
          "elementType": "labels.text.fill",
          "stylers": [{"color": Colors.verdeFlorestaProfundo}]
        },
        {
          "featureType": "poi.park",
          "elementType": "labels.text.stroke",
          "stylers": [{"color": Colors.mapLightBase}]
        },
        {
          "featureType": "road",
          "elementType": "geometry.fill",
          "stylers": [{"color": Colors.mapRoadLight}]
        },
        {
          "featureType": "road",
          "elementType": "labels.text.fill",
          "stylers": [{"color": Colors.mapTextLight}]
        },
        {
          "featureType": "road.arterial",
          "elementType": "geometry",
          "stylers": [{"color": Colors.mapRoadLight}]
        },
        {
          "featureType": "road.highway",
          "elementType": "geometry",
          "stylers": [{"color": Colors.mapRoadLight}]
        },
        {
          "featureType": "road.highway.controlled_access",
          "elementType": "geometry",
          "stylers": [{"color": Colors.mapRoadLight}]
        },
        {
          "featureType": "road.local",
          "elementType": "labels.text.fill",
          "stylers": [{"color": Colors.mapTextLight}]
        },
        {
          "featureType": "transit",
          "elementType": "labels.text.fill",
          "stylers": [{"color": Colors.mapTextLight}]
        },
        {
          "featureType": "water",
          "elementType": "geometry",
          "stylers": [{"color": Colors.mapWaterLight}]
        },
        {
          "featureType": "water",
          "elementType": "labels.text.fill",
          "stylers": [{"color": Colors.mapTextLight}]
        }
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
        permissionResult = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
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
      locationOptions,
    );
  }, [locationPermissionGranted]);

  // Função para calcular distância entre pontos
  const calculateDistance = useCallback((points) => {
    if (points.length < 2) return 0;
    
    let distance = 0;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      
      const R = 6371; // Raio da Terra em km
      const dLat = (curr.latitude - prev.latitude) * Math.PI / 180;
      const dLon = (curr.longitude - prev.longitude) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(prev.latitude * Math.PI / 180) * Math.cos(curr.latitude * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      distance += R * c;
    }
    
    return distance;
  }, []);

  // Funções para gravação de trilha
  const startRecording = useCallback(() => {
    if (!locationPermissionGranted) {
      Alert.alert('Erro', 'Permissão de localização necessária para gravar trilha.');
      return;
    }

    console.log('Iniciando gravação de trilha');
    setIsRecording(true);
    setCurrentTrail([]);

    const watchOptions = {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 1000,
      distanceFilter: 5,
    };

    watchId.current = Geolocation.watchPosition(
      position => {
        const { latitude, longitude } = position.coords;
        const newPoint = { latitude, longitude };
        
        console.log('Novo ponto da trilha:', newPoint);
        setCurrentTrail(prev => [...prev, newPoint]);
        setLocation(newPoint);
      },
      error => {
        console.warn('Erro ao rastrear posição:', error);
        setError('Erro ao rastrear posição durante gravação.');
      },
      watchOptions
    );
  }, [locationPermissionGranted]);

  const stopRecording = useCallback(() => {
    console.log('Parando gravação de trilha');
    setIsRecording(false);

    if (watchId.current !== null) {
      Geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }

    if (currentTrail.length > 0) {
      const newTrail = {
        id: Date.now(),
        date: new Date().toISOString(),
        points: [...currentTrail],
        distance: calculateDistance(currentTrail),
        visible: true, // Por padrão, trilha fica visível
        name: null, // Nome será definido pelo usuário depois
      };
      
      setSavedTrails(prev => [...prev, newTrail]);
      Alert.alert(
        'Trilha Salva', 
        `Trilha gravada com ${currentTrail.length} pontos e ${newTrail.distance.toFixed(2)}km de distância.`
      );
    }

    setCurrentTrail([]);
  }, [currentTrail, calculateDistance]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  // Novas funções para gerenciar trilhas
  const handleUpdateTrail = useCallback((trailId, updates) => {
    setSavedTrails(prev => 
      prev.map(trail => 
        trail.id === trailId 
          ? { ...trail, ...updates }
          : trail
      )
    );
  }, []);

  const handleDeleteTrail = useCallback((trailId) => {
    setSavedTrails(prev => prev.filter(trail => trail.id !== trailId));
  }, []);

  const handleToggleTrailVisibility = useCallback((trailId, visible) => {
    setSavedTrails(prev => 
      prev.map(trail => 
        trail.id === trailId 
          ? { ...trail, visible }
          : trail
      )
    );
  }, []);

  // Função modificada para navegar para login
  const handleLogin = useCallback(() => {
    if (navigation) {
      navigation.navigate('Login');
    } else {
      Alert.alert('Login', 'Funcionalidade de login será implementada em breve.');
    }
  }, [navigation]);

  const handleViewTrails = useCallback(() => {
    setShowTrailsModal(true);
  }, []);

  const handleMapReady = useCallback(() => {
    console.log('Mapa pronto para uso');
    setIsMapReady(true);
  }, []);

  const handleRegionChangeComplete = useCallback((newRegion) => {
    if (!isUpdatingRegion.current) {
      console.log('Região atualizada pelo usuário:', newRegion);
      setRegion(newRegion);
    }
  }, []);

  const updateRegion = useCallback((newRegion, animated = true) => {
    console.log('Atualizando região para:', newRegion);
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
        console.warn('Erro ao atualizar região do mapa:', error);
        setMapKey(prev => prev + 1);
      }
    }
    
    setTimeout(() => {
      isUpdatingRegion.current = false;
    }, 600);
  }, [isMapReady]);

  const centerOnUser = useCallback(() => {
    if (location && isMapReady) {
      const newRegion = {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      
      console.log('Centralizando no usuário:', newRegion);
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
      
      console.log('Zoom in para:', newRegion);
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
      
      console.log('Zoom out para:', newRegion);
      updateRegion(newRegion);
    }
  }, [region, isMapReady, updateRegion]);

  // Filtrar trilhas visíveis para exibir no mapa
  const visibleTrails = useMemo(() => 
    savedTrails.filter(trail => trail.visible !== false),
    [savedTrails]
  );

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
    const handleAppStateChange = (nextAppState) => {
      console.log('App state mudou:', appState.current, '->', nextAppState);
      
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App voltou para foreground');
        if (mapRef.current && region && isMapReady) {
          setTimeout(() => {
            console.log('Forçando atualização do mapa após voltar do background');
            setMapKey(prev => prev + 1);
            try {
              mapRef.current.animateToRegion(region, 100);
            } catch (error) {
              console.warn('Erro ao animar região após voltar do background:', error);
            }
          }, 100);
        }
      }
      
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, [region, isMapReady]);

  useEffect(() => {
    console.log('useEffect: Solicitando permissão de localização...');
    requestLocationPermission();
  }, [requestLocationPermission]);

  useEffect(() => {
    if (locationPermissionGranted) {
      console.log(
        'useEffect: Permissão concedida, obtendo localização atual...',
      );
      getCurrentLocation();
    }
  }, [locationPermissionGranted, getCurrentLocation]);

  useEffect(() => {
    console.log('Region state mudou:', region);
  }, [region]);

  if (loading && !isMapReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator 
          size="large" 
          color={ColorUtils.getThemeColor(Colors.verdeFlorestaProfundo, Colors.douradoNobre, isDarkMode)} 
        />
        <Text style={styles.loadingText}>
          Carregando mapa...
        </Text>
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
        loadingIndicatorColor={ColorUtils.getThemeColor(Colors.verdeFlorestaProfundo, Colors.douradoNobre, isDarkMode)}
        loadingBackgroundColor={ColorUtils.getThemeColor(Colors.backgroundPrimary, Colors.backgroundPrimaryDark, isDarkMode)}
        showsCompass={false}
        zoomEnabled={true}
        zoomControlEnabled={false}
        scrollEnabled={true}
        pitchEnabled={true}
        rotateEnabled={true}
        zoomTapEnabled={true}
        onMapReady={handleMapReady}
        onRegionChangeComplete={handleRegionChangeComplete}
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
            strokeColor={ColorUtils.getThemeColor(Colors.trailActive, Colors.douradoNobre, isDarkMode)} 
            strokeWidth={4}
            lineDashPattern={[5, 5]}
          />
        )}
        
        {/* Trilhas salvas (apenas as visíveis) */}
        {visibleTrails.map((trail) => (
          <Polyline
            key={trail.id}
            coordinates={trail.points}
            strokeColor={ColorUtils.getThemeColor(Colors.trailSaved, Colors.verdeMusgo, isDarkMode)} 
            strokeWidth={3}
          />
        ))}
        
        <Marker
          coordinate={{
            latitude: -19.921,
            longitude: -43.938,
          }}
          title="Mirante da Serra"
          description="Ótima vista da cidade!"
        >
          <View style={styles.markerContainer}>
            <Icon name="terrain" size={20} color={Colors.verdeFlorestaProfundo} />
          </View>
        </Marker>
      </MapView>

      <MapControls
        isDarkMode={isDarkMode}
        isMapReady={isMapReady}
        isRecording={isRecording}
        savedTrails={savedTrails}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onCenterOnUser={centerOnUser}
        onToggleRecording={toggleRecording}
        onLogin={handleLogin}
        onViewTrails={handleViewTrails}
      />

      {/* Modal de trilhas */}
      <TrailsModal
        visible={showTrailsModal}
        isDarkMode={isDarkMode}
        trails={savedTrails}
        onClose={() => setShowTrailsModal(false)}
        onUpdateTrail={handleUpdateTrail}
        onDeleteTrail={handleDeleteTrail}
        onToggleTrailVisibility={handleToggleTrailVisibility}
      />

      {loading && isMapReady && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator 
            size="large" 
            color={ColorUtils.getThemeColor(Colors.verdeFlorestaProfundo, Colors.douradoNobre, isDarkMode)} 
          />
        </View>
      )}

      {error && (
        <View style={styles.overlayError}>
          <Text style={styles.overlayErrorText}>
            {error}
          </Text>
        </View>
      )}
    </View>
  );
};

export default MapScreen;