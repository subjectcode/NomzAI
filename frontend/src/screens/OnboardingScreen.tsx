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
import { colors } from '../theme';
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
    badge: 'BEBAS SISA',
    icon: 'shield',
    title: 'Selamatkan bahanmu',
    description:
      'Manfaatkan bahan yang ada secara maksimal sebelum rusak atau kedaluwarsa. Kurangi sisa makanan dan lebih hemat.',
  },
  {
    id: 2,
    badge: 'INSPIRASI DAPUR',
    icon: 'book-open',
    title: 'Masak lebih cerdas',
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

  // Hanya Lewati atau Mulai yang menyimpan onboarding_completed
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
      {/* Top Header Bar: Brand di kiri, Lewati di kanan */}
      <View style={styles.headerBar}>
        <Text style={styles.brandTitle}>Nomz</Text>
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

      {/* Swipeable FlatList Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        decelerationRate="fast"
        onMomentumScrollEnd={handleMomentumScrollEnd}
        getItemLayout={(_, index) => ({
          length: screenWidth,
          offset: screenWidth * index,
          index,
        })}
        onScrollToIndexFailed={(info) => {
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
          }, 100);
        }}
        style={styles.flatList}
      />

      {/* Bottom Controls: Indicator + CTA */}
      <View style={styles.footerControls}>
        {/* Progress Indicator Dots */}
        <View style={styles.dotsWrap}>
          {SLIDES.map((item, idx) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => {
                flatListRef.current?.scrollToIndex({ index: idx, animated: true });
                setCurrentSlideIndex(idx);
              }}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.dot,
                  idx === currentSlideIndex ? styles.dotActive : styles.dotInactive,
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Action Button: Lanjut / Mulai */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={styles.actionBtnText}>
            {isLastSlide ? 'Mulai' : 'Lanjut'}
          </Text>
          <Feather
            name={isLastSlide ? 'check' : 'arrow-right'}
            size={18}
            color="#FFFFFF"
            style={{ marginLeft: 6 }}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
    paddingHorizontal: 24,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primaryDark,
    letterSpacing: -0.5,
  },
  skipText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  flatList: {
    flex: 1,
  },
  slideWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  slideCard: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleOuter: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#EFF3EF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconCircleInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E6E2',
  },
  badgeBox: {
    backgroundColor: '#EFF3EF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDark,
    letterSpacing: 0.6,
  },
  slideTitle: {
    fontSize: 23,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  slideDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  footerControls: {
    paddingHorizontal: 24,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  dotsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
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
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
