import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { NomzLogo } from '../components/NomzLogo';
import { colors, radius, shadows, spacing } from '../theme';
import { setOnboardingCompleted } from '../services/onboardingStorage';

interface OnboardingScreenProps {
  onComplete: () => void;
}

interface SlideItem {
  id: number;
  badge: string;
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
}

const SLIDES: SlideItem[] = [
  {
    id: 0,
    badge: 'FOTO & DETEKSI',
    icon: 'camera',
    title: 'Lihat apa yang kamu punya',
    description:
      'Foto bahan makanan di kulkas atau meja dapurmu. Nomz akan mengenali bahan secara otomatis tanpa perlu dicatat manual.',
  },
  {
    id: 1,
    badge: 'FOOD RESCUE',
    icon: 'refresh-cw',
    title: 'Selamatkan bahanmu',
    description:
      'Manfaatkan bahan yang ada secara maksimal sebelum rusak atau kedaluwarsa. Kurangi sisa makanan dan lebih hemat.',
  },
  {
    id: 2,
    badge: 'INSPIRASI MASAK',
    icon: 'book-open',
    title: 'Masak enak dari yang ada',
    description:
      'Temukan ide masakan lezat dan kreatif yang menyesuaikan bahan yang tersedia, tanpa harus belanja bahan baru.',
  },
];

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const flatListRef = useRef<FlatList<SlideItem>>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);

  const isLastSlide = currentSlideIndex === SLIDES.length - 1;

  const handleFinish = async () => {
    await setOnboardingCompleted(true);
    onComplete();
  };

  const handleNext = () => {
    if (currentSlideIndex < SLIDES.length - 1) {
      const nextIndex = currentSlideIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentSlideIndex(nextIndex);
    } else {
      handleFinish();
    }
  };

  const handleSkip = () => {
    handleFinish();
  };

  const handleMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / screenWidth);
    if (newIndex >= 0 && newIndex < SLIDES.length) {
      setCurrentSlideIndex(newIndex);
    }
  };

  const renderSlide = ({ item }: { item: SlideItem }) => {
    return (
      <View style={[styles.slideWrap, { width: screenWidth }]}>
        <View style={styles.slideCard}>
          {/* Visual Icon Box */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircleOuter}>
              <View style={styles.iconCircleInner}>
                <Feather name={item.icon} size={36} color={colors.primary} />
              </View>
            </View>
          </View>

          {/* Badge & Text */}
          <View style={styles.badgeBox}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>

          <Text style={styles.slideTitle}>{item.title}</Text>
          <Text style={styles.slideDesc}>{item.description}</Text>
        </View>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.screen,
        {
          paddingTop: Math.max(insets.top, 16) + 8,
          paddingBottom: Math.max(insets.bottom, 16) + 16,
        },
      ]}
    >
      {/* Top Header Bar with NomzLogo */}
      <View style={styles.headerBar}>
        <NomzLogo size="sm" variant="compact" />
        {!isLastSlide ? (
          <TouchableOpacity
            onPress={handleSkip}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
          >
            <Text style={styles.skipText}>Lewati</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 44 }} />
        )}
      </View>

      {/* Swipeable Slide Carousel */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        bounces={false}
        style={styles.carousel}
      />

      {/* Footer Navigation: Dots & Next/Start CTA */}
      <View style={styles.footerContainer}>
        {/* Pagination Dots */}
        <View style={styles.paginationRow}>
          {SLIDES.map((slide) => {
            const isActive = slide.id === currentSlideIndex;
            return (
              <View
                key={slide.id}
                style={[styles.dot, isActive ? styles.dotActive : styles.dotInactive]}
              />
            );
          })}
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={handleNext}
          activeOpacity={0.88}
        >
          <Text style={styles.actionBtnText}>
            {isLastSlide ? 'Mulai Sekarang' : 'Lanjutkan'}
          </Text>
          <Feather
            name={isLastSlide ? 'check' : 'arrow-right'}
            size={18}
            color="#FFFFFF"
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    height: 48,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  carousel: {
    flexGrow: 1,
  },
  slideWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  slideCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    ...shadows.level1,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconCircleOuter: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.mintSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.level1,
  },
  badgeBox: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.8,
  },
  slideTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  slideDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
  },
  footerContainer: {
    paddingHorizontal: 24,
    paddingBottom: 8,
    gap: 20,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
  dotInactive: {
    width: 8,
    backgroundColor: colors.border,
  },
  actionBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    ...shadows.level1,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
