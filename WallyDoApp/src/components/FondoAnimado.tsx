// src/components/FondoAnimado.tsx
import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';


const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

const FondoAnimado = () => {
  const opacity = useSharedValue(0.8);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 4000 }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <AnimatedGradient
      colors={['#f3f6fc', '#eaf1fb']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[StyleSheet.absoluteFill, animatedStyle]}
    />
  );
};

export default FondoAnimado;
// cian a blanco '#dff6ff', '#ffffff'
// Degradado azul suave: '#f3f6fc', '#eaf1fb'