import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import LoginScreen from '../screens/LoginScreen/LoginScreen';
import MapScreen from '../screens/MapScreen/MapScreen';
import { Colors } from '../theme/theme';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { status, isLoading } = useAuth();

  if (status === 'loading' || isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: Colors.backgroundPrimary,
        }}
      >
        <ActivityIndicator size="large" color={Colors.verdeFlorestaProfundo} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={status === 'authenticated' ? 'Map' : 'LoginScreen'}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {status === 'authenticated' ? (
        <Stack.Screen
          name="Map"
          component={MapScreen}
          options={{
            headerShown: false,
          }}
        />
      ) : (
        <Stack.Screen
          name="LoginScreen"
          component={LoginScreen}
          options={{
            headerShown: false,
          }}
        />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
