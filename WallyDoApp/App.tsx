import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import SplashScreen from './src/screens/SplashScreen';
import TareasScreen from './src/screens/TareasScreen';
import CrearTareaScreen from './src/screens/CrearTareaScreen';
import InteraccionScreen from './src/screens/InteraccionScreen';
import CalendarioScreen from './src/screens/CalendarioScreen';
import { TareasProvider } from './src/context/TareasContext';

const Stack = createStackNavigator();

const App = () => {
  return (
    <SafeAreaProvider>
      <TareasProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Tareas" component={TareasScreen} />
            <Stack.Screen name="Interaccion" component={InteraccionScreen} />
            <Stack.Screen name="Calendario" component={CalendarioScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </TareasProvider>
    </SafeAreaProvider>
  );
};
export default App;
