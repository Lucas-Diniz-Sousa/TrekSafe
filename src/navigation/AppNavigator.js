import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import LoginScreen from '../screens/LoginScreen/LoginScreen';
import MapScreen from '../screens/MapScreen/MapScreen';
import { useAuth } from '../contexts/AuthContext';
import { Colors } from '../theme/theme';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { authState } = useAuth();

  // Tela de loading enquanto verifica autenticação
  if (authState.status === 'LOADING') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.backgroundPrimary }}>
        <ActivityIndicator size="large" color={Colors.verdeFlorestaProfundo} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={authState.status === 'AUTHENTICATED' ? 'Map' : 'Login'}
      screenOptions={{
        headerShown: false, // Remove header de todas as telas por padrão
        animation: 'slide_from_right', // Animação suave entre telas
      }}
    >
      {authState.status === 'AUTHENTICATED' ? (
        <Stack.Screen
          name="Map"
          component={MapScreen}
          options={{
            headerShown: false,
          }}
        />
      ) : (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            headerShown: false,
          }}
        />
      )}
      {/* Futuras telas serão adicionadas aqui */}
    </Stack.Navigator>
  );
};

export default AppNavigator;
