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
import { colors, radius, shadows, spacing } from '../theme';

type BackendStatus = 'idle' | 'checking' | 'connected' | 'failed';
type ScanMode = 'camera' | 'gallery';

interface ScanBahanScreenProps {
  onNavigateToRecommendations: (confirmedIngredients: string[]) => void;
  onBack?: () => void;
}

export function ScanBahanScreen({
  onNavigateToRecommendations,
  onBack,
}: ScanBahanScreenProps) {
  // Status Backend
  const [backendStatus, setBackendStatus] = useState<BackendStatus>('idle');
  const [backendMessage, setBackendMessage] = useState<string>('');

  // Mode Viewfinder (Foto vs Galeri)
  const [scanMode, setScanMode] = useState<ScanMode>('camera');

  // Status Foto Terpilih
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>('image/jpeg');
  const [imageFileName, setImageFileName] = useState<string>('food.jpg');

  // Status Analisis
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [detectionError, setDetectionError] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  // Input Bahan Manual & Mode Edit
  const [isManualInputOpen, setIsManualInputOpen] = useState<boolean>(false);
  const [newIngredientName, setNewIngredientName] = useState<string>('');
  const [editingIngredientId, setEditingIngredientId] = useState<string | null>(null);

  // Status Bahan Dikonfirmasi
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

  // Mengambil foto langsung dengan kamera
  const handleTakePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Izin Kamera Diperlukan',
          'Nomz memerlukan akses ke kamera untuk memindai bahan makanan langsung. Silakan aktifkan izin kamera pada Pengaturan perangkat Anda.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedImage(asset.uri);
        setImageMime(asset.mimeType || 'image/jpeg');
        setImageFileName(asset.fileName || 'camera_food.jpg');
        setIngredients([]);
        setDetectionError(null);
        setConfirmedIngredients(null);
      }
    } catch (err: any) {
      Alert.alert('Gagal Mengambil Foto', err.message || 'Tidak dapat membuka kamera.');
    }
  };

  // Memilih foto dari galeri
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

  // Memilih contoh foto cepat
  const handleSelectSample = (sampleDataUrl: string, sampleName: string) => {
    setSelectedImage(sampleDataUrl);
    setImageMime('image/jpeg');
    setImageFileName(`${sampleName}.jpg`);
    setIngredients([]);
    setDetectionError(null);
    setConfirmedIngredients(null);
  };

  // Deteksi Bahan Otomatis
  const handleDetectIngredients = async () => {
    if (!selectedImage) return;

    setIsDetecting(true);
    setDetectionError(null);
    setConfirmedIngredients(null);

    try {
      const detected = await detectIngredientsFromImage(selectedImage, imageMime, imageFileName);
      setIngredients(detected);
      if (detected.length === 0) {
        setDetectionError(
          'Tidak ada bahan makanan yang terdeteksi. Anda dapat menambahkan bahan secara manual di bawah.'
        );
      }
    } catch (err: any) {
      setDetectionError(err.message || 'Gagal mendeteksi bahan. Periksa koneksi backend.');
    } finally {
      setIsDetecting(false);
    }
  };

  // Inline edit bahan
  const handleEditIngredient = (id: string, newName: string) => {
    setIngredients((prev) =>
      prev.map((item) => (item.id === id ? { ...item, name: newName } : item))
    );
  };

  // Hapus bahan
  const handleDeleteIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((item) => item.id !== id));
  };

  // Tambah bahan baru secara manual
  const handleAddIngredient = () => {
    const trimmed = newIngredientName.trim();
    if (!trimmed) return;

    const newItem: Ingredient = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: trimmed.toLowerCase(),
      confidence: 1.0,
    };

    setIngredients((prev) => [...prev, newItem]);
    setNewIngredientName('');
    setIsManualInputOpen(false);
  };

  // Lanjutkan ke Rekomendasi
  const handleProceedToRecommendations = () => {
    const validList = ingredients
      .map((i) => i.name.trim())
      .filter((name) => name.length > 0);

    if (validList.length === 0) {
      Alert.alert('Perhatian', 'Harap sediakan minimal satu bahan makanan untuk mencari resep.');
      return;
    }

    onNavigateToRecommendations(validList);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. TOP BAR (Reference UI Screen 2 "Pindai Bahan") */}
      <View style={styles.topBar}>
        {onBack ? (
          <TouchableOpacity style={styles.topBarIconBtn} onPress={onBack} activeOpacity={0.7}>
            <Feather name="arrow-left" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}
        <Text style={styles.topBarTitle}>Pindai Bahan</Text>
        <TouchableOpacity
          style={styles.topBarIconBtn}
          onPress={() =>
            Alert.alert(
              'Panduan Pindai',
              'Arahkan kamera ke meja dapur atau kulkas Anda. Pastikan pencahayaan cukup agar bahan dapat dikenali dengan akurat.'
            )
          }
          activeOpacity={0.7}
        >
          <Feather name="help-circle" size={19} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* 2. VIEWFINDER CAMERA AREA (Reference UI Screen 2) */}
      <View style={styles.viewfinderCard}>
        {selectedImage ? (
          <View style={styles.previewImageContainer}>
            <Image
              source={{ uri: selectedImage }}
              style={styles.previewImage}
              resizeMode="cover"
            />
            {/* Viewfinder Frame Overlay */}
            <View style={styles.frameCornerTopLeft} />
            <View style={styles.frameCornerTopRight} />
            <View style={styles.frameCornerBottomLeft} />
            <View style={styles.frameCornerBottomRight} />

            {/* Retake Floating Overlay Pill */}
            <View style={styles.retakeOverlay}>
              <TouchableOpacity
                style={styles.retakeBtn}
                onPress={handleTakePhoto}
                activeOpacity={0.8}
              >
                <Feather name="camera" size={13} color="#FFFFFF" style={{ marginRight: 5 }} />
                <Text style={styles.retakeBtnText}>Foto Ulang</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.cameraPlaceholder}>
            {/* Corner Framing Markers */}
            <View style={styles.frameCornerTopLeft} />
            <View style={styles.frameCornerTopRight} />
            <View style={styles.frameCornerBottomLeft} />
            <View style={styles.frameCornerBottomRight} />

            <Feather name="camera" size={38} color={colors.lightMint} style={{ marginBottom: 12 }} />
            <Text style={styles.viewfinderInstruction}>
              Arahkan kamera ke bahan makanan
            </Text>
            <Text style={styles.viewfinderSubtext}>
              Sayuran, telur, tahu, atau bahan yang ada di kulkas
            </Text>
          </View>
        )}

        {/* 3. SHUTTER & SELECTION CONTROLS (Reference UI Screen 2) */}
        <View style={styles.controlsRow}>
          {/* Gallery Button */}
          <TouchableOpacity
            style={styles.controlSideBtn}
            onPress={handlePickImage}
            activeOpacity={0.8}
            accessibilityLabel="Pilih dari Galeri"
          >
            <Feather name="image" size={22} color={colors.primary} />
          </TouchableOpacity>

          {/* Big Circular Camera Shutter Button */}
          <TouchableOpacity
            style={styles.shutterOuterRing}
            onPress={handleTakePhoto}
            activeOpacity={0.85}
            accessibilityLabel="Ambil Foto Bahan"
          >
            <View style={styles.shutterInnerCircle} />
          </TouchableOpacity>

          {/* Quick Sample Selector */}
          <TouchableOpacity
            style={styles.controlSideBtn}
            onPress={() => handleSelectSample(SAMPLE_INGREDIENTS_DATA_URL, 'telur_tomat')}
            activeOpacity={0.8}
            accessibilityLabel="Contoh Foto Tes"
          >
            <Feather name="zap" size={20} color={colors.orangeDark} />
          </TouchableOpacity>
        </View>

        {/* Mode Switcher: FOTO | GALERI */}
        <View style={styles.modeSwitchRow}>
          <TouchableOpacity
            style={[styles.modeTab, scanMode === 'camera' && styles.modeTabActive]}
            onPress={() => {
              setScanMode('camera');
              handleTakePhoto();
            }}
          >
            <Text style={[styles.modeTabText, scanMode === 'camera' && styles.modeTabTextActive]}>
              FOTO
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeTab, scanMode === 'gallery' && styles.modeTabActive]}
            onPress={() => {
              setScanMode('gallery');
              handlePickImage();
            }}
          >
            <Text style={[styles.modeTabText, scanMode === 'gallery' && styles.modeTabTextActive]}>
              GALERI
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* CTA DETEKSI BAHAN (Muncul jika foto sudah dipilih dan belum dianalisis) */}
      {selectedImage && ingredients.length === 0 && (
        <View style={styles.detectCtaWrap}>
          <TouchableOpacity
            style={[styles.primaryPillButton, isDetecting && styles.buttonDisabled]}
            onPress={handleDetectIngredients}
            disabled={isDetecting}
            activeOpacity={0.85}
          >
            {isDetecting ? (
              <View style={styles.btnRow}>
                <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.primaryPillBtnText}>Mengenali Bahan...</Text>
              </View>
            ) : (
              <View style={styles.btnRow}>
                <Feather name="search" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.primaryPillBtnText}>Deteksi Bahan Makanan</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Error Banner jika deteksi gagal */}
      {detectionError && (
        <View style={styles.errorNoticeBox}>
          <Feather name="alert-circle" size={16} color={colors.error} style={{ marginRight: 8 }} />
          <Text style={styles.errorNoticeText}>{detectionError}</Text>
        </View>
      )}

      {/* 4. HASIL DETEKSI (Reference UI Screen 3) */}
      {(ingredients.length > 0 || isManualInputOpen) && (
        <View style={styles.detectionResultSection}>
          <View style={styles.detectionHeaderRow}>
            <View>
              <Text style={styles.detectionTitle}>Bahan yang Terdeteksi</Text>
              <Text style={styles.detectionSubtitle}>
                {ingredients.length} bahan siap diolah
              </Text>
            </View>

            <TouchableOpacity
              style={styles.addManualPill}
              onPress={() => setIsManualInputOpen(!isManualInputOpen)}
              activeOpacity={0.8}
            >
              <Feather
                name={isManualInputOpen ? 'x' : 'plus'}
                size={14}
                color={colors.primary}
                style={{ marginRight: 4 }}
              />
              <Text style={styles.addManualPillText}>
                {isManualInputOpen ? 'Tutup' : 'Tambah'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Tambah Bahan Manual */}
          {isManualInputOpen && (
            <View style={styles.manualInputCard}>
              <TextInput
                style={styles.manualTextInput}
                placeholder="Contoh: telur, bayam, wortel"
                placeholderTextColor={colors.textMuted}
                value={newIngredientName}
                onChangeText={setNewIngredientName}
                onSubmitEditing={handleAddIngredient}
                autoFocus
              />
              <TouchableOpacity
                style={styles.manualAddBtn}
                onPress={handleAddIngredient}
                activeOpacity={0.8}
              >
                <Text style={styles.manualAddBtnText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Grid Bahan Makanan (3 Kolom sesuai Reference UI Screen 3) */}
          <View style={styles.ingredientGrid}>
            {ingredients.map((item, index) => {
              const isEditing = editingIngredientId === item.id;
              return (
                <View key={item.id} style={styles.ingredientCard}>
                  {/* Icon Avatar */}
                  <View style={styles.ingredientIconCircle}>
                    <Feather name="check" size={16} color={colors.primary} />
                  </View>

                  {/* Name or Inline Input */}
                  {isEditing ? (
                    <TextInput
                      style={styles.inlineEditInput}
                      value={item.name}
                      onChangeText={(val) => handleEditIngredient(item.id, val)}
                      onBlur={() => setEditingIngredientId(null)}
                      autoFocus
                    />
                  ) : (
                    <Text
                      style={styles.ingredientNameText}
                      numberOfLines={1}
                      onPress={() => setEditingIngredientId(item.id)}
                    >
                      {item.name}
                    </Text>
                  )}

                  {/* Delete Button */}
                  <TouchableOpacity
                    style={styles.deleteBadgeBtn}
                    onPress={() => handleDeleteIngredient(item.id)}
                    activeOpacity={0.7}
                    accessibilityLabel={`Hapus ${item.name}`}
                  >
                    <Feather name="x" size={12} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
              );
            })}

            {/* Quick Add Card Slot */}
            <TouchableOpacity
              style={styles.addIngredientSlot}
              onPress={() => setIsManualInputOpen(true)}
              activeOpacity={0.7}
            >
              <Feather name="plus" size={20} color={colors.primary} />
              <Text style={styles.addSlotText}>Tambah Bahan</Text>
            </TouchableOpacity>
          </View>

          {/* 5. PRIMARY CTA: LIHAT REKOMENDASI RESEP (Reference UI Screen 3) */}
          <TouchableOpacity
            style={styles.primaryPillButton}
            onPress={handleProceedToRecommendations}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryPillBtnText}>Lihat Rekomendasi Resep</Text>
            <Feather name="arrow-right" size={17} color="#FFFFFF" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>
      )}

      {/* 6. CONTOH FOTO PENGUJIAN INSTAN (Reference UI Screen 3 Bottom) */}
      <View style={styles.sampleSection}>
        <View style={styles.sampleHeaderRow}>
          <Text style={styles.sampleSectionTitle}>Contoh Foto Cepat</Text>
          <Text style={styles.sampleSubtitle}>Untuk pengujian instan</Text>
        </View>
        <View style={styles.sampleCardsRow}>
          <TouchableOpacity
            style={styles.sampleCardItem}
            onPress={() => handleSelectSample(SAMPLE_INGREDIENTS_DATA_URL, 'telur_tomat')}
            activeOpacity={0.8}
          >
            <View style={styles.sampleThumbPlaceholder}>
              <Feather name="image" size={18} color={colors.primary} />
            </View>
            <Text style={styles.sampleCardLabel}>Telur & Tomat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sampleCardItem}
            onPress={() => handleSelectSample(SAMPLE_FRUITS_DATA_URL, 'buah_segar')}
            activeOpacity={0.8}
          >
            <View style={[styles.sampleThumbPlaceholder, { backgroundColor: '#FFF7ED' }]}>
              <Feather name="image" size={18} color={colors.orangeDark} />
            </View>
            <Text style={styles.sampleCardLabel}>Sayur & Buah</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Backend Status Bar */}
      <View style={styles.backendFooter}>
        <View
          style={[
            styles.backendDot,
            backendStatus === 'connected' && styles.dotGreen,
            backendStatus === 'failed' && styles.dotRed,
          ]}
        />
        <Text style={styles.backendText}>
          {backendStatus === 'connected'
            ? `Backend aktif: ${backendMessage}`
            : 'Nomz Vision API Siap'}
        </Text>
        <TouchableOpacity onPress={handleCheckHealth}>
          <Text style={styles.backendCheckText}>
            {backendStatus === 'checking' ? 'Cek...' : 'Cek Status'}
          </Text>
        </TouchableOpacity>
      </View>
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
    paddingTop: 8,
    paddingBottom: 40,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginBottom: 12,
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  topBarIconBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewfinderCard: {
    backgroundColor: '#1E2421',
    borderRadius: radius.xl,
    overflow: 'hidden',
    paddingBottom: 16,
    marginBottom: 20,
    ...shadows.level3,
  },
  previewImageContainer: {
    width: '100%',
    height: 280,
    position: 'relative',
    backgroundColor: '#000000',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  cameraPlaceholder: {
    width: '100%',
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    position: 'relative',
    backgroundColor: '#151A17',
  },
  viewfinderInstruction: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  viewfinderSubtext: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
  },
  frameCornerTopLeft: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 28,
    height: 28,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#FFFFFF',
    borderTopLeftRadius: 6,
  },
  frameCornerTopRight: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 28,
    height: 28,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: '#FFFFFF',
    borderTopRightRadius: 6,
  },
  frameCornerBottomLeft: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    width: 28,
    height: 28,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#FFFFFF',
    borderBottomLeftRadius: 6,
  },
  frameCornerBottomRight: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 28,
    height: 28,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: '#FFFFFF',
    borderBottomRightRadius: 6,
  },
  retakeOverlay: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
  },
  retakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 118, 110, 0.9)',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.lightMint,
  },
  retakeBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 16,
    paddingHorizontal: 24,
  },
  controlSideBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: '#2D3531',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3F4944',
  },
  shutterOuterRing: {
    width: 68,
    height: 68,
    borderRadius: radius.full,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  shutterInnerCircle: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    backgroundColor: '#FFFFFF',
  },
  modeSwitchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 14,
  },
  modeTab: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  modeTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.freshMint,
  },
  modeTabText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  modeTabTextActive: {
    color: '#FFFFFF',
  },
  detectCtaWrap: {
    marginBottom: 20,
  },
  primaryPillButton: {
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
  primaryPillBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  errorNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 16,
  },
  errorNoticeText: {
    flex: 1,
    color: colors.error,
    fontSize: 13,
  },
  detectionResultSection: {
    marginBottom: 24,
  },
  detectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  detectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  detectionSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  addManualPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.mintSoft,
    borderWidth: 1,
    borderColor: colors.lightMint,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: radius.full,
  },
  addManualPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  manualInputCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 6,
    marginBottom: 12,
    alignItems: 'center',
  },
  manualTextInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  manualAddBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.sm,
  },
  manualAddBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  ingredientGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  ingredientCard: {
    width: '31%',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: 'center',
    position: 'relative',
    ...shadows.level1,
  },
  ingredientIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.mintSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  ingredientNameText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  inlineEditInput: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    padding: 0,
    minWidth: 50,
  },
  deleteBadgeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIngredientSlot: {
    width: '31%',
    backgroundColor: '#FAF8F3',
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addSlotText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 6,
    textAlign: 'center',
  },
  sampleSection: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: 20,
    ...shadows.level1,
  },
  sampleHeaderRow: {
    marginBottom: 10,
  },
  sampleSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sampleSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
  },
  sampleCardsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  sampleCardItem: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  sampleThumbPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.mintSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  sampleCardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  backendFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  backendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9CA3AF',
    marginRight: 6,
  },
  dotGreen: {
    backgroundColor: colors.success,
  },
  dotRed: {
    backgroundColor: colors.error,
  },
  backendText: {
    flex: 1,
    fontSize: 11,
    color: colors.textMuted,
  },
  backendCheckText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
});
