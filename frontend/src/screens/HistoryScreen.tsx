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
import { colors } from '../theme';
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
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Feather name="arrow-left" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.topBarTextWrap}>
          <Text style={styles.topBarTitle}>Riwayat Memasak</Text>
          <Text style={styles.topBarSubtitle}>Dampak nyata penyelamatan makananmu</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Real Impact Summary Card (Deterministic metrics only) */}
        <View style={styles.impactCard}>
          <Text style={styles.impactCardTitle}>Dampak Food Rescue Kamu</Text>
          <View style={styles.impactRow}>
            <View style={styles.impactCol}>
              <Text style={styles.impactNumber}>{stats.ingredientsRescued}</Text>
              <Text style={styles.impactLabel}>Bahan Diselamatkan</Text>
            </View>
            <View style={styles.impactDivider} />
            <View style={styles.impactCol}>
              <Text style={styles.impactNumber}>{stats.recipesCooked}</Text>
              <Text style={styles.impactLabel}>Masakan Selesai</Text>
            </View>
            <View style={styles.impactDivider} />
            <View style={styles.impactCol}>
              <Text style={styles.impactNumber}>{stats.mealsSaved}</Text>
              <Text style={styles.impactLabel}>Santapan Tercipta</Text>
            </View>
          </View>
        </View>

        {/* History List */}
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Memuat riwayat memasak...</Text>
          </View>
        ) : history.length === 0 ? (
          <View style={styles.emptyBox}>
            <View style={styles.emptyIconBox}>
              <Feather name="clock" size={32} color={colors.textSecondary} />
            </View>
            <Text style={styles.emptyTitle}>Belum Ada Riwayat Memasak</Text>
            <Text style={styles.emptySubtitle}>
              Setelah kamu menyelesaikan panduan memasak, catatan hidangan dan bahan
              yang diselamatkan akan tercatat di sini.
            </Text>
            <TouchableOpacity style={styles.emptyActionBtn} onPress={onStartScan} activeOpacity={0.85}>
              <Feather name="camera" size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.emptyActionBtnText}>Mulai Masak Sekarang</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.listWrap}>
            <Text style={styles.sectionHeader}>Aktivitas Masak Terakhir ({history.length})</Text>
            {history.map((item) => (
              <View key={item.id} style={styles.historyCard}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dishName}>{item.recipe.nama}</Text>
                    <Text style={styles.dateText}>{item.formattedDate}</Text>
                  </View>
                  <View style={styles.rescuedBadge}>
                    <Feather name="shield" size={11} color="#15803d" style={{ marginRight: 4 }} />
                    <Text style={styles.rescuedBadgeText}>
                      {item.ingredientsRescuedCount} Bahan
                    </Text>
                  </View>
                </View>

                <Text style={styles.recipeDesc} numberOfLines={2}>
                  {item.recipe.deskripsi}
                </Text>

                <View style={styles.cardFooter}>
                  <TouchableOpacity
                    style={styles.cookAgainBtn}
                    onPress={() => onCookAgain(item.recipe)}
                    activeOpacity={0.8}
                  >
                    <Feather name="rotate-ccw" size={13} color={colors.primary} style={{ marginRight: 6 }} />
                    <Text style={styles.cookAgainBtnText}>Masak Lagi</Text>
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
    backgroundColor: '#FAF8F3',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E7E5DE',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f4',
    marginRight: 12,
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
    color: colors.textSecondary,
    marginTop: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  impactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E7E5DE',
    marginBottom: 20,
  },
  impactCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  impactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  impactCol: {
    alignItems: 'center',
    flex: 1,
  },
  impactNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  impactLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  impactDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E7E5DE',
  },
  centerBox: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: colors.textSecondary,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 24,
  },
  emptyIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EFF3EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  listWrap: {
    gap: 12,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E7E5DE',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  dishName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  dateText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  rescuedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  rescuedBadgeText: {
    fontSize: 11,
    color: '#15803d',
    fontWeight: '600',
  },
  recipeDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#f5f5f4',
    paddingTop: 10,
  },
  cookAgainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF3EF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  cookAgainBtnText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
});
