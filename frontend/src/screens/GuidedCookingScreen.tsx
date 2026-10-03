import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { RecipeRecommendation } from '../types';
import { colors, radius, shadows, spacing } from '../theme';
import { addCookingHistory } from '../services/historyStorage';

interface GuidedCookingScreenProps {
  recipe: RecipeRecommendation;
  onBack: () => void;
  onComplete: () => void;
}

export function GuidedCookingScreen({
  recipe,
  onBack,
  onComplete,
}: GuidedCookingScreenProps) {
  const fallbackSteps = [
    `Persiapan Bahan: Siapkan dan potong bahan utama yang tersedia (${recipe.bahan_tersedia.join(', ')}). Cuci bersih dan tiriskan hingga kering agar tidak membuat minyak meletup saat dimasak.`,
    `Pemanasan Alat: Panaskan wajan/panci dengan api sedang selama ±2 menit. Tambahkan ${recipe.bahan_tambahan[0] || '1 sdm minyak goreng'} dan tunggu sampai minyak terlihat lebih encer serta bergerak ringan saat wajan dimiringkan.`,
    `Pengolahan Utama: Masukkan ${recipe.bahan_tersedia[0] || 'bahan utama'}. Masak dengan teknik ${recipe.metode_masak?.toLowerCase() || 'tumis'} di atas api sedang-tinggi selama 3-4 menit sampai sisi bawah mulai kecokelatan keemasan dan aroma harum keluar. Balik perlahan agar matang merata.`,
    `Pembumbuan & Koreksi Rasa: Turunkan api ke sedang-kecil, masukkan bumbu pelengkap (${recipe.bahan_tambahan.slice(1).join(', ') || 'garam dan merica'}). Aduk merata 1-2 menit hingga bumbu meresap sempurna dan saus membalut bahan.`,
    `Penyelesaian & Penyajian: Matikan api kompor. Diamkan sejenak 1 menit agar sari makanan stabil, lalu angkat dan tata rapi di atas piring saji selagi hangat.`,
  ];

  const steps =
    recipe.langkah_memasak && recipe.langkah_memasak.length > 0
      ? recipe.langkah_memasak
      : recipe.langkah && recipe.langkah.length > 0
      ? recipe.langkah
      : fallbackSteps;

  const totalSteps = steps.length;
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Deteksi durasi waktu di teks instruksi langkah (misal "5 menit", "10 menit", "45 detik")
  const currentStepText = steps[currentStepIndex];
  const timeMatch = currentStepText.match(/(\d+)\s*(menit|detik)/i);
  const detectedDuration = timeMatch ? `${timeMatch[1]} ${timeMatch[2]}` : null;

  // Deteksi tingkat api (Api Kecil, Api Sedang, Api Sedang-Tinggi, Api Besar)
  const heatMatch = currentStepText.match(/api\s+(sedang-tinggi|sedang-kecil|kecil|sedang|besar)/i);
  const detectedHeat = heatMatch ? `Api ${heatMatch[1]}` : null;

  // Deteksi fase langkah memasak
  const detectedPhase =
    currentStepIndex === 0
      ? 'Persiapan'
      : currentStepIndex === totalSteps - 1
      ? 'Penyajian'
      : /bumbu|garam|merica|saus|kecap/i.test(currentStepText)
      ? 'Pembumbuan'
      : recipe.metode_masak || 'Pengolahan';

  // Timer interaktif jika ada durasi
  const initialSeconds = timeMatch
    ? timeMatch[2].toLowerCase().startsWith('menit')
      ? parseInt(timeMatch[1], 10) * 60
      : parseInt(timeMatch[1], 10)
    : 0;

  const [timerSeconds, setTimerSeconds] = useState<number>(initialSeconds);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    setTimerSeconds(initialSeconds);
    setTimerRunning(false);
  }, [currentStepIndex]);

  useEffect(() => {
    let interval: any = null;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, timerSeconds]);

  const handleNext = async () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      // Selesai memasak -> simpan riwayat masakan nyata
      await addCookingHistory(recipe);
      setIsCompleted(true);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleCookAgain = () => {
    setCurrentStepIndex(0);
    setIsCompleted(false);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = Math.round(((currentStepIndex + 1) / totalSteps) * 100);

  if (isCompleted) {
    return (
      <View style={styles.completedContainer}>
        <View style={styles.celebrationCard}>
          <View style={styles.celebrationIconWrap}>
            <Feather name="check" size={36} color="#FFFFFF" />
          </View>
          <Text style={styles.celebrationTitle}>Masakan Selesai!</Text>
          <Text style={styles.celebrationDish}>{recipe.nama}</Text>
          <Text style={styles.celebrationSubtext}>
            Hebat! Kamu berhasil menyelamatkan {recipe.bahan_tersedia.length} bahan makanan
            dari dapurmu menjadi santapan lezat.
          </Text>

          <View style={styles.impactBadge}>
            <Feather name="shield" size={14} color={colors.success} style={{ marginRight: 6 }} />
            <Text style={styles.impactBadgeText}>
              {recipe.bahan_tersedia.length} Bahan Berhasil Diselamatkan
            </Text>
          </View>

          <TouchableOpacity
            style={styles.donePrimaryBtn}
            onPress={onComplete}
            activeOpacity={0.85}
          >
            <Text style={styles.donePrimaryBtnText}>Kembali ke Beranda</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.doneSecondaryBtn}
            onPress={handleCookAgain}
            activeOpacity={0.7}
          >
            <Feather name="rotate-ccw" size={14} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.doneSecondaryBtnText}>Masak Lagi</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 1. TOP BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.closeBtn} onPress={onBack} activeOpacity={0.7}>
          <Feather name="x" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.topBarCenter}>
          <Text style={styles.topBarTitle} numberOfLines={1}>
            {recipe.nama}
          </Text>
          <Text style={styles.topBarStepCount}>
            Langkah {currentStepIndex + 1} dari {totalSteps}
          </Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* 2. PROGRESS BAR (DESIGN.md Section 30) */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 3. CURRENT STEP CARD */}
        <View style={styles.stepCard}>
          <View style={styles.stepHeaderRow}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>LANGKAH {currentStepIndex + 1}</Text>
            </View>
            <View style={styles.cuesContainer}>
              <View style={styles.phaseBadge}>
                <Text style={styles.phaseBadgeText}>{detectedPhase}</Text>
              </View>
              {detectedHeat && (
                <View style={styles.heatBadge}>
                  <Feather name="zap" size={11} color={colors.accent} style={{ marginRight: 3 }} />
                  <Text style={styles.heatBadgeText}>{detectedHeat}</Text>
                </View>
              )}
            </View>
          </View>

          <Text style={styles.stepInstructionText}>{currentStepText}</Text>

          {/* TIMER INTERAKTIF (Jika instruksi mengandung durasi waktu) */}
          {detectedDuration && (
            <View style={styles.timerCard}>
              <View style={styles.timerHeader}>
                <Feather name="clock" size={16} color={colors.primary} style={{ marginRight: 6 }} />
                <Text style={styles.timerTitle}>Pengatur Waktu: {detectedDuration}</Text>
              </View>
              <Text style={styles.timerDigits}>{formatTimer(timerSeconds)}</Text>
              <View style={styles.timerActionsRow}>
                <TouchableOpacity
                  style={[styles.timerBtn, timerRunning ? styles.timerBtnPause : styles.timerBtnStart]}
                  onPress={() => setTimerRunning(!timerRunning)}
                  activeOpacity={0.8}
                >
                  <Feather
                    name={timerRunning ? 'pause' : 'play'}
                    size={14}
                    color="#FFFFFF"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.timerBtnText}>{timerRunning ? 'Jeda' : 'Mulai Timer'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.timerResetBtn}
                  onPress={() => {
                    setTimerRunning(false);
                    setTimerSeconds(initialSeconds);
                  }}
                  activeOpacity={0.7}
                >
                  <Feather name="rotate-ccw" size={14} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Bahan yang Digunakan dalam Resep */}
        <View style={styles.ingredientsReminderCard}>
          <Text style={styles.reminderTitle}>Bahan Resep Ini:</Text>
          <View style={styles.chipsWrap}>
            {recipe.bahan_tersedia.map((b, i) => (
              <View key={i} style={styles.reminderChip}>
                <Text style={styles.reminderChipText}>{b}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* 4. BOTTOM NAVIGATION ACTIONS */}
      <View style={styles.bottomBar}>
        {currentStepIndex > 0 ? (
          <TouchableOpacity
            style={styles.prevBtn}
            onPress={handlePrev}
            activeOpacity={0.75}
          >
            <Feather name="arrow-left" size={18} color={colors.textSecondary} />
            <Text style={styles.prevBtnText}>Sebelumnya</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 100 }} />
        )}

        <TouchableOpacity
          style={styles.nextBtn}
          onPress={handleNext}
          activeOpacity={0.88}
        >
          <Text style={styles.nextBtnText}>
            {currentStepIndex < totalSteps - 1 ? 'Langkah Berikutnya' : 'Selesai Memasak'}
          </Text>
          <Feather
            name={currentStepIndex < totalSteps - 1 ? 'arrow-right' : 'check'}
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
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarCenter: {
    flex: 1,
    alignItems: 'center',
  },
  topBarTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  topBarStepCount: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 1,
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.borderSubtle,
    width: '100%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 96,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  stepCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: 16,
    ...shadows.level1,
  },
  stepHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  stepBadge: {
    backgroundColor: colors.mintSoft,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.xs,
  },
  stepBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  cuesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  phaseBadge: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radius.xs,
  },
  phaseBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  heatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  heatBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accent,
  },
  stepInstructionText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 26,
    marginBottom: 16,
  },
  timerCard: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  timerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timerTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  timerDigits: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 2,
    marginBottom: 12,
  },
  timerActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: radius.full,
  },
  timerBtnStart: {
    backgroundColor: colors.primary,
  },
  timerBtnPause: {
    backgroundColor: colors.orangeDark,
  },
  timerBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  timerResetBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ingredientsReminderCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    ...shadows.level1,
  },
  reminderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  reminderChip: {
    backgroundColor: colors.background,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  reminderChipText: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'capitalize',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadows.level2,
  },
  prevBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  prevBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 6,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: 13,
    paddingHorizontal: 22,
    minHeight: 48,
    ...shadows.level1,
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  completedContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  celebrationCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 24,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    ...shadows.level2,
  },
  celebrationIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...shadows.level1,
  },
  celebrationTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  celebrationDish: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  celebrationSubtext: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  impactBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: radius.full,
    marginBottom: 20,
  },
  impactBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.success,
  },
  donePrimaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    minHeight: 48,
    ...shadows.level1,
  },
  donePrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  doneSecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  doneSecondaryBtnText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
});
