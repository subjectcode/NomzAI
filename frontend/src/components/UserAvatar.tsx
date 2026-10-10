import React from 'react';
import { StyleSheet, View, Text, Image, ViewStyle, StyleProp } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, radius, shadows } from '../theme';
import { User } from '../types';

interface UserAvatarProps {
  user: User | null;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export function UserAvatar({ user, size = 40, style }: UserAvatarProps) {
  const avatarUrl = user?.avatar_url || (user as any)?.avatarUrl || null;
  const displayName = user?.display_name || (user as any)?.displayName || '';
  const initial = displayName.trim().charAt(0).toUpperCase();

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  if (avatarUrl) {
    return (
      <View style={[styles.avatarBase, containerStyle, style]}>
        <Image
          source={{ uri: avatarUrl }}
          style={[styles.avatarImage, containerStyle]}
          resizeMode="cover"
        />
      </View>
    );
  }

  if (initial) {
    return (
      <View style={[styles.avatarBase, containerStyle, style]}>
        <Text style={[styles.initialText, { fontSize: Math.max(12, Math.round(size * 0.42)) }]}>
          {initial}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.avatarBase, containerStyle, style]}>
      <Feather name="user" size={Math.round(size * 0.45)} color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  avatarBase: {
    backgroundColor: colors.mintSoft,
    borderWidth: 1.5,
    borderColor: colors.lightMint,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...shadows.level1,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  initialText: {
    fontWeight: '700',
    color: colors.primary,
  },
});
