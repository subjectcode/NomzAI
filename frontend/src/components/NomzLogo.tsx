import React from 'react';
import { StyleSheet, View, Image, ViewStyle, ImageStyle } from 'react-native';

const LOGO_FULL = require('../../assets/brand/logo/nomz-logo-primary-transparent.png');
const LOGO_COMPACT = require('../../assets/brand/logo/nomz-logo-compact-transparent.png');
const LOGO_MARK = require('../../assets/brand/logo/nomz-mark-transparent.png');

export interface NomzLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'compact' | 'symbol';
  showSubtitle?: boolean;
  style?: ViewStyle;
  imageStyle?: ImageStyle;
}

/**
 * Nomz Official Brand Logo Component
 * Uses authoritative assets from Nomz_Brand_Assets
 * Full: Nömz wordmark with official "AI Food Rescue Assistant" tagline
 * Compact: Nömz wordmark with botanical 'o' and orange food dot
 * Symbol: Isolated botanical leaf food rescue mark
 */
export const NomzLogo: React.FC<NomzLogoProps> = ({
  size = 'md',
  variant = 'compact',
  showSubtitle = false,
  style,
  imageStyle,
}) => {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  // Use full logo if explicitly requested or showSubtitle is enabled
  const isFull = variant === 'full' || (showSubtitle && variant !== 'symbol');
  const isSymbol = variant === 'symbol';

  // Dimensions preserving official asset aspect ratios
  // Full logo ratio: 490 / 220 = 2.227
  // Compact wordmark ratio: 418 / 150 = 2.787
  // Symbol mark ratio: 160 / 165 = 0.97
  let imageSource = LOGO_COMPACT;
  let imgWidth = isSm ? 76 : isLg ? 168 : 106;
  let imgHeight = isSm ? 27 : isLg ? 60 : 38;

  if (isSymbol) {
    imageSource = LOGO_MARK;
    imgWidth = isSm ? 28 : isLg ? 64 : 38;
    imgHeight = isSm ? 29 : isLg ? 66 : 39;
  } else if (isFull) {
    imageSource = LOGO_FULL;
    imgWidth = isSm ? 76 : isLg ? 168 : 112;
    imgHeight = isSm ? 34 : isLg ? 75 : 50;
  }

  return (
    <View style={[styles.container, style]}>
      <Image
        source={imageSource}
        style={[
          {
            width: imgWidth,
            height: imgHeight,
          },
          imageStyle,
        ]}
        resizeMode="contain"
        accessibilityRole="image"
        accessibilityLabel="Nomz Brand Logo"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
