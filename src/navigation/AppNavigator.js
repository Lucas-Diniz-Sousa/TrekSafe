import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MapScreen from '../screens/MapScreen'; // Nossa tela de mapa

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Map">
      <Stack.Screen
        name="Map"
        component={MapScreen}
        options={{
          headerShown: false, // Oculta o cabeçalho padrão para o mapa
        }}
      />
      {/* Outras telas serão adicionadas aqui futuramente */}
    </Stack.Navigator>
  );
};

export default AppNavigator;