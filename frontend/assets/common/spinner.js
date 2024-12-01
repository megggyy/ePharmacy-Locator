import React, { useRef, useEffect } from 'react';
import {
  View,
  Image,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';

var { height } = Dimensions.get("window");

const PulseSpinner = () => {
  const scaleValue = useRef(new Animated.Value(1)).current; // Initial scale value

  useEffect(() => {
    const startPulseAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleValue, {
            toValue: 1.2, // Scale up
            duration: 500, // Half a second
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue, {
            toValue: 1, // Scale down
            duration: 5000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    startPulseAnimation();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('@/assets/images/spinnerLogo.png')} // Replace with your PNG path
        style={[
          styles.spinner,
          { transform: [{ scale: scaleValue }] },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  spinner: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
});

export default PulseSpinner;
