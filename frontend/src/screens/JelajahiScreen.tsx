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
import { colors } from '../theme';

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
  color: string;
}

const RESCUE_CATEGORIES: RescueCategory[] = [
  {
    id: 'cat-1',
    title: 'Kreasi Telur Rumahan',
    subtitle: 'Olah sisa telur jadi hidangan nikmat berprotein tinggi',
    badge: '3 Bahan Siap',
    ingredients: ['telur', 'daun bawang', 'bawang putih'],
    icon: 'sun',
    color: '#d97706',
  },
  {
    id: 'cat-2',
    title: 'Super Kilat (< 15 Menit)',
    subtitle: 'Masak praktis tanpa repot saat lapar mendadak',
    badge: 'Cepat & Praktis',
    ingredients: ['telur', 'tomat', 'kecap manis'],
    icon: 'zap',
    color: colors.primary,
  },
  {
    id: 'cat-3',
    title: 'Serba Tahu & Tempe Hemat',
    subtitle: 'Makanan harian ramah kantong penuh gizi dan bumbu rempah',
    badge: 'Hemat Akhir Bulan',
    ingredients: ['tahu', 'tempe', 'bawang merah', 'kecap'],
    icon: 'box',
    color: '#16a34a',
  },
  {
    id: 'cat-4',
    title: 'Sayur Segar Sisa Kulkas',
    subtitle: 'Selamatkan sayur layu sebelum membusuk di rak kulkas',
    badge: 'Food Rescue',
    ingredients: ['wortel', 'bayam', 'bawang putih'],
    icon: 'shield',
    color: '#0284c7',
  },
  {
    id: 'cat-5',
    title: 'Tumisan Rumahan Sederhana',
    subtitle: 'Cukup iris, tumis, dan hidangkan hangat dengan nasi',
    badge: 'Mudah Dimasak',
    ingredients: ['bawang bombay', 'cabai merah', 'telur', 'saus tiram'],
    icon: 'feather',
    color: '#9333ea',
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
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.brandWrap}>
          <Text style={styles.topBarTitle}>Jelajahi Resep</Text>
          <Text style={styles.topBarSubtitle}>Inspirasi Food Rescue Dapur Rumah</Text>
        </View>
        <TouchableOpacity style={styles.scanQuickBtn} onPress={onStartScan} activeOpacity={0.8}>
          <Feather name="camera" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Search Input Bar */}
        <View style={styles.searchBar}>
          <Feather name="search" size={17} color={colors.textSecondary} style={{ marginRight: 10 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari ide olahan (misal: telur, tahu, tumis)..."
            placeholderTextColor="#a8a29e"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Hero Card Banner */}
        <View style={styles.bannerCard}>
          <View style={styles.bannerBadge}>
            <Text style={styles.bannerBadgeText}>TIPS FOOD RESCUE</Text>
          </View>
          <Text style={styles.bannerTitle}>Gunakan Apa yang Tersedia</Text>
          <Text style={styles.bannerDesc}>
            Pilih kategori olahan di bawah ini untuk langsung meracik resep AI
            berdasarkan kombinasi bahan yang biasa ada di rumah.
          </Text>
        </View>

        {/* Section List */}
        <Text style={styles.sectionHeading}>Kategori Penyelamat Bahan</Text>

        <View style={styles.categoryList}>
          {filtered.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryCard}
              onPress={() => onSelectCategoryIngredients(cat.ingredients)}
              activeOpacity={0.85}
            >
              <View style={styles.catHeader}>
                <View style={[styles.catIconWrap, { backgroundColor: '#EFF3EF' }]}>
                  <Feather name={cat.icon} size={20} color={cat.color} />
                </View>
                <View style={styles.catBadge}>
                  <Text style={styles.catBadgeText}>{cat.badge}</Text>
                </View>
              </View>

              <Text style={styles.catTitle}>{cat.title}</Text>
              <Text style={styles.catSubtitle}>{cat.subtitle}</Text>

              {/* Tag Bahan */}
              <View style={styles.tagWrap}>
                {cat.ingredients.map((ing, idx) => (
                  <View key={idx} style={styles.ingPill}>
                    <Text style={styles.ingPillText}>{ing}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.catFooter}>
                <Text style={styles.catFooterText}>Racik Resep AI</Text>
                <Feather name="arrow-right" size={14} color={colors.primary} />
              </View>
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
    backgroundColor: '#FAF8F3',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E7E5DE',
  },
  brandWrap: {
    flex: 1,
  },
  topBarTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  topBarSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scanQuickBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E7E5DE',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
  },
  bannerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7E5DE',
    padding: 18,
    marginBottom: 20,
  },
  bannerBadge: {
    backgroundColor: '#EFF3EF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  bannerBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primaryDark,
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
    lineHeight: 19,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  categoryList: {
    gap: 14,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E7E5DE',
    padding: 16,
  },
  catHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  catIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catBadge: {
    backgroundColor: '#FAF8F3',
    borderWidth: 1,
    borderColor: '#E7E5DE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  catBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  catTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  catSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
    marginBottom: 12,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  ingPill: {
    backgroundColor: '#EFF3EF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ingPillText: {
    fontSize: 11,
    color: colors.primaryDark,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  catFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#FAF8F3',
    paddingTop: 10,
  },
  catFooterText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginRight: 4,
  },
});
