import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';

export function SplashScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 16),
          paddingBottom: Math.max(insets.bottom, 16),
        },
      ]}
    >
      <View style={styles.brandContainer}>
        <Text style={styles.brandTitle}>Nomz</Text>
        <Text style={styles.brandSubtitle}>AI Food Rescue Assistant</Text>
      </View>
      <View style={styles.indicatorContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandContainer: {
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 42,
    fontWeight: '700',
    color: colors.primaryDark,
    letterSpacing: -1,
  },
  brandSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 6,
    fontWeight: '500',
  },
  indicatorContainer: {
    marginTop: 36,
    height: 24,
    justifyContent: 'center',
  },
});
