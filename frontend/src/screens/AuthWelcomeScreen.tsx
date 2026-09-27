import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme';

interface AuthWelcomeScreenProps {
  onNavigateToLogin: () => void;
  onNavigateToRegister: () => void;
  onGoogleSignIn?: () => void;
}

export function AuthWelcomeScreen({
  onNavigateToLogin,
  onNavigateToRegister,
  onGoogleSignIn,
}: AuthWelcomeScreenProps) {
  const insets = useSafeAreaInsets();

  // Handler terisolasi untuk Google Sign-In (akan dihubungkan ke OAuth nyata di M5.2E)
  const handleGooglePress = () => {
    if (onGoogleSignIn) {
      onGoogleSignIn();
      return;
    }
    // M5.2D: Jangan buat sesi palsu. Berikan feedback pengguna yang ramah.
    Alert.alert(
      'Masuk dengan Google',
      'Fitur masuk dengan akun Google akan segera tersedia pada pembaruan berikutnya.'
    );
  };

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
        {/* Brand & Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.logoBadge}>
            <Feather name="check" size={28} color={colors.primary} />
          </View>
          <Text style={styles.brandTitle}>Nomz</Text>
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

          {/* Prepared Google Sign-In Button (M5.2E isolation) */}
          <TouchableOpacity
            style={styles.googleBtn}
            onPress={handleGooglePress}
            activeOpacity={0.8}
          >
            <View style={styles.googleIconPlaceholder}>
              <Text style={styles.googleGLetter}>G</Text>
            </View>
            <Text style={styles.googleBtnText}>Lanjutkan dengan Google</Text>
          </TouchableOpacity>
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
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#EFF3EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  brandTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.primaryDark,
    letterSpacing: -0.5,
  },
  valuePropTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 25,
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
    paddingBottom: 4,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  secondaryBtnText: {
    color: colors.primaryDark,
    fontSize: 15,
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  googleBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIconPlaceholder: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EFF3EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  googleGLetter: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  googleBtnText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
});
