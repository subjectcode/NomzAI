import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NomzLogo } from '../components/NomzLogo';
import { colors, radius, spacing } from '../theme';

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
        <NomzLogo size="lg" variant="full" showSubtitle={true} style={styles.logo} />
        {/* Brand Tagline per DESIGN.md Section 4 */}
        <Text style={styles.brandTagline}>Good Food Still Has a Chance.</Text>
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
  logo: {
    marginBottom: 16,
  },
  brandTagline: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
    fontStyle: 'italic',
    marginTop: 8,
  },
  indicatorContainer: {
    marginTop: 36,
    height: 24,
    justifyContent: 'center',
  },
});
