import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { RecipeRecommendation } from '../types';
import { colors, radius, shadows, spacing } from '../theme';
import { isRecipeSaved, saveRecipe, removeSavedRecipe } from '../services/savedStorage';
import { openYouTubeTutorial } from '../services/youtube';

interface DetailResepScreenProps {
  recipe: RecipeRecommendation;
  onBack: () => void;
  onStartCooking: (recipe: RecipeRecommendation) => void;
}

export function DetailResepScreen({
  recipe,
  onBack,
  onStartCooking,
}: DetailResepScreenProps) {
  const [saved, setSaved] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    isRecipeSaved(recipe.id, recipe.nama).then(setSaved);
  }, [recipe.id, recipe.nama]);

  const handleToggleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      if (saved) {
        await removeSavedRecipe(recipe.id);
        setSaved(false);
      } else {
        await saveRecipe(recipe);
        setSaved(true);
        Alert.alert('Resep Disimpan', 'Resep berhasil ditambahkan ke koleksi Tersimpan.');
      }
    } catch {
      Alert.alert('Gagal', 'Terjadi kesalahan saat memperbarui resep tersimpan.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenTutorial = async () => {
    await openYouTubeTutorial(recipe.nama);
  };

  const steps =
    recipe.langkah_memasak && recipe.langkah_memasak.length > 0
      ? recipe.langkah_memasak
      : recipe.langkah && recipe.langkah.length > 0
      ? recipe.langkah
      : [
          `Siapkan bahan utama yang tersedia: ${recipe.bahan_tersedia.join(', ')}.`,
          'Cuci bersih bahan segar dan potong sesuai kebutuhan masakan.',
          'Panaskan 1 sendok makan minyak di wajan dengan api sedang.',
          `Masak dan tumis ${recipe.nama.toLowerCase()} hingga harum dan matang merata.`,
          'Bumbui dengan bumbu dasar secukupnya, cicipi rasa, lalu angkat dan sajikan selagi hangat.',
        ];

  const porsi = recipe.porsi || '1-2 porsi';

  return (
    <View style={styles.container}>
      {/* 1. TOP BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Feather name="arrow-left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.topBarTextWrap}>
          <Text style={styles.topBarTitle} numberOfLines={1}>
            Detail Resep
          </Text>
          <Text style={styles.topBarSubtitle}>Nomz Food Rescue</Text>
        </View>

        {/* Save / Bookmark Button */}
        <TouchableOpacity
          style={[styles.saveBtn, saved && styles.saveBtnActive]}
          onPress={handleToggleSave}
          activeOpacity={0.75}
          accessibilityLabel={saved ? 'Hapus Simpan' : 'Simpan Resep'}
        >
          <Feather
            name="bookmark"
            size={18}
            color={saved ? '#FFFFFF' : colors.textPrimary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. RECIPE HERO SUMMARY (DESIGN.md Section 29) */}
        <View style={styles.heroCard}>
          <Text style={styles.recipeTitle}>{recipe.nama}</Text>
          <Text style={styles.recipeDesc}>
            {recipe.alasan_rekomendasi || recipe.deskripsi || recipe.alasan}
          </Text>

          {/* Quick Metrics: Waktu, Kesulitan, Porsi */}
          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Feather name="clock" size={16} color={colors.primary} style={{ marginBottom: 4 }} />
              <Text style={styles.metricLabel}>Waktu</Text>
              <Text style={styles.metricValue}>{recipe.estimasi_waktu}</Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricItem}>
              <Feather name="bar-chart-2" size={16} color={colors.success} style={{ marginBottom: 4 }} />
              <Text style={styles.metricLabel}>Kesulitan</Text>
              <Text style={styles.metricValue}>{recipe.tingkat_kesulitan}</Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricItem}>
              <Feather name="users" size={16} color={colors.orangeDark} style={{ marginBottom: 4 }} />
              <Text style={styles.metricLabel}>Porsi</Text>
              <Text style={styles.metricValue}>{porsi}</Text>
            </View>
          </View>
        </View>

        {/* 3. BAHAN YANG TERSEDIA DI DAPUR */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.iconCircle, { backgroundColor: '#DCFCE7' }]}>
              <Feather name="check" size={14} color={colors.success} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Bahan yang Kamu Miliki</Text>
              <Text style={styles.cardSubtitle}>
                {recipe.bahan_tersedia.length} bahan langsung digunakan dari dapurmu
              </Text>
            </View>
          </View>

          <View style={styles.tagWrap}>
            {recipe.bahan_tersedia.map((b, i) => (
              <View key={i} style={styles.availableChip}>
                <Feather name="check" size={12} color={colors.success} style={{ marginRight: 5 }} />
                <Text style={styles.availableChipText}>{b}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 4. BAHAN PELENGKAP / BUMBU DAPUR */}
        {recipe.bahan_tambahan && recipe.bahan_tambahan.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconCircle, { backgroundColor: '#F3F4F6' }]}>
                <Feather name="plus" size={14} color={colors.textSecondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Bumbu Pelengkap Umum</Text>
                <Text style={styles.cardSubtitle}>
                  Bahan dasar yang lazim tersedia di dapur
                </Text>
              </View>
            </View>

            <View style={styles.tagWrap}>
              {recipe.bahan_tambahan.map((b, i) => (
                <View key={i} style={styles.additionalChip}>
                  <Text style={styles.additionalChipText}>{b}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 5. LANGKAH-LANGKAH MEMASAK */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.iconCircle, { backgroundColor: colors.mintSoft }]}>
              <Feather name="list" size={14} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Langkah Memasak</Text>
              <Text style={styles.cardSubtitle}>{steps.length} tahapan praktis</Text>
            </View>
          </View>

          <View style={styles.stepsList}>
            {steps.map((step: string, idx: number) => (
              <View key={idx} style={styles.stepItemRow}>
                <View style={styles.stepNumberBadge}>
                  <Text style={styles.stepNumberText}>{idx + 1}</Text>
                </View>
                <Text style={styles.stepInstructionText}>{step}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 6. YOUTUBE VIDEO TUTORIAL DISCOVERY */}
        <TouchableOpacity
          style={styles.youtubeCard}
          onPress={handleOpenTutorial}
          activeOpacity={0.85}
          accessibilityLabel="Tonton Tutorial Video di YouTube"
        >
          <View style={styles.youtubeIconBox}>
            <Feather name="video" size={20} color="#DC2626" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.youtubeTitle}>Lihat Video Panduan</Text>
            <Text style={styles.youtubeDesc}>
              Buka referensi video memasak "{recipe.nama}" di YouTube
            </Text>
          </View>
          <Feather name="external-link" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </ScrollView>

      {/* 7. STICKY BOTTOM PRIMARY CTA (DESIGN.md Section 17 & 29) */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.primaryCookBtn}
          onPress={() => onStartCooking(recipe)}
          activeOpacity={0.88}
        >
          <Feather name="play" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.primaryCookBtnText}>Mulai Masak Terpandu</Text>
        </TouchableOpacity>
      </View>
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
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  topBarSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
  },
  saveBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 96,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: 16,
    ...shadows.level1,
  },
  recipeTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  recipeDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 16,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 2,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  metricDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.borderSubtle,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: 16,
    ...shadows.level1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  availableChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.full,
  },
  availableChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.success,
    textTransform: 'capitalize',
  },
  additionalChip: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.full,
  },
  additionalChipText: {
    fontSize: 13,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  stepsList: {
    gap: 12,
  },
  stepItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumberBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.mintSoft,
    borderWidth: 1,
    borderColor: colors.lightMint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  stepInstructionText: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  youtubeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: 16,
    ...shadows.level1,
  },
  youtubeIconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  youtubeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  youtubeDesc: {
    fontSize: 12,
    color: colors.textMuted,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    ...shadows.level2,
  },
  primaryCookBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    ...shadows.level2,
  },
  primaryCookBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
