import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, radius, shadows, spacing } from '../theme';

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
  themeColor: string;
  bgTint: string;
}

// 4 Approved Themes from DESIGN.md Section 10 & Brand Board Reference
const RESCUE_CATEGORIES: RescueCategory[] = [
  {
    id: 'cat-1',
    title: 'Makanan Praktis',
    subtitle: 'Masak kilat < 15 menit saat waktu terbatas',
    badge: 'Cepat & Praktis',
    ingredients: ['telur', 'tomat', 'kecap manis'],
    icon: 'zap',
    themeColor: colors.primary,
    bgTint: colors.mintSoft,
  },
  {
    id: 'cat-2',
    title: 'Sisaan Makanan (Food Rescue)',
    subtitle: 'Selamatkan sisa nasi, tahu, dan sayuran sebelum layu',
    badge: 'Penyelamat Dapur',
    ingredients: ['nasi putih', 'bawang putih', 'telur', 'sayur'],
    icon: 'refresh-cw',
    themeColor: colors.orangeDark,
    bgTint: '#FFF7ED',
  },
  {
    id: 'cat-3',
    title: 'Resep Kreatif',
    subtitle: 'Padukan bumbu dasar dapur jadi kreasi rasa baru',
    badge: 'Kaya Rempah',
    ingredients: ['bawang bombay', 'cabai', 'telur', 'saus tiram'],
    icon: 'compass',
    themeColor: colors.success,
    bgTint: '#F0FDF4',
  },
  {
    id: 'cat-4',
    title: 'Lebih Sehat & Hemat',
    subtitle: 'Nutrisi seimbang ramah kantong dari stok dapur harian',
    badge: 'Hemat & Bernutrisi',
    ingredients: ['tahu', 'tempe', 'bawang merah', 'tomat'],
    icon: 'heart',
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
              onPress={() => onSelectCategoryIngredients(cat.ingredients)}
              activeOpacity={0.85}
            >
              <View style={[styles.categoryIconBox, { backgroundColor: cat.bgTint }]}>
                <Feather name={cat.icon} size={22} color={cat.themeColor} />
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
