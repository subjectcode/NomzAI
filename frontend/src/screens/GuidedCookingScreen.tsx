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
import { colors } from '../theme';
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
  const steps = recipe.langkah && recipe.langkah.length > 0
    ? recipe.langkah
    : [
        `Siapkan bahan utama yang tersedia: ${recipe.bahan_tersedia.join(', ')}.`,
        'Cuci bersih bahan segar dan potong sesuai selera.',
        'Panaskan sedikit minyak goreng atau margarin di atas wajan dengan api sedang.',
        `Masak dan olah ${recipe.nama.toLowerCase()} hingga matang merata dan harum.`,
        'Bumbui dengan bumbu pelengkap secukupnya, cicipi rasa, lalu angkat dan sajikan selagi hangat.',
      ];

  const totalSteps = steps.length;
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Deteksi estimasi waktu di teks instruksi langkah (misal "5 menit", "10 menit")
  const currentStepText = steps[currentStepIndex];
  const timeMatch = currentStepText.match(/(\d+)\s*(menit|detik)/i);
  const detectedDuration = timeMatch ? `${timeMatch[1]} ${timeMatch[2]}` : null;

  // Timer interaktif jika ada durasi
  const initialSeconds = timeMatch
    ? (timeMatch[2].toLowerCase().startsWith('menit') ? parseInt(timeMatch[1], 10) * 60 : parseInt(timeMatch[1], 10))
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
            <Feather name="shield" size={14} color="#15803d" style={{ marginRight: 6 }} />
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
      {/* Top Bar Navigasi */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Feather name="arrow-left" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.topBarTextWrap}>
          <Text style={styles.topBarTitle} numberOfLines={1}>
            Panduan Memasak
          </Text>
          <Text style={styles.topBarSubtitle}>{recipe.nama}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Step Indicator */}
        <View style={styles.stepHeaderRow}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>
              Langkah {currentStepIndex + 1} dari {totalSteps}
            </Text>
          </View>
          <Text style={styles.stepPercentText}>{progressPercent}% Selesai</Text>
        </View>

        {/* Main Step Instruction Card */}
        <View style={styles.instructionCard}>
          <Text style={styles.instructionText}>{currentStepText}</Text>

          {/* Timer Interaktif Jika Ada Waktu */}
          {detectedDuration && initialSeconds > 0 && (
            <View style={styles.timerBox}>
              <View style={styles.timerHeader}>
                <Feather name="clock" size={15} color={colors.primary} style={{ marginRight: 6 }} />
                <Text style={styles.timerLabel}>Timer Waktu Masak ({detectedDuration}):</Text>
              </View>
              <Text style={styles.timerDigits}>{formatTimer(timerSeconds)}</Text>
              <TouchableOpacity
                style={[styles.timerControlBtn, timerRunning && styles.timerControlBtnPause]}
                onPress={() => setTimerRunning((prev) => !prev)}
                activeOpacity={0.8}
              >
                <Feather
                  name={timerRunning ? "pause" : "play"}
                  size={14}
                  color="#FFFFFF"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.timerControlBtnText}>
                  {timerRunning ? "Jeda Timer" : timerSeconds === 0 ? "Ulangi Timer" : "Mulai Timer"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Bahan yang Digunakan di Langkah Ini */}
        <View style={styles.ingredientReferenceCard}>
          <Text style={styles.ingredientReferenceTitle}>Bahan Tersedia yang Disiapkan:</Text>
          <View style={styles.tagWrap}>
            {recipe.bahan_tersedia.map((b, i) => (
              <View key={i} style={styles.ingPill}>
                <Feather name="check" size={11} color="#15803d" style={{ marginRight: 4 }} />
                <Text style={styles.ingPillText}>{b}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Navigation Footer */}
      <View style={styles.footerBar}>
        <TouchableOpacity
          style={[styles.navBtn, currentStepIndex === 0 && styles.navBtnDisabled]}
          onPress={handlePrev}
          disabled={currentStepIndex === 0}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={16} color={currentStepIndex === 0 ? '#a8a29e' : colors.textPrimary} />
          <Text style={[styles.navBtnText, currentStepIndex === 0 && styles.navBtnTextDisabled]}>
            Sebelumnya
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryNextBtn, currentStepIndex === totalSteps - 1 && styles.finishBtn]}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryNextBtnText}>
            {currentStepIndex === totalSteps - 1 ? "Selesai Memasak" : "Langkah Berikutnya"}
          </Text>
          <Feather
            name={currentStepIndex === totalSteps - 1 ? "check" : "arrow-right"}
            size={16}
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
    backgroundColor: '#FAF8F3',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f4',
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
    color: '#1c1917',
  },
  topBarSubtitle: {
    fontSize: 12,
    color: '#78716c',
    marginTop: 1,
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: '#E7E5DE',
    width: '100%',
  },
  progressBarFill: {
    height: 4,
    backgroundColor: colors.primary,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 30,
  },
  stepHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  stepBadge: {
    backgroundColor: '#EFF3EF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  stepPercentText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  instructionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E7E5DE',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  instructionText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 28,
  },
  timerBox: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f4',
    alignItems: 'center',
  },
  timerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timerLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  timerDigits: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primaryDark,
    marginBottom: 12,
    letterSpacing: 1,
  },
  timerControlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
  },
  timerControlBtnPause: {
    backgroundColor: '#d97706',
  },
  timerControlBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  ingredientReferenceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E7E5DE',
  },
  ingredientReferenceTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  ingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ingPillText: {
    fontSize: 11,
    color: '#15803d',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  footerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E7E5DE',
    gap: 12,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E7E5DE',
    backgroundColor: '#FAF8F3',
  },
  navBtnDisabled: {
    opacity: 0.5,
  },
  navBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: 6,
  },
  navBtnTextDisabled: {
    color: '#a8a29e',
  },
  primaryNextBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
  },
  finishBtn: {
    backgroundColor: '#15803d',
  },
  primaryNextBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  completedContainer: {
    flex: 1,
    backgroundColor: '#FAF8F3',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  celebrationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E7E5DE',
    width: '100%',
    maxWidth: 420,
  },
  celebrationIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
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
    color: colors.primaryDark,
    textAlign: 'center',
    marginBottom: 10,
  },
  celebrationSubtext: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
  },
  impactBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 24,
  },
  impactBadgeText: {
    fontSize: 12,
    color: '#15803d',
    fontWeight: '700',
  },
  donePrimaryBtn: {
    backgroundColor: colors.primary,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  donePrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  doneSecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  doneSecondaryBtnText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
});
