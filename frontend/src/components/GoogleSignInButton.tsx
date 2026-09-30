import React, { useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { promptGoogleSignIn } from '../services/googleAuth';
import { colors } from '../theme';

interface GoogleSignInButtonProps {
  disabled?: boolean;
  onError?: (message: string) => void;
  onSuccess?: () => void;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  disabled = false,
  onError,
  onSuccess,
}) => {
  const { loginWithGoogle } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePress = async () => {
    if (disabled || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // 1. Dapatkan real Google ID token melalui native Google Sign-In SDK
      const idToken = await promptGoogleSignIn();

      // Jika user membatalkan dialog akun Google (cancellation), tangani secara senyap
      if (!idToken) {
        setIsSubmitting(false);
        return;
      }

      // 2. Kirim ID token ke backend FastAPI (/api/auth/google) untuk diverifikasi
      await loginWithGoogle(idToken);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      const message =
        err.message || 'Gagal masuk dengan akun Google. Silakan coba lagi.';

      if (onError) {
        onError(message);
      } else {
        Alert.alert('Gagal Masuk', message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDisabled = disabled || isSubmitting;

  return (
    <TouchableOpacity
      style={[styles.googleBtn, isDisabled && styles.googleBtnDisabled]}
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel="Lanjutkan dengan Google"
    >
      {isSubmitting ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        <>
          <View style={styles.googleIconPlaceholder}>
            <Text style={styles.googleGLetter}>G</Text>
          </View>
          <Text style={styles.googleBtnText}>Lanjutkan dengan Google</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  googleBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  googleBtnDisabled: {
    opacity: 0.65,
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
