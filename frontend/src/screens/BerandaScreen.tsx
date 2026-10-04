import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, radius, shadows, spacing } from '../theme';
import { NomzLogo } from '../components/NomzLogo';
import { RecipeRecommendation } from '../types';
import { getCookingHistory, HistoryItem, getImpactStats, ImpactStats } from '../services/historyStorage';
import { getPantryItems, PantryItem } from '../services/pantryStorage';
import { useAuth } from '../context';

interface BerandaScreenProps {
  onStartScan: () => void;
  onOpenProfile?: () => void;
  onOpenPantry?: () => void;
  onOpenExplore?: () => void;
  onSelectRecipe?: (recipe: RecipeRecommendation) => void;
}

// Resep Populer Ramah Kulkas (Default Curated Recipes)
const POPULAR_RESCUE_RECIPES: RecipeRecommendation[] = [
  {
    id: 'pop-1',
    nama: 'Nasi Goreng Sayur Rumahan',
    deskripsi: 'Memanfaatkan sisa nasi kemarin dan sayuran kulkas sebelum layu.',
    alasan: 'Memanfaatkan sisa nasi kemarin dan sayuran kulkas sebelum layu.',
    estimasi_waktu: '15 menit',
    tingkat_kesulitan: 'Mudah',
    porsi: '2 porsi',
    alasan_rekomendasi: 'Memanfaatkan sisa nasi kemarin dan sayuran kulkas sebelum layu.',
    bahan_tersedia: ['Nasi putih', 'Bawang putih', 'Telur', 'Bayam'],
    bahan_tambahan: ['Kecap manis', 'Minyak goreng', 'Garam', 'Merica'],
    langkah: [
      'Panaskan 1 sendok makan minyak goreng di wajan.',
      'Tumis irisan bawang putih hingga harum dan keemasan.',
      'Masukkan telur, orak-arik hingga setengah matang.',
      'Tambahkan sisa nasi putih dan sayur bayam, aduk merata.',
      'Beri kecap manis, garam, dan lada. Masak 3 menit dan sajikan hangat.',
    ],
  },
  {
    id: 'pop-2',
    nama: 'Tumis Tahu Brokoli Bawang',
    deskripsi: 'Kombinasi kaya protein nabati dan serat, sangat cepat dimasak.',
    alasan: 'Kombinasi kaya protein nabati dan serat, sangat cepat dimasak.',
    estimasi_waktu: '20 menit',
    tingkat_kesulitan: 'Mudah',
    porsi: '2 porsi',
    alasan_rekomendasi: 'Kombinasi kaya protein nabati dan serat, sangat cepat dimasak.',
    bahan_tersedia: ['Tahu putih', 'Bawang putih', 'Tomat'],
    bahan_tambahan: ['Saus tiram', 'Minyak wijen', 'Garam'],
    langkah: [
      'Potong tahu dadu kecil, goreng sebentar hingga berkulit.',
      'Tumis bawang putih cincang hingga harum.',
      'Masukkan tahu dan potongan tomat.',
      'Beri saus tiram dan sedikit air, masak hingga bumbu meresap 5 menit.',
    ],
  },
  {
    id: 'pop-3',
    nama: 'Omelet Tomat Bayam Segar',
    deskripsi: 'Sarapan praktis yang menyelamatkan telur dan tomat sebelum lunak.',
    alasan: 'Sarapan praktis yang menyelamatkan telur dan tomat sebelum lunak.',
    estimasi_waktu: '10 menit',
    tingkat_kesulitan: 'Mudah',
    porsi: '1-2 porsi',
    alasan_rekomendasi: 'Sarapan praktis yang menyelamatkan telur dan tomat sebelum lunak.',
    bahan_tersedia: ['Telur', 'Tomat', 'Bayam'],
    bahan_tambahan: ['Mentega atau minyak', 'Garam', 'Lada bubuk'],
    langkah: [
      'Kocok lepas telur bersama garam dan lada.',
      'Cincang kasar bayam dan potong dadu tomat.',
      'Panaskan mentega di teflon, tuang telur dan taburkan bayam serta tomat.',
      'Lipat menjadi dua saat bagian bawah mulai kecokelatan. Angkat dan sajikan.',
    ],
  },
];

export function BerandaScreen({
  onStartScan,
  onOpenProfile,
  onOpenPantry,
  onOpenExplore,
  onSelectRecipe,
}: BerandaScreenProps) {
  const { user } = useAuth();
  const [recentHistory, setRecentHistory] = useState<HistoryItem[]>([]);
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [impact, setImpact] = useState<ImpactStats>({
    ingredientsRescued: 0,
    recipesCooked: 0,
    mealsSaved: 0,
  });

  useEffect(() => {
    getCookingHistory(user?.id).then((list) => setRecentHistory(list.slice(0, 3)));
    getImpactStats(user?.id).then(setImpact);
    getPantryItems(user?.id).then(setPantryItems);
  }, [user?.id]);

  // Filter bahan dapur yang ditandai "Gunakan Dulu"
  const urgentIngredients = pantryItems.filter((i) => i.useFirst);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. TOP HEADER: Nomz Brand & User Actions */}
      <View style={styles.topHeader}>
        <NomzLogo size="sm" variant="compact" />

        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={styles.iconCircleButton}
            onPress={onOpenPantry}
            activeOpacity={0.7}
            accessibilityLabel="Notifikasi & Dapur"
          >
            <Feather name="bell" size={19} color={colors.textSecondary} />
            {urgentIngredients.length > 0 && <View style={styles.bellBadge} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.profileAvatar}
            onPress={onOpenProfile}
            activeOpacity={0.7}
            accessibilityLabel="Profil Pengguna"
          >
            <Feather name="user" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. NATURAL HEADLINE (DESIGN.md Section 1 & Reference UI) */}
      <View style={styles.headlineSection}>
        <Text style={styles.mainHeadline}>Masak Enak dari yang Ada Saja.</Text>
      </View>

      {/* 3. SOFT CAPSULE SEARCH (DESIGN.md Section 20 & Reference UI) */}
      <TouchableOpacity
        style={styles.searchCapsule}
        onPress={onStartScan}
        activeOpacity={0.8}
        accessibilityRole="search"
      >
        <Feather name="camera" size={18} color={colors.primary} style={{ marginRight: 10 }} />
        <Text style={styles.searchPlaceholder}>Pindai bahan atau cari resep...</Text>
        <View style={styles.searchArrow}>
          <Feather name="arrow-right" size={16} color={colors.primary} />
        </View>
      </TouchableOpacity>

      {/* 4. SECTION: MULAI DARI SINI (Reference UI Screen 1) */}
      <View style={styles.sectionWrap}>
        <Text style={styles.sectionTitle}>Mulai dari sini</Text>
        <View style={styles.actionGridRow}>
          {/* Card 1: Scan Bahan (Primary) */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={onStartScan}
            activeOpacity={0.85}
          >
            <View style={[styles.actionIconBox, { backgroundColor: colors.mintSoft }]}>
              <Feather name="camera" size={22} color={colors.primary} />
            </View>
            <Text style={styles.actionCardTitle}>Scan Bahan</Text>
            <Text style={styles.actionCardDesc}>Deteksi otomatis dari foto dapur</Text>
          </TouchableOpacity>

          {/* Card 2: Resep dari Sisa (Pantry / Leftover Rescue) */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={onOpenPantry}
            activeOpacity={0.85}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#FFF7ED' }]}>
              <Feather name="refresh-cw" size={20} color={colors.orangeDark} />
            </View>
            <Text style={styles.actionCardTitle}>Resep dari Sisa</Text>
            <Text style={styles.actionCardDesc}>Gunakan bahan yang ada di kulkas</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 5. URGENT PANTRY INGREDIENTS BANNER (DESIGN.md Section 32) */}
      {urgentIngredients.length > 0 && (
        <View style={styles.urgentBanner}>
          <View style={styles.urgentHeader}>
            <View style={styles.urgentTag}>
              <Feather name="clock" size={12} color={colors.orangeDark} style={{ marginRight: 4 }} />
              <Text style={styles.urgentTagText}>Gunakan Dulu</Text>
            </View>
            <Text style={styles.urgentNoticeTitle}>
              {urgentIngredients.length} bahan perlu dimasak segera:
            </Text>
          </View>
          <View style={styles.urgentChipRow}>
            {urgentIngredients.slice(0, 4).map((item) => (
              <View key={item.id} style={styles.urgentIngredientChip}>
                <Text style={styles.urgentChipText}>{item.name}</Text>
                {item.quantity ? <Text style={styles.urgentChipQty}>({item.quantity})</Text> : null}
              </View>
            ))}
          </View>
          <TouchableOpacity
            style={styles.urgentCta}
            onPress={onOpenPantry}
            activeOpacity={0.8}
          >
            <Text style={styles.urgentCtaText}>Buka Dapur Saya</Text>
            <Feather name="chevron-right" size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>
      )}

      {/* 6. SECTION: RESEP POPULER (Reference UI Screen 1) */}
      <View style={styles.sectionWrap}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Resep Rekomendasi</Text>
          <TouchableOpacity onPress={onOpenExplore} activeOpacity={0.7}>
            <Text style={styles.seeAllText}>Lihat semua</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.popularList}>
          {POPULAR_RESCUE_RECIPES.map((recipe) => (
            <TouchableOpacity
              key={recipe.id}
              style={styles.recipeCard}
              onPress={() => onSelectRecipe?.(recipe)}
              activeOpacity={0.85}
            >
              {/* Recipe Illustration / Thumbnail Placeholder with soft kitchen tone */}
              <View style={styles.recipeThumbBox}>
                <Feather name="book-open" size={24} color={colors.primary} />
                <View style={styles.recipeBadgePill}>
                  <Text style={styles.recipeBadgeText}>{recipe.estimasi_waktu}</Text>
                </View>
              </View>

              {/* Recipe Content */}
              <View style={styles.recipeInfoBox}>
                <Text style={styles.recipeTitle} numberOfLines={1}>
                  {recipe.nama}
                </Text>
                <Text style={styles.recipeDesc} numberOfLines={2}>
                  {recipe.alasan_rekomendasi}
                </Text>
                <View style={styles.recipeMetaRow}>
                  <View style={styles.metaPill}>
                    <Feather name="check" size={11} color={colors.success} style={{ marginRight: 3 }} />
                    <Text style={styles.metaPillText}>
                      {recipe.bahan_tersedia.length} bahan ada
                    </Text>
                  </View>
                  <Text style={styles.metaDot}>•</Text>
                  <Text style={styles.metaDifficulty}>{recipe.tingkat_kesulitan}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 7. REAL FOOD RESCUE IMPACT (DESIGN.md Section 35 — Honest Data) */}
      {impact.recipesCooked > 0 && (
        <View style={styles.impactCard}>
          <View style={styles.impactCardHeader}>
            <Feather name="award" size={16} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.impactCardTitle}>Dampak Penyelamatan Pangan Kamu</Text>
          </View>
          <View style={styles.impactRow}>
            <View style={styles.impactCol}>
              <Text style={styles.impactNum}>{impact.ingredientsRescued}</Text>
              <Text style={styles.impactLabel}>Bahan Diselamatkan</Text>
            </View>
            <View style={styles.impactDivider} />
            <View style={styles.impactCol}>
              <Text style={styles.impactNum}>{impact.recipesCooked}</Text>
              <Text style={styles.impactLabel}>Masakan Selesai</Text>
            </View>
            <View style={styles.impactDivider} />
            <View style={styles.impactCol}>
              <Text style={styles.impactNum}>{impact.mealsSaved}</Text>
              <Text style={styles.impactLabel}>Santapan Tercipta</Text>
            </View>
          </View>
        </View>
      )}

      {/* 8. RIWAYAT MEMASAK TERAKHIR */}
      {recentHistory.length > 0 && (
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionTitle}>Terakhir Dimasak</Text>
          {recentHistory.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.recentHistoryCard}
              onPress={() => onSelectRecipe?.(item.recipe)}
              activeOpacity={0.8}
            >
              <View style={styles.recentIconBox}>
                <Feather name="check-circle" size={18} color={colors.success} />
              </View>
              <View style={styles.recentTextBox}>
                <Text style={styles.recentName}>{item.recipe.nama}</Text>
                <Text style={styles.recentDate}>
                  {item.formattedDate} • {item.recipe.estimasi_waktu}
                </Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    marginBottom: 16,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircleButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...shadows.level1,
  },
  bellBadge: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.orangeDark,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.mintSoft,
    borderWidth: 1.5,
    borderColor: colors.lightMint,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.level1,
  },
  headlineSection: {
    marginBottom: 16,
  },
  mainHeadline: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 34,
    letterSpacing: -0.3,
  },
  searchCapsule: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingVertical: 12,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    ...shadows.level1,
    minHeight: 48,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '500',
  },
  searchArrow: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.mintSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionWrap: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  actionGridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    ...shadows.level1,
  },
  actionIconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  actionCardDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  urgentBanner: {
    backgroundColor: '#FFFBEB',
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.warmYellow,
    marginBottom: 24,
    ...shadows.level1,
  },
  urgentHeader: {
    marginBottom: 10,
  },
  urgentTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  urgentTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.orangeDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  urgentNoticeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  urgentChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  urgentIngredientChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.warmYellow,
  },
  urgentChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  urgentChipQty: {
    fontSize: 11,
    color: colors.textMuted,
    marginLeft: 4,
  },
  urgentCta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
  },
  urgentCtaText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  popularList: {
    gap: 12,
  },
  recipeCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.level1,
  },
  recipeThumbBox: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
    backgroundColor: colors.mintSoft,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginRight: 14,
  },
  recipeBadgePill: {
    position: 'absolute',
    bottom: 4,
    backgroundColor: 'rgba(15, 118, 110, 0.85)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: radius.xs,
  },
  recipeBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  recipeInfoBox: {
    flex: 1,
  },
  recipeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 3,
  },
  recipeDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
    marginBottom: 6,
  },
  recipeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: radius.full,
  },
  metaPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.success,
  },
  metaDot: {
    marginHorizontal: 6,
    color: colors.textMuted,
    fontSize: 12,
  },
  metaDifficulty: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  impactCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: 24,
    ...shadows.level1,
  },
  impactCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  impactCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  impactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  impactCol: {
    alignItems: 'center',
  },
  impactNum: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  impactLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  impactDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.borderSubtle,
  },
  recentHistoryCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    ...shadows.level1,
  },
  recentIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  recentTextBox: {
    flex: 1,
  },
  recentName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  recentDate: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
});
