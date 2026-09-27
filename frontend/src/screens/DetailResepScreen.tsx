import React, { useState } from 'react';
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

interface DetailResepScreenProps {
  recipe: RecipeRecommendation;
  onBack: () => void;
}

export function DetailResepScreen({ recipe, onBack }: DetailResepScreenProps) {
  const [cookingStarted, setCookingStarted] = useState<boolean>(false);

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Feather name="arrow-left" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.topBarTextWrap}>
          <Text style={styles.topBarTitle} numberOfLines={1}>
            Detail Masakan
          </Text>
          <Text style={styles.topBarSubtitle}>Nomz Food Assistant</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Masakan */}
        <View style={styles.heroCard}>
          <Text style={styles.recipeTitle}>{recipe.nama}</Text>
          <Text style={styles.recipeDesc}>{recipe.deskripsi}</Text>

          {/* Quick Metrics */}
          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Feather name="clock" size={16} color={colors.primary} style={{ marginBottom: 4 }} />
              <Text style={styles.metricLabel}>Waktu Masak</Text>
              <Text style={styles.metricValue}>{recipe.estimasi_waktu}</Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricItem}>
              <Feather name="bar-chart-2" size={16} color="#16a34a" style={{ marginBottom: 4 }} />
              <Text style={styles.metricLabel}>Kesulitan</Text>
              <Text style={styles.metricValue}>{recipe.tingkat_kesulitan}</Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricItem}>
              <Feather name="check-circle" size={16} color="#2563eb" style={{ marginBottom: 4 }} />
              <Text style={styles.metricLabel}>Bahan Siap</Text>
              <Text style={styles.metricValue}>{recipe.bahan_tersedia.length} Macam</Text>
            </View>
          </View>
        </View>

        {/* SECTION: Bahan Milikmu (Tersedia) */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <View style={[styles.iconCircle, { backgroundColor: '#dcfce7' }]}>
              <Feather name="check" size={14} color="#16a34a" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Bahan yang Kamu Miliki</Text>
              <Text style={styles.cardSubtitle}>
                {recipe.bahan_tersedia.length} bahan langsung digunakan dari dapurmu
              </Text>
            </View>
          </View>

          <View style={styles.ingredientList}>
            {recipe.bahan_tersedia.map((item, idx) => (
              <View key={idx} style={styles.availableIngredientRow}>
                <Feather name="check-circle" size={15} color="#16a34a" style={{ marginRight: 10 }} />
                <Text style={styles.availableIngredientText}>{item}</Text>
                <View style={styles.readyTag}>
                  <Text style={styles.readyTagText}>Tersedia</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* SECTION: Bahan Tambahan yang Diperlukan */}
        {recipe.bahan_tambahan && recipe.bahan_tambahan.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <View style={[styles.iconCircle, { backgroundColor: '#f5f5f4' }]}>
                <Feather name="plus" size={14} color="#57534e" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Bahan Tambahan / Bumbu Dapur</Text>
                <Text style={styles.cardSubtitle}>
                  Bahan pelengkap umum yang lazim tersedia di rumah
                </Text>
              </View>
            </View>

            <View style={styles.ingredientList}>
              {recipe.bahan_tambahan.map((item, idx) => (
                <View key={idx} style={styles.additionalIngredientRow}>
                  <View style={styles.bulletDot} />
                  <Text style={styles.additionalIngredientText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* SECTION: Alasan & Catatan Masak */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <View style={[styles.iconCircle, { backgroundColor: '#fef3c7' }]}>
              <Feather name="info" size={14} color="#b45309" />
            </View>
            <Text style={styles.cardTitle}>Mengapa Hidangan Ini Tepat</Text>
          </View>
          <Text style={styles.rationaleBody}>{recipe.alasan}</Text>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={[styles.primaryActionBtn, cookingStarted && styles.primaryActionBtnDone]}
          onPress={() => setCookingStarted(true)}
          activeOpacity={0.85}
        >
          <Feather
            name={cookingStarted ? "check" : "play"}
            size={16}
            color="#ffffff"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.primaryActionBtnText}>
            {cookingStarted ? "Selamat Memasak!" : "Siap Mulai Memasak"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryActionBtn} onPress={onBack} activeOpacity={0.7}>
          <Text style={styles.secondaryActionBtnText}>Kembali ke Daftar Rekomendasi</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafaf9',
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
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e7e5e4',
  },
  recipeTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1c1917',
    marginBottom: 8,
  },
  recipeDesc: {
    fontSize: 14,
    color: '#57534e',
    lineHeight: 21,
    marginBottom: 20,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#fafaf9',
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#f5f5f4',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    fontSize: 11,
    color: '#78716c',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1c1917',
  },
  metricDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#e7e5e4',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e7e5e4',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1c1917',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#78716c',
    marginTop: 1,
  },
  ingredientList: {
    gap: 8,
  },
  availableIngredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  availableIngredientText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
    textTransform: 'capitalize',
  },
  readyTag: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  readyTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803d',
  },
  additionalIngredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafaf9',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f5f5f4',
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#78716c',
    marginRight: 12,
  },
  additionalIngredientText: {
    fontSize: 14,
    color: '#44403c',
    textTransform: 'capitalize',
  },
  rationaleBody: {
    fontSize: 13,
    color: '#57534e',
    lineHeight: 20,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 14,
    marginTop: 8,
  },
  primaryActionBtnDone: {
    backgroundColor: colors.primaryDark,
  },
  primaryActionBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryActionBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  secondaryActionBtnText: {
    color: '#78716c',
    fontSize: 14,
    fontWeight: '600',
  },
});
