import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // Container principal
  container: {
    flex: 1,
  },
  
  // Mapa
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  
  // Loading - Modo Claro
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    fontWeight: '500',
  },
  
  // Loading - Modo Escuro
  loadingContainerDark: {
    backgroundColor: '#121212',
  },
  loadingTextDark: {
    color: '#FFFFFF',
  },
  
  // Error Container - Modo Claro
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffdddd',
  },
  errorText: {
    fontSize: 18,
    color: '#ff0000',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  errorSubText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginTop: 5,
  },
  
  // Error Container - Modo Escuro
  errorContainerDark: {
    backgroundColor: '#121212',
  },
  errorTextDark: {
    color: '#CF6679',
  },
  errorSubTextDark: {
    color: '#FFFFFF',
  },
  
  // Overlay Error - Modo Claro
  overlayError: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    padding: 15,
    borderRadius: 8,
    zIndex: 1,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  overlayErrorText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Overlay Error - Modo Escuro
  overlayErrorDark: {
    backgroundColor: 'rgba(18, 18, 18, 0.9)',
  },
  overlayErrorTextDark: {
    color: '#CF6679',
  },

  // Controles de zoom e navegação
  controlsContainer: {
    position: 'absolute',
    right: 15,
    bottom: 50,
    zIndex: 2,
  },
  controlButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  controlButtonDark: {
    backgroundColor: 'rgba(18, 18, 18, 0.95)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  controlButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
  },
  controlButtonTextDark: {
    color: '#FFFFFF',
  },
  locationButton: {
    backgroundColor: 'rgba(0, 102, 204, 0.95)',
    borderColor: 'rgba(0, 82, 163, 0.3)',
  },
  locationButtonDark: {
    backgroundColor: 'rgba(187, 134, 252, 0.95)',
    borderColor: 'rgba(156, 100, 232, 0.3)',
  },
  locationButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
  },
});