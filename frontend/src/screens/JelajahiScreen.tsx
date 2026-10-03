import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, radius, shadows, spacing } from '../theme';

const ILLUST_MAKANAN_INSTANT = require('../../assets/brand/illustrations/makanan-instant-icon.png');
const ILLUST_SISAAN_MAKANAN = require('../../assets/brand/illustrations/sisaan-makanan-icon.png');
const ILLUST_RESEP_KREATIF = require('../../assets/brand/illustrations/resep-kreatif-icon.png');
const ILLUST_LEBIH_SEHAT = require('../../assets/brand/illustrations/lebih-sehat-dan-hemat-icon.png');

interface JelajahiScreenProps {
  onSelectCategoryIngredients: (ingredients: string[]) => void;
  onStartScan: () => void;
}

interface RescueCategory {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  ingredients: string[];
  icon: keyof typeof Feather.glyphMap;
  illustration: any;
  themeColor: string;
  bgTint: string;
}

/**
 * Memastikan setiap bahan memiliki takaran dan unit standar dapur yang masuk akal
 * sesuai model bahan Nomz (contoh: '2 butir telur', '1 buah tomat').
 */
export function formatPresetIngredientWithDefault(raw: string): string {
  const trimmed = raw.trim();
  // Jika sudah memiliki angka di awal (misal: "2 butir telur"), pertahankan
  if (/^\d/.test(trimmed)) {
    return trimmed;
  }

  const lower = trimmed.toLowerCase();
  if (lower.includes('telur')) return '2 butir telur';
  if (lower.includes('tomat')) return '1 buah tomat';
  if (lower.includes('bawang putih')) return '3 siung bawang putih';
  if (lower.includes('bawang merah')) return '4 butir bawang merah';
  if (lower.includes('bawang bombay')) return '1 buah bawang bombay';
  if (lower.includes('nasi')) return '1 piring nasi putih';
  if (lower.includes('sayur') || lower.includes('bayam') || lower.includes('kangkung')) return '1 ikat sayur';
  if (lower.includes('tahu')) return '2 kotak tahu';
  if (lower.includes('tempe')) return '1 papan tempe';
  if (lower.includes('cabai') || lower.includes('cabe')) return '5 buah cabai';
  if (lower.includes('kecap')) return '2 sdm kecap manis';
  if (lower.includes('saus tiram')) return '1 sdm saus tiram';
  if (lower.includes('wortel')) return '1 buah wortel';
  if (lower.includes('ayam')) return '150 g daging ayam';
  if (lower.includes('daging')) return '150 g daging sapi';
  if (lower.includes('ikan')) return '1 ekor ikan';

  return `1 porsi ${trimmed}`;
}

// 4 Approved Themes from DESIGN.md Section 10 & Brand Board Reference
const RESCUE_CATEGORIES: RescueCategory[] = [
  {
    id: 'cat-1',
    title: 'Makanan Instant',
    subtitle: 'Masak kilat < 15 menit saat waktu terbatas',
    badge: 'Cepat & Praktis',
    ingredients: ['2 butir telur', '1 buah tomat', '2 sdm kecap manis'],
    icon: 'zap',
    illustration: ILLUST_MAKANAN_INSTANT,
    themeColor: colors.primary,
    bgTint: colors.mintSoft,
  },
  {
    id: 'cat-2',
    title: 'Sisaan Makanan',
    subtitle: 'Selamatkan sisa nasi, tahu, dan sayuran sebelum layu',
    badge: 'Penyelamat Dapur',
    ingredients: ['1 piring nasi putih', '3 siung bawang putih', '2 butir telur', '1 ikat sayur'],
    icon: 'refresh-cw',
    illustration: ILLUST_SISAAN_MAKANAN,
    themeColor: colors.orangeDark,
    bgTint: '#FFF7ED',
  },
  {
    id: 'cat-3',
    title: 'Resep Kreatif',
    subtitle: 'Padukan bumbu dasar dapur jadi kreasi rasa baru',
    badge: 'Kaya Rempah',
    ingredients: ['1 buah bawang bombay', '5 buah cabai', '2 butir telur', '1 sdm saus tiram'],
    icon: 'compass',
    illustration: ILLUST_RESEP_KREATIF,
    themeColor: colors.success,
    bgTint: '#F0FDF4',
  },
  {
    id: 'cat-4',
    title: 'Lebih Sehat & Hemat',
    subtitle: 'Nutrisi seimbang ramah kantong dari stok dapur harian',
    badge: 'Hemat & Bernutrisi',
    ingredients: ['2 kotak tahu', '1 papan tempe', '4 butir bawang merah', '1 buah tomat'],
    icon: 'heart',
    illustration: ILLUST_LEBIH_SEHAT,
    themeColor: '#0284C7',
    bgTint: '#F0F9FF',
  },
];

export function JelajahiScreen({
  onSelectCategoryIngredients,
  onStartScan,
}: JelajahiScreenProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filtered = RESCUE_CATEGORIES.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.ingredients.some((ing) => ing.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <View style={styles.container}>
      {/* 1. TOP BAR */}
      <View style={styles.topBar}>
        <View style={styles.brandWrap}>
          <Text style={styles.topBarTitle}>Jelajahi Inspirasi</Text>
          <Text style={styles.topBarSubtitle}>Ide masakan dari bahan yang ada</Text>
        </View>
        <TouchableOpacity style={styles.scanQuickBtn} onPress={onStartScan} activeOpacity={0.8}>
          <Feather name="camera" size={17} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. SOFT CAPSULE SEARCH */}
        <View style={styles.searchCapsule}>
          <Feather name="search" size={18} color={colors.primary} style={{ marginRight: 10 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari ide olahan (telur, tahu, sayur)..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* 3. HERO PHILOSOPHY BANNER (DESIGN.md Section 10) */}
        <View style={styles.bannerCard}>
          <View style={styles.bannerBadge}>
            <Text style={styles.bannerBadgeText}>KULINER BIJAK</Text>
          </View>
          <Text style={styles.bannerTitle}>Bahan yang Ada Masih Bisa Jadi Enak</Text>
          <Text style={styles.bannerDesc}>
            Pilih salah satu tema olahan di bawah untuk menemukan resep teruji yang
            memaksimalkan bahan-bahan yang umum tersisa di rumah.
          </Text>
        </View>

        {/* 4. SECTION: KATEGORI TEMA RESCUE */}
        <Text style={styles.sectionHeading}>Tema Penyelamat Bahan</Text>

        <View style={styles.categoryList}>
          {filtered.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryCard}
              onPress={() => onSelectCategoryIngredients(cat.ingredients.map(formatPresetIngredientWithDefault))}
              activeOpacity={0.85}
            >
              <View style={[styles.categoryIconBox, { backgroundColor: cat.bgTint }]}>
                {cat.illustration ? (
                  <Image
                    source={cat.illustration}
                    style={styles.categoryIllustration}
                    resizeMode="contain"
                    accessibilityLabel={cat.title}
                  />
                ) : (
                  <Feather name={cat.icon} size={22} color={cat.themeColor} />
                )}
              </View>

              <View style={styles.categoryContent}>
                <View style={styles.categoryTopRow}>
                  <Text style={styles.categoryTitle}>{cat.title}</Text>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{cat.badge}</Text>
                  </View>
                </View>

                <Text style={styles.categorySubtitle}>{cat.subtitle}</Text>

                <View style={styles.ingredientsRow}>
                  <Text style={styles.ingredientsLabel}>Contoh bahan: </Text>
                  <Text style={styles.ingredientsValue}>{cat.ingredients.join(', ')}</Text>
                </View>
              </View>

              <Feather name="chevron-right" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  brandWrap: {
    flex: 1,
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  topBarSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 1,
  },
  scanQuickBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.level1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  searchCapsule: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingVertical: 11,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    ...shadows.level1,
    minHeight: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
  },
  bannerCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: 20,
    ...shadows.level1,
  },
  bannerBadge: {
    backgroundColor: colors.mintSoft,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radius.xs,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  bannerBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  bannerDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  categoryList: {
    gap: 12,
  },
  categoryCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.level1,
  },
  categoryIconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  categoryIllustration: {
    width: 38,
    height: 38,
    borderRadius: radius.xs,
  },
  categoryContent: {
    flex: 1,
    marginRight: 8,
  },
  categoryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  categoryBadge: {
    backgroundColor: colors.background,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  categorySubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
    marginBottom: 4,
  },
  ingredientsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  ingredientsLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  ingredientsValue: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
});
