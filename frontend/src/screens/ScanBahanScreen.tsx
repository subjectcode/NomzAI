import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { checkBackendHealth, detectIngredientsFromImage } from '../services/api';
import { Ingredient } from '../types';
import { SAMPLE_INGREDIENTS_DATA_URL, SAMPLE_FRUITS_DATA_URL } from '../sampleImages';

type BackendStatus = 'idle' | 'checking' | 'connected' | 'failed';

interface ScanBahanScreenProps {
  onNavigateToRecommendations: (confirmedIngredients: string[]) => void;
}

export function ScanBahanScreen({ onNavigateToRecommendations }: ScanBahanScreenProps) {
  // Status Koneksi Backend
  const [backendStatus, setBackendStatus] = useState<BackendStatus>('idle');
  const [backendMessage, setBackendMessage] = useState<string>('');

  // Status Pemilihan Gambar & Deteksi
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>('image/jpeg');
  const [imageFileName, setImageFileName] = useState<string>('food.jpg');

  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [detectionError, setDetectionError] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  // Input Tambah Bahan Manual
  const [newIngredientName, setNewIngredientName] = useState<string>('');

  // Status Bahan yang Dikonfirmasi
  const [confirmedIngredients, setConfirmedIngredients] = useState<string[] | null>(null);

  // Memeriksa kesehatan backend
  const handleCheckHealth = async () => {
    setBackendStatus('checking');
    try {
      const res = await checkBackendHealth();
      setBackendStatus('connected');
      setBackendMessage(`API: ${res.service} • DB: ${res.database}`);
    } catch (err: any) {
      setBackendStatus('failed');
      setBackendMessage(err.message || 'Koneksi gagal');
    }
  };

  // Memilih foto dari galeri perangkat
  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedImage(asset.uri);
        setImageMime(asset.mimeType || 'image/jpeg');
        setImageFileName(asset.fileName || 'food.jpg');
        setIngredients([]);
        setDetectionError(null);
        setConfirmedIngredients(null);
      }
    } catch (err: any) {
      Alert.alert('Gagal Membuka Galeri', err.message || 'Tidak dapat memilih gambar.');
    }
  };

  // Memilih contoh foto bawaan (untuk pengujian instan)
  const handleSelectSample = (sampleDataUrl: string, sampleName: string) => {
    setSelectedImage(sampleDataUrl);
    setImageMime('image/jpeg');
    setImageFileName(`${sampleName}.jpg`);
    setIngredients([]);
    setDetectionError(null);
    setConfirmedIngredients(null);
  };

  // Menjalankan analisis bahan
  const handleDetectIngredients = async () => {
    if (!selectedImage) return;

    setIsDetecting(true);
    setDetectionError(null);
    setConfirmedIngredients(null);

    try {
      const detected = await detectIngredientsFromImage(selectedImage, imageMime, imageFileName);
      setIngredients(detected);
      if (detected.length === 0) {
        setDetectionError('Tidak ada bahan makanan yang terdeteksi. Anda dapat menambahkan bahan secara manual di bawah.');
      }
    } catch (err: any) {
      setDetectionError(err.message || 'Gagal mendeteksi bahan. Periksa koneksi backend.');
    } finally {
      setIsDetecting(false);
    }
  };

  // Mengubah nama bahan secara inline
  const handleEditIngredient = (id: string, newName: string) => {
    setIngredients((prev) =>
      prev.map((item) => (item.id === id ? { ...item, name: newName } : item))
    );
  };

  // Menghapus bahan dari daftar
  const handleDeleteIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((item) => item.id !== id));
  };

  // Menambahkan bahan baru secara manual
  const handleAddIngredient = () => {
    const trimmed = newIngredientName.trim();
    if (!trimmed) return;

    const newItem: Ingredient = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: trimmed.toLowerCase(),
      confidence: 1.0, // diverifikasi manual oleh pengguna
    };

    setIngredients((prev) => [...prev, newItem]);
    setNewIngredientName('');
  };

  // Mengonfirmasi seluruh bahan
  const handleConfirmIngredients = () => {
    const validList = ingredients
      .map((i) => i.name.trim())
      .filter((name) => name.length > 0);

    if (validList.length === 0) {
      Alert.alert('Perhatian', 'Harap sediakan minimal satu bahan makanan untuk dikonfirmasi.');
      return;
    }

    setConfirmedIngredients(validList);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {/* Header Aplikasi */}
      <View style={styles.header}>
        <Text style={styles.logo}>Nomz</Text>
        <Text style={styles.subtitle}>Asisten Memasak Harian</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Pindai Bahan Makanan</Text>
        </View>
      </View>

      {/* Bar Status Backend */}
      <View style={styles.backendBar}>
        <View style={styles.backendBarLeft}>
          <View
            style={[
              styles.statusDot,
              backendStatus === 'connected' && styles.statusDotGreen,
              backendStatus === 'failed' && styles.statusDotRed,
              backendStatus === 'checking' && styles.statusDotAmber,
            ]}
          />
          <Text style={styles.backendBarText} numberOfLines={1} ellipsizeMode="tail">
            {backendStatus === 'connected'
              ? `Terhubung • ${backendMessage}`
              : backendStatus === 'failed'
              ? `Terputus: ${backendMessage}`
              : backendStatus === 'checking'
              ? 'Menghubungkan ke server...'
              : 'Status backend belum diperiksa'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.checkHealthBtn}
          onPress={handleCheckHealth}
          disabled={backendStatus === 'checking'}
        >
          <Text style={styles.checkHealthBtnText}>
            {backendStatus === 'checking' ? '...' : 'Cek'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* BAGIAN 1: Pemilihan & Pratinjau Foto */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>1. Foto Bahan Masakan</Text>
        <Text style={styles.cardDesc}>
          Pilih foto bahan makanan segar di meja dapur atau talenan Anda.
        </Text>

        {selectedImage ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: selectedImage }} style={styles.imagePreview} resizeMode="cover" />
            <View style={styles.imageActionRow}>
              <TouchableOpacity style={styles.secondaryButton} onPress={handlePickImage}>
                <Feather name="image" size={14} color="#44403c" style={{ marginRight: 6 }} />
                <Text style={styles.secondaryButtonText}>Ganti Foto</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryButton, isDetecting && styles.buttonDisabled]}
                onPress={handleDetectIngredients}
                disabled={isDetecting}
              >
                {isDetecting ? (
                  <View style={styles.row}>
                    <ActivityIndicator size="small" color="#ffffff" />
                    <Text style={[styles.primaryButtonText, { marginLeft: 8 }]}>Menganalisis...</Text>
                  </View>
                ) : (
                  <View style={styles.row}>
                    <Feather name="search" size={14} color="#ffffff" style={{ marginRight: 6 }} />
                    <Text style={styles.primaryButtonText}>Deteksi Bahan</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View>
            <TouchableOpacity style={styles.uploadBox} onPress={handlePickImage} activeOpacity={0.8}>
              <View style={styles.uploadIconContainer}>
                <Feather name="camera" size={26} color="#ea580c" />
              </View>
              <Text style={styles.uploadBoxTitle}>Pilih dari Galeri</Text>
              <Text style={styles.uploadBoxHint}>Ketuk untuk memilih foto bahan makanan</Text>
            </TouchableOpacity>

            {/* Tombol Contoh Foto Cepat */}
            <View style={styles.sampleRow}>
              <Text style={styles.sampleLabel}>Atau coba contoh bahan:</Text>
              <View style={styles.sampleButtons}>
                <TouchableOpacity
                  style={styles.sampleBtn}
                  onPress={() => handleSelectSample(SAMPLE_INGREDIENTS_DATA_URL, 'telur_tomat')}
                >
                  <Text style={styles.sampleBtnText}>Telur, Tomat & Basil</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.sampleBtn}
                  onPress={() => handleSelectSample(SAMPLE_FRUITS_DATA_URL, 'buah_segar')}
                >
                  <Text style={styles.sampleBtnText}>Buah-buahan Segar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Indikator Memuat */}
        {isDetecting && (
          <View style={styles.loadingBanner}>
            <ActivityIndicator size="small" color="#ea580c" style={{ marginRight: 10 }} />
            <Text style={styles.loadingBannerText}>
              Memeriksa bahan makanan pada foto...
            </Text>
          </View>
        )}

        {/* Kotak Pemberitahuan Error */}
        {detectionError && (
          <View style={styles.errorBox}>
            <Text style={styles.errorBoxTitle}>Pemberitahuan Analisis</Text>
            <Text style={styles.errorBoxText}>{detectionError}</Text>
          </View>
        )}
      </View>

      {/* BAGIAN 2: Daftar & Pengeditan Bahan */}
      {(ingredients.length > 0 || selectedImage) && (
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>2. Bahan Terdeteksi</Text>
            {ingredients.length > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{ingredients.length} bahan</Text>
              </View>
            )}
          </View>
          <Text style={styles.cardDesc}>
            Periksa daftar bahan di bawah. Anda dapat menyunting nama, menghapus bahan, atau menambahkan bumbu lain.
          </Text>

          {/* Daftar Bahan */}
          {ingredients.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                {isDetecting
                  ? 'Sedang memproses bahan...'
                  : 'Belum ada bahan terdeteksi. Ketuk "Deteksi Bahan" di atas.'}
              </Text>
            </View>
          ) : (
            <View style={styles.ingredientsList}>
              {ingredients.map((item, index) => (
                <View key={item.id} style={styles.ingredientRow}>
                  <Text style={styles.ingredientIndex}>{index + 1}.</Text>
                  <TextInput
                    style={styles.ingredientInput}
                    value={item.name}
                    onChangeText={(text) => handleEditIngredient(item.id, text)}
                    placeholder="Nama bahan"
                    placeholderTextColor="#a8a29e"
                    autoCapitalize="none"
                  />
                  <View style={styles.confidenceTag}>
                    <Text style={styles.confidenceText}>
                      {Math.round(item.confidence * 100)}%
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteIngredient(item.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Feather name="trash-2" size={13} color="#dc2626" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Tambah Bahan Manual */}
          <View style={styles.addSection}>
            <Text style={styles.addSectionTitle}>Tambah Bahan Manual:</Text>
            <View style={styles.addInputRow}>
              <TextInput
                style={styles.addInput}
                value={newIngredientName}
                onChangeText={setNewIngredientName}
                placeholder="contoh: garam, minyak goreng, merica"
                placeholderTextColor="#a8a29e"
                onSubmitEditing={handleAddIngredient}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={[styles.addButton, !newIngredientName.trim() && styles.buttonDisabled]}
                onPress={handleAddIngredient}
                disabled={!newIngredientName.trim()}
              >
                <Feather name="plus" size={14} color="#ffffff" style={{ marginRight: 4 }} />
                <Text style={styles.addButtonText}>Tambah</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Tombol Konfirmasi Bahan */}
          {ingredients.length > 0 && (
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirmIngredients}
              activeOpacity={0.85}
            >
              <Feather name="check" size={16} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.confirmButtonText}>Konfirmasi Bahan ({ingredients.length})</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* BAGIAN 3: Hasil Konfirmasi & Navigasi ke Rekomendasi */}
      {confirmedIngredients && (
        <View style={[styles.card, styles.confirmedCard]}>
          <View style={styles.confirmedHeader}>
            <View style={styles.checkCircleBadge}>
              <Feather name="check" size={14} color="#15803d" />
            </View>
            <Text style={styles.confirmedTitle}>Bahan Siap Digunakan!</Text>
          </View>
          <Text style={styles.confirmedDesc}>
            {confirmedIngredients.length} bahan berikut telah diverifikasi dan siap dijadikan masakan lezat:
          </Text>
          <View style={styles.tagGrid}>
            {confirmedIngredients.map((ing, idx) => (
              <View key={idx} style={styles.confirmedTag}>
                <Text style={styles.confirmedTagText}>{ing}</Text>
              </View>
            ))}
          </View>

          {/* TOMBOL UTAMA M2: Beralih ke Rekomendasi */}
          <TouchableOpacity
            style={styles.toRecommendationsBtn}
            onPress={() => onNavigateToRecommendations(confirmedIngredients)}
            activeOpacity={0.88}
          >
            <Text style={styles.toRecommendationsBtnText}>Lihat Rekomendasi Masakan</Text>
            <Feather name="arrow-right" size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>
      )}

      {/* Footer */}
      <Text style={styles.footer}>Nomz Mobile • Memasak Cerdas dari Dapur Sendiri</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 18,
  },
  logo: {
    fontSize: 40,
    fontWeight: '800',
    color: '#1c1917',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 14,
    color: '#78716c',
    marginTop: 2,
    fontWeight: '500',
  },
  badge: {
    backgroundColor: '#fff7ed',
    borderColor: '#ffedd5',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 9999,
    marginTop: 8,
  },
  badgeText: {
    color: '#ea580c',
    fontSize: 11,
    fontWeight: '600',
  },
  backendBar: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e7e5e4',
    marginBottom: 16,
  },
  backendBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#a8a29e',
    marginRight: 8,
  },
  statusDotGreen: {
    backgroundColor: '#16a34a',
  },
  statusDotRed: {
    backgroundColor: '#dc2626',
  },
  statusDotAmber: {
    backgroundColor: '#d97706',
  },
  backendBarText: {
    fontSize: 12,
    color: '#44403c',
    flex: 1,
  },
  checkHealthBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#f5f5f4',
    borderRadius: 6,
  },
  checkHealthBtnText: {
    fontSize: 11,
    color: '#292524',
    fontWeight: '600',
  },
  card: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e7e5e4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    marginBottom: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1c1917',
  },
  cardDesc: {
    fontSize: 13,
    color: '#78716c',
    marginTop: 4,
    marginBottom: 14,
    lineHeight: 18,
  },
  countBadge: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  countBadgeText: {
    color: '#15803d',
    fontSize: 11,
    fontWeight: '600',
  },
  uploadBox: {
    borderWidth: 1.5,
    borderColor: '#e7e5e4',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fafaf9',
  },
  uploadIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff7ed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  uploadBoxTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#292524',
  },
  uploadBoxHint: {
    fontSize: 12,
    color: '#a8a29e',
    marginTop: 3,
  },
  sampleRow: {
    marginTop: 12,
  },
  sampleLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#78716c',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  sampleButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sampleBtn: {
    flex: 1,
    backgroundColor: '#f5f5f4',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e7e5e4',
  },
  sampleBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#44403c',
  },
  previewContainer: {
    width: '100%',
  },
  imagePreview: {
    width: '100%',
    height: 220,
    borderRadius: 10,
    backgroundColor: '#f5f5f4',
  },
  imageActionRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#ea580c',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryButton: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#f5f5f4',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#44403c',
    fontSize: 13,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff7ed',
    borderColor: '#ffedd5',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
  },
  loadingBannerText: {
    color: '#c2410c',
    fontSize: 12,
    fontWeight: '600',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
  },
  errorBoxTitle: {
    color: '#b91c1c',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  errorBoxText: {
    color: '#dc2626',
    fontSize: 12,
    lineHeight: 16,
  },
  emptyState: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 13,
    color: '#a8a29e',
    textAlign: 'center',
  },
  ingredientsList: {
    marginBottom: 14,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafaf9',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#f5f5f4',
  },
  ingredientIndex: {
    fontSize: 12,
    color: '#a8a29e',
    fontWeight: '600',
    width: 22,
  },
  ingredientInput: {
    flex: 1,
    fontSize: 14,
    color: '#1c1917',
    fontWeight: '600',
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  confidenceTag: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  confidenceText: {
    color: '#15803d',
    fontSize: 11,
    fontWeight: '700',
  },
  deleteButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addSection: {
    marginTop: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f4',
  },
  addSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#78716c',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  addInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  addInput: {
    flex: 1,
    backgroundColor: '#fafaf9',
    borderWidth: 1,
    borderColor: '#e7e5e4',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#1c1917',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#292524',
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  confirmButton: {
    flexDirection: 'row',
    backgroundColor: '#16a34a',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  confirmedCard: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  confirmedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  checkCircleBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  confirmedTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#15803d',
  },
  confirmedDesc: {
    fontSize: 13,
    color: '#166534',
    marginBottom: 10,
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  confirmedTag: {
    backgroundColor: '#ffffff',
    borderColor: '#86efac',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  confirmedTagText: {
    color: '#15803d',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  toRecommendationsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ea580c',
    paddingVertical: 14,
    borderRadius: 10,
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  toRecommendationsBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    marginRight: 6,
  },
  footer: {
    marginTop: 12,
    fontSize: 11,
    color: '#a8a29e',
    textAlign: 'center',
  },
});
