import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import SignScreen from '../screens/SignScreen';
import WebScreen from '../screens/WebScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const appTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
  },
};

const AppNavigator: React.FC = () => (
  <NavigationContainer theme={appTheme}>
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Sign" component={SignScreen} />
      <Stack.Screen name="Web" component={WebScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;
