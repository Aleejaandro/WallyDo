import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';

const SplashScreen = ({ navigation }: any) => {
  useEffect(() => {
    const timeout = setTimeout(() => {
      navigation.replace('Tareas'); // reemplaza para no volver con el botón atrás
    }, 2500); // ⏱️ 2.5 segundos

    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/LOGO_NEGRO.png')} // asegúrate que esté bien ubicado
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 140,
    height: 140,
  },
});

export default SplashScreen;
