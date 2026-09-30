import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { NomzLogo } from '../components/NomzLogo';
import { colors, radius, shadows, spacing } from '../theme';

interface AuthWelcomeScreenProps {
  onNavigateToLogin: () => void;
  onNavigateToRegister: () => void;
  onGoogleSignInSuccess?: () => void;
}

export function AuthWelcomeScreen({
  onNavigateToLogin,
  onNavigateToRegister,
  onGoogleSignInSuccess,
}: AuthWelcomeScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.screen,
        {
          paddingTop: Math.max(insets.top, 16) + 12,
          paddingBottom: Math.max(insets.bottom, 16) + 16,
        },
      ]}
    >
      <View style={styles.container}>
        {/* Brand & Hero Section with Official Nomz Logo */}
        <View style={styles.heroSection}>
          <NomzLogo size="lg" variant="full" showSubtitle={true} style={styles.logoStyle} />

          <Text style={styles.valuePropTitle}>
            Masak lezat dari bahan yang kamu miliki
          </Text>
          <Text style={styles.valuePropDesc}>
            Selamatkan isi kulkas dan kurangi sisa makanan. Temukan inspirasi resep
            seketika tanpa repot belanja.
          </Text>
        </View>

        {/* Action Buttons Section */}
        <View style={styles.actionSection}>
          {/* Primary Action: Daftar */}
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={onNavigateToRegister}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>Daftar Akun Baru</Text>
          </TouchableOpacity>

          {/* Secondary Action: Masuk */}
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={onNavigateToLogin}
            activeOpacity={0.75}
          >
            <Text style={styles.secondaryBtnText}>Masuk ke Akun Saya</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>atau</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Real Google Sign-In Button */}
          <GoogleSignInButton onSuccess={onGoogleSignInSuccess} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  heroSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  logoStyle: {
    marginBottom: 24,
  },
  valuePropTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 28,
  },
  valuePropDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 8,
    maxWidth: 320,
  },
  actionSection: {
    gap: 12,
    paddingBottom: 8,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    ...shadows.level1,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  secondaryBtnText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderSubtle,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    color: colors.textMuted,
  },
});
