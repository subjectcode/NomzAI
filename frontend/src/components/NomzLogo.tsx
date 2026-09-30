import React from 'react';
import { StyleSheet, View, Text, ViewStyle } from 'react-native';
import { colors } from '../theme';

interface NomzLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'compact' | 'symbol';
  showSubtitle?: boolean;
  style?: ViewStyle;
}

/**
 * Nomz Official Brand Logo Component
 * Derived directly from Nomz_DESIGN.md Section 2 & Brand Board Reference
 * Features the abstract botanical / food-rescue leaf symbol + orange food dot.
 */
export const NomzLogo: React.FC<NomzLogoProps> = ({
  size = 'md',
  variant = 'compact',
  showSubtitle = false,
  style,
}) => {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  // Dimension scaling
  const iconScale = isSm ? 0.75 : isLg ? 1.35 : 1;
  const wordmarkSize = isSm ? 18 : isLg ? 28 : 22;
  const subtitleSize = isSm ? 8 : isLg ? 11 : 9;

  return (
    <View style={[styles.container, style]}>
      {/* Botanical Symbol Mark */}
      <View style={[styles.symbolWrapper, { transform: [{ scale: iconScale }] }]}>
        {/* Left flowing leaf */}
        <View style={styles.leftLeaf} />
        {/* Right upper leaf */}
        <View style={styles.rightLeaf} />
        {/* Warm food dot */}
        <View style={styles.foodDot} />
        {/* Lower flow foundation */}
        <View style={styles.bottomFlow} />
      </View>

      {/* Wordmark (if not symbol-only) */}
      {variant !== 'symbol' && (
        <View style={styles.textContainer}>
          <View style={styles.wordmarkRow}>
            <Text style={[styles.wordmarkN, { fontSize: wordmarkSize }]}>N</Text>
            {/* The 'o' with twin botanical leaves */}
            <View style={styles.oWrapper}>
              <View style={styles.leafCrown}>
                <View style={styles.crownLeafLeft} />
                <View style={styles.crownLeafRight} />
              </View>
              <Text style={[styles.wordmarkLetter, { fontSize: wordmarkSize }]}>o</Text>
            </View>
            <Text style={[styles.wordmarkLetter, { fontSize: wordmarkSize }]}>mz</Text>
          </View>

          {(variant === 'full' || showSubtitle) && (
            <Text style={[styles.subtitle, { fontSize: subtitleSize }]}>
              AI FOOD RESCUE ASSISTANT
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  symbolWrapper: {
    width: 32,
    height: 32,
    position: 'relative',
    marginRight: 8,
  },
  leftLeaf: {
    position: 'absolute',
    left: 2,
    top: 6,
    width: 15,
    height: 20,
    backgroundColor: colors.freshMint,
    borderTopLeftRadius: 16,
    borderBottomRightRadius: 16,
    borderBottomLeftRadius: 4,
    transform: [{ rotate: '-15deg' }],
  },
  rightLeaf: {
    position: 'absolute',
    right: 4,
    top: 2,
    width: 10,
    height: 14,
    backgroundColor: colors.primary,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 2,
    transform: [{ rotate: '20deg' }],
  },
  foodDot: {
    position: 'absolute',
    right: 1,
    top: 13,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.softOrange,
  },
  bottomFlow: {
    position: 'absolute',
    bottom: 2,
    left: 8,
    width: 16,
    height: 10,
    backgroundColor: colors.primaryDark,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderTopRightRadius: 8,
    transform: [{ rotate: '10deg' }],
    opacity: 0.9,
  },
  textContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  wordmarkN: {
    color: colors.primary,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  wordmarkLetter: {
    color: colors.primary,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  oWrapper: {
    position: 'relative',
    alignItems: 'center',
  },
  leafCrown: {
    position: 'absolute',
    top: -5,
    flexDirection: 'row',
    gap: 2,
  },
  crownLeafLeft: {
    width: 3.5,
    height: 5,
    backgroundColor: colors.freshMint,
    borderTopLeftRadius: 3,
    borderBottomRightRadius: 3,
    transform: [{ rotate: '-25deg' }],
  },
  crownLeafRight: {
    width: 3.5,
    height: 5,
    backgroundColor: colors.freshMint,
    borderTopRightRadius: 3,
    borderBottomLeftRadius: 3,
    transform: [{ rotate: '25deg' }],
  },
  subtitle: {
    color: colors.textMuted,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 1,
  },
});
