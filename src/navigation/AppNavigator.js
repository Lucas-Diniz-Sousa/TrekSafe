import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import LoginScreen from '../screens/LoginScreen/LoginScreen';
import MapScreen from '../screens/MapScreen/MapScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Map"
      screenOptions={{
        headerShown: false, // Remove header de todas as telas por padrão
        animation: 'slide_from_right', // Animação suave entre telas
      }}
    >
      <Stack.Screen
        name="Map"
        component={MapScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          headerShown: false,
        }}
      />
      {/* Futuras telas serão adicionadas aqui */}
    </Stack.Navigator>
  );
};

export default AppNavigator;
