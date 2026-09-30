import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, radius, shadows, spacing } from '../theme';
import {
  HistoryItem,
  ImpactStats,
  getCookingHistory,
  getImpactStats,
} from '../services/historyStorage';
import { RecipeRecommendation } from '../types';

interface HistoryScreenProps {
  onBack: () => void;
  onCookAgain: (recipe: RecipeRecommendation) => void;
  onStartScan: () => void;
}

export function HistoryScreen({
  onBack,
  onCookAgain,
  onStartScan,
}: HistoryScreenProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [stats, setStats] = useState<ImpactStats>({
    ingredientsRescued: 0,
    recipesCooked: 0,
    mealsSaved: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    const [h, s] = await Promise.all([getCookingHistory(), getImpactStats()]);
    setHistory(h);
    setStats(s);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <View style={styles.container}>
      {/* 1. TOP BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Feather name="arrow-left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.topBarTextWrap}>
          <Text style={styles.topBarTitle}>Riwayat Memasak</Text>
          <Text style={styles.topBarSubtitle}>Dampak nyata penyelamatan makananmu</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. REAL IMPACT SUMMARY CARD (DESIGN.md Section 35 — Honest Data) */}
        <View style={styles.impactCard}>
          <View style={styles.impactHeaderRow}>
            <Feather name="award" size={16} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.impactCardTitle}>Dampak Penyelamatan Pangan</Text>
          </View>
          <View style={styles.impactRow}>
            <View style={styles.impactCol}>
              <Text style={styles.impactNumber}>{stats.ingredientsRescued}</Text>
              <Text style={styles.impactLabel}>Bahan Selamat</Text>
            </View>
            <View style={styles.impactDivider} />
            <View style={styles.impactCol}>
              <Text style={styles.impactNumber}>{stats.recipesCooked}</Text>
              <Text style={styles.impactLabel}>Masakan Jadi</Text>
            </View>
            <View style={styles.impactDivider} />
            <View style={styles.impactCol}>
              <Text style={styles.impactNumber}>{stats.mealsSaved}</Text>
              <Text style={styles.impactLabel}>Porsi Makanan</Text>
            </View>
          </View>
        </View>

        {/* 3. HISTORY LIST */}
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Memuat riwayat memasak...</Text>
          </View>
        ) : history.length === 0 ? (
          /* Empty State per DESIGN.md Section 36 */
          <View style={styles.emptyBox}>
            <View style={styles.emptyIconBox}>
              <Feather name="clock" size={32} color={colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>Belum Ada Masakan Selesai</Text>
            <Text style={styles.emptySubtitle}>
              Setelah menyelesaikan panduan memasak, catatan hidangan dan bahan yang
              berhasil diselamatkan akan tercatat otomatis di sini.
            </Text>
            <TouchableOpacity style={styles.emptyActionBtn} onPress={onStartScan} activeOpacity={0.85}>
              <Feather name="camera" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.emptyActionBtnText}>Mulai Masak Sekarang</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.listWrap}>
            <Text style={styles.sectionHeader}>Aktivitas Masak ({history.length})</Text>
            {history.map((item) => (
              <View key={item.id} style={styles.historyCard}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dishName}>{item.recipe.nama}</Text>
                    <Text style={styles.dateText}>{item.formattedDate}</Text>
                  </View>
                  <View style={styles.rescuedBadge}>
                    <Feather name="check" size={11} color={colors.success} style={{ marginRight: 4 }} />
                    <Text style={styles.rescuedBadgeText}>
                      {item.ingredientsRescuedCount} Bahan
                    </Text>
                  </View>
                </View>

                <Text style={styles.recipeDesc} numberOfLines={2}>
                  {item.recipe.alasan_rekomendasi || item.recipe.deskripsi}
                </Text>

                <View style={styles.cardFooter}>
                  <TouchableOpacity
                    style={styles.cookAgainBtn}
                    onPress={() => onCookAgain(item.recipe)}
                    activeOpacity={0.8}
                  >
                    <Feather name="rotate-ccw" size={13} color={colors.primary} style={{ marginRight: 6 }} />
                    <Text style={styles.cookAgainBtnText}>Masak Lagi Menu Ini</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
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
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  topBarTextWrap: {
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
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  impactCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: 20,
    ...shadows.level1,
  },
  impactHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
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
  impactNumber: {
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
  centerBox: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 12,
  },
  emptyBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 32,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    ...shadows.level1,
  },
  emptyIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  emptyActionBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.level1,
  },
  emptyActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  listWrap: {
    gap: 12,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  historyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    ...shadows.level1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  dishName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  dateText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  rescuedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  rescuedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.success,
  },
  recipeDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  cookAgainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  cookAgainBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
});
