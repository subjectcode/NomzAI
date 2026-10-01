import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  TextInput,
  Alert,
  Linking,
  AppState,
  AppStateStatus,
  ScrollView,
  BackHandler,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { detectIngredientsFromImage } from '../services/api';
import { Ingredient } from '../types';
import { colors, radius, shadows, spacing } from '../theme';

interface ScanBahanScreenProps {
  onNavigateToRecommendations: (confirmedIngredients: string[]) => void;
  onBack?: () => void;
  isActive?: boolean;
}

export function ScanBahanScreen({
  onNavigateToRecommendations,
  onBack,
  isActive = true,
}: ScanBahanScreenProps) {
  // 1. Permission Kamera (Real Android Permission API via expo-camera)
  const [permission, requestPermission] = useCameraPermissions();

  // 2. Camera ref & Flash/Torch state
  const cameraRef = useRef<CameraView>(null);
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);

  // 3. Mode Viewfinder (Foto vs Galeri)
  const [scanMode, setScanMode] = useState<'camera' | 'gallery'>('camera');

  // 4. Status Foto Tertangkap (Mode Konfirmasi)
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewMime, setPreviewMime] = useState<string>('image/jpeg');
  const [previewFileName, setPreviewFileName] = useState<string>('capture.jpg');

  // 5. Status Analisis / Deteksi Bahan
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [detectionError, setDetectionError] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  // 6. Input Bahan Manual & Edit
  const [isManualInputOpen, setIsManualInputOpen] = useState<boolean>(false);
  const [newIngredientName, setNewIngredientName] = useState<string>('');
  const [editingIngredientId, setEditingIngredientId] = useState<string | null>(null);

  // 7. App State & Lifecycle (Release camera resources when backgrounded)
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      setAppState(nextAppState);
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        setIsTorchOn(false);
      }
    });
    return () => {
      subscription.remove();
    };
  }, []);

  // Request permission saat masuk Scan jika belum diberikan
  useEffect(() => {
    if (isActive && permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [isActive, permission, requestPermission]);

  // Handle hardware back button
  useEffect(() => {
    const onBackPress = () => {
      if (previewImage) {
        handleCancelPreview();
        return true;
      }
      if (isManualInputOpen) {
        setIsManualInputOpen(false);
        return true;
      }
      if (onBack) {
        onBack();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backHandler.remove();
  }, [previewImage, isManualInputOpen, onBack]);

  // Flash / Torch toggle
  const handleToggleFlash = useCallback(() => {
    setIsTorchOn((prev) => !prev);
  }, []);

  // Shutter Capture -> Enter Photo Confirmation
  const handleShutterCapture = async () => {
    if (isCapturing || !cameraRef.current) return;
    setIsCapturing(true);
    setDetectionError(null);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        skipProcessing: true,
      });

      if (photo && photo.uri) {
        setPreviewImage(photo.uri);
        setPreviewMime('image/jpeg');
        setPreviewFileName(`nomz_scan_${Date.now()}.jpg`);
        setIsTorchOn(false);
      }
    } catch (err: any) {
      Alert.alert('Gagal Mengambil Foto', err.message || 'Tidak dapat mengambil foto dari kamera.');
    } finally {
      setIsCapturing(false);
    }
  };

  // Gallery Picker -> Enter Photo Confirmation
  const handleOpenGallery = async () => {
    setDetectionError(null);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setPreviewImage(asset.uri);
        setPreviewMime(asset.mimeType || 'image/jpeg');
        setPreviewFileName(asset.fileName || `nomz_gallery_${Date.now()}.jpg`);
        setScanMode('gallery');
      } else {
        // Safe return on cancellation
        setScanMode('camera');
      }
    } catch (err: any) {
      Alert.alert('Gagal Membuka Galeri', err.message || 'Tidak dapat memilih foto.');
      setScanMode('camera');
    }
  };

  // Batalkan Foto / Foto Ulang
  const handleCancelPreview = () => {
    setPreviewImage(null);
    setDetectionError(null);
    setIngredients([]);
    setScanMode('camera');
  };

  // Konfirmasi Foto -> Deteksi Bahan
  const handleConfirmAndDetect = async () => {
    if (!previewImage || isDetecting) return;
    setIsDetecting(true);
    setDetectionError(null);

    try {
      const detected = await detectIngredientsFromImage(previewImage, previewMime, previewFileName);
      setIngredients(detected);
      if (detected.length === 0) {
        setDetectionError(
          'Tidak ada bahan makanan yang terdeteksi. Silakan coba foto ulang dengan pencahayaan lebih jelas atau tambah bahan secara manual.'
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

  // Tambah bahan manual
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

  // Lanjut ke Rekomendasi Resep
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

  // Bantuan / Panduan Pindai
  const handleHelpGuide = () => {
    Alert.alert(
      'Panduan Pindai Bahan',
      'Arahkan kamera ke bahan makanan segar, kulkas, atau meja dapur Anda.\n\nTips:\n• Pastikan pencahayaan cukup terang\n• Tata bahan agar tidak saling menumpuk\n• Anda dapat memeriksa hasil atau menambah bahan setelah foto dikonfirmasi'
    );
  };

  // Buka pengaturan izin sistem Android
  const handleOpenSettings = () => {
    Linking.openSettings();
  };

  // Tentukan apakah live camera harus aktif
  const isCameraActive =
    isActive &&
    appState === 'active' &&
    scanMode === 'camera' &&
    !previewImage &&
    ingredients.length === 0;

  // -------------------------------------------------------------------------
  // KASUS 1: HASIL DETEKSI (Bahan Terdeteksi Siap Dikonfirmasi)
  // -------------------------------------------------------------------------
  if (ingredients.length > 0 || (detectionError && previewImage)) {
    return (
      <View style={styles.resultsContainer}>
        {/* Top Bar Ringkas */}
        <View style={styles.resultsTopBar}>
          <TouchableOpacity
            style={styles.topBarIconBtn}
            onPress={handleCancelPreview}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.resultsTopBarTitle}>Hasil Deteksi Bahan</Text>
          <TouchableOpacity style={styles.topBarIconBtn} onPress={handleHelpGuide} activeOpacity={0.7}>
            <Feather name="help-circle" size={19} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.resultsScroll}
          contentContainerStyle={styles.resultsScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Preview Thumbnail & Retake */}
          {previewImage && (
            <View style={styles.thumbCardRow}>
              <Image source={{ uri: previewImage }} style={styles.thumbImage} resizeMode="cover" />
              <View style={styles.thumbInfoWrap}>
                <Text style={styles.thumbTitle}>Foto Bahan Terpilih</Text>
                <Text style={styles.thumbSubtitle}>
                  {ingredients.length > 0
                    ? `${ingredients.length} bahan dikenali`
                    : 'Belum ada bahan dikenali'}
                </Text>
                <TouchableOpacity
                  style={styles.retakeMiniBtn}
                  onPress={handleCancelPreview}
                  activeOpacity={0.8}
                >
                  <Feather name="camera" size={12} color={colors.primary} style={{ marginRight: 4 }} />
                  <Text style={styles.retakeMiniText}>Foto Ulang</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Error Banner jika ada */}
          {detectionError && (
            <View style={styles.errorNoticeBox}>
              <Feather name="alert-circle" size={16} color={colors.error} style={{ marginRight: 8 }} />
              <Text style={styles.errorNoticeText}>{detectionError}</Text>
            </View>
          )}

          {/* Section Bahan Terdeteksi */}
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

          {/* Grid Bahan Makanan */}
          <View style={styles.ingredientGrid}>
            {ingredients.map((item) => {
              const isEditing = editingIngredientId === item.id;
              return (
                <View key={item.id} style={styles.ingredientCard}>
                  <View style={styles.ingredientIconCircle}>
                    <Feather name="check" size={16} color={colors.primary} />
                  </View>

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

            {/* Slot Tambah Cepat */}
            <TouchableOpacity
              style={styles.addIngredientSlot}
              onPress={() => setIsManualInputOpen(true)}
              activeOpacity={0.7}
            >
              <Feather name="plus" size={20} color={colors.primary} />
              <Text style={styles.addSlotText}>Tambah Bahan</Text>
            </TouchableOpacity>
          </View>

          {/* Tombol Utama: Rekomendasi Resep */}
          <TouchableOpacity
            style={styles.primaryPillButton}
            onPress={handleProceedToRecommendations}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryPillBtnText}>Lihat Rekomendasi Resep</Text>
            <Feather name="arrow-right" size={17} color="#FFFFFF" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // -------------------------------------------------------------------------
  // KASUS 2: PHOTO CONFIRMATION MODE (Setelah Shutter atau Pilih Galeri)
  // -------------------------------------------------------------------------
  if (previewImage) {
    return (
      <View style={styles.fullCameraContainer}>
        <Image source={{ uri: previewImage }} style={StyleSheet.absoluteFill} resizeMode="contain" />

        {/* Top Header Overlay */}
        <View style={styles.cameraHeaderOverlay}>
          <TouchableOpacity
            style={styles.headerGlassIconBtn}
            onPress={handleCancelPreview}
            activeOpacity={0.8}
          >
            <Feather name="x" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.confirmationPill}>
            <Text style={styles.confirmationPillText}>Konfirmasi Foto</Text>
          </View>
          <TouchableOpacity style={styles.headerGlassIconBtn} onPress={handleHelpGuide} activeOpacity={0.8}>
            <Feather name="help-circle" size={19} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Loading Overlay Saat AI Deteksi */}
        {isDetecting && (
          <View style={styles.detectingOverlay}>
            <View style={styles.detectingCard}>
              <ActivityIndicator size="large" color={colors.primary} style={{ marginBottom: 14 }} />
              <Text style={styles.detectingTitle}>Mengenali Bahan Makanan...</Text>
              <Text style={styles.detectingSubtitle}>
                Nomz AI sedang mengidentifikasi bahan pada foto Anda
              </Text>
            </View>
          </View>
        )}

        {/* Bottom Confirmation Action Sheet */}
        {!isDetecting && (
          <View style={styles.confirmationBottomBar}>
            <Text style={styles.confirmationHint}>Pastikan bahan makanan terlihat jelas</Text>
            <View style={styles.confirmationBtnRow}>
              {/* Tombol Batal / Foto Ulang */}
              <TouchableOpacity
                style={styles.cancelActionBtn}
                onPress={handleCancelPreview}
                activeOpacity={0.85}
              >
                <Feather name="x" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.cancelActionText}>Foto Ulang</Text>
              </TouchableOpacity>

              {/* Tombol Konfirmasi / Gunakan Foto */}
              <TouchableOpacity
                style={styles.confirmActionBtn}
                onPress={handleConfirmAndDetect}
                activeOpacity={0.85}
              >
                <Feather name="check" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.confirmActionText}>Gunakan Foto</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  }

  // -------------------------------------------------------------------------
  // KASUS 3: IZIN KAMERA BELUM DIBERIKAN / DITOLAK
  // -------------------------------------------------------------------------
  if (!permission || !permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        {/* Top Header */}
        <View style={styles.permissionTopBar}>
          {onBack ? (
            <TouchableOpacity style={styles.topBarIconBtn} onPress={onBack} activeOpacity={0.7}>
              <Feather name="arrow-left" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 36 }} />
          )}
          <Text style={styles.permissionTitle}>Pindai Bahan</Text>
          <TouchableOpacity style={styles.topBarIconBtn} onPress={handleHelpGuide} activeOpacity={0.7}>
            <Feather name="help-circle" size={19} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Kartu Izin */}
        <View style={styles.permissionCard}>
          <View style={styles.permissionIconCircle}>
            <Feather name="camera" size={36} color={colors.primary} />
          </View>
          <Text style={styles.permissionHeading}>Izin Kamera Diperlukan</Text>
          <Text style={styles.permissionBody}>
            Nomz memerlukan izin akses kamera agar Anda dapat memindai bahan makanan langsung dari kulkas atau meja dapur Anda secara instan.
          </Text>

          {/* Tombol Aksi Izin */}
          {permission && !permission.canAskAgain ? (
            <TouchableOpacity
              style={styles.permissionPrimaryBtn}
              onPress={handleOpenSettings}
              activeOpacity={0.85}
            >
              <Feather name="settings" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.permissionPrimaryBtnText}>Buka Pengaturan Perangkat</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.permissionPrimaryBtn}
              onPress={requestPermission}
              activeOpacity={0.85}
            >
              <Feather name="check-circle" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.permissionPrimaryBtnText}>Izinkan Akses Kamera</Text>
            </TouchableOpacity>
          )}

          {/* Alternatif Galeri */}
          <TouchableOpacity
            style={styles.permissionSecondaryBtn}
            onPress={handleOpenGallery}
            activeOpacity={0.85}
          >
            <Feather name="image" size={18} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={styles.permissionSecondaryBtnText}>Pilih Foto dari Galeri</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // -------------------------------------------------------------------------
  // KASUS 4: LIVE MOBILE CAMERA EXPERIENCE (Default Hero Experience)
  // -------------------------------------------------------------------------
  return (
    <View style={styles.fullCameraContainer}>
      {/* Live Camera View (Fills entire usable area above bottom nav) */}
      {isCameraActive && (
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing="back"
          enableTorch={isTorchOn}
          flash={isTorchOn ? 'on' : 'off'}
        />
      )}

      {/* Viewfinder Framing Overlay (Corner Brackets) */}
      <View style={styles.framingContainer} pointerEvents="none">
        <View style={styles.framingBox}>
          <View style={styles.frameCornerTopLeft} />
          <View style={styles.frameCornerTopRight} />
          <View style={styles.frameCornerBottomLeft} />
          <View style={styles.frameCornerBottomRight} />
        </View>
      </View>

      {/* Top Overlay Bar */}
      <View style={styles.cameraHeaderOverlay}>
        {onBack ? (
          <TouchableOpacity style={styles.headerGlassIconBtn} onPress={onBack} activeOpacity={0.8}>
            <Feather name="arrow-left" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}

        <View style={styles.cameraTitlePill}>
          <Text style={styles.cameraTitlePillText}>Pindai Bahan</Text>
        </View>

        <TouchableOpacity
          style={styles.headerGlassIconBtn}
          onPress={handleHelpGuide}
          activeOpacity={0.8}
          accessibilityLabel="Bantuan Pindai"
        >
          <Feather name="help-circle" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Floating Guidance Badge */}
      <View style={styles.guidancePillWrap} pointerEvents="none">
        <View style={styles.guidancePill}>
          <Text style={styles.guidancePillText}>Arahkan kamera ke bahan makanan</Text>
        </View>
      </View>

      {/* Bottom Controls Area (Overlay directly above bottom nav) */}
      <View style={styles.bottomControlsWrapper}>
        {/* Shutter & Flash Row */}
        <View style={styles.controlsRow}>
          {/* Flash Button */}
          <TouchableOpacity
            style={[styles.controlGlassBtn, isTorchOn && styles.controlGlassBtnActive]}
            onPress={handleToggleFlash}
            activeOpacity={0.8}
            accessibilityLabel={isTorchOn ? 'Matikan Lampu Flash' : 'Nyalakan Lampu Flash'}
          >
            <Feather
              name={isTorchOn ? 'zap' : 'zap-off'}
              size={22}
              color={isTorchOn ? colors.warmYellow : '#FFFFFF'}
            />
          </TouchableOpacity>

          {/* Big Circular Camera Shutter Button */}
          <TouchableOpacity
            style={[styles.shutterOuterRing, isCapturing && { opacity: 0.6 }]}
            onPress={handleShutterCapture}
            disabled={isCapturing}
            activeOpacity={0.85}
            accessibilityLabel="Ambil Foto Bahan"
          >
            <View style={styles.shutterInnerCircle} />
          </TouchableOpacity>

          {/* Symmetrical Balanced Spacer */}
          <View style={{ width: 48, height: 48 }} />
        </View>

        {/* ONE Clear Gallery Entry: Mode Switcher FOTO | GALERI */}
        <View style={styles.modeSwitchRow}>
          <TouchableOpacity
            style={[styles.modeTab, scanMode === 'camera' && styles.modeTabActive]}
            onPress={() => setScanMode('camera')}
            activeOpacity={0.8}
          >
            <Text style={[styles.modeTabText, scanMode === 'camera' && styles.modeTabTextActive]}>
              FOTO
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeTab, scanMode === 'gallery' && styles.modeTabActive]}
            onPress={handleOpenGallery}
            activeOpacity={0.8}
          >
            <Text style={[styles.modeTabText, scanMode === 'gallery' && styles.modeTabTextActive]}>
              GALERI
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // -------------------------------------------------------------------------
  // FULL CAMERA STYLES
  // -------------------------------------------------------------------------
  fullCameraContainer: {
    flex: 1,
    backgroundColor: '#000000',
    position: 'relative',
    overflow: 'hidden',
  },
  cameraHeaderOverlay: {
    position: 'absolute',
    top: 12,
    left: 16,
    right: 16,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerGlassIconBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cameraTitlePill: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: radius.full,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cameraTitlePillText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  guidancePillWrap: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 15,
  },
  guidancePill: {
    backgroundColor: 'rgba(15, 118, 110, 0.85)',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.lightMint,
  },
  guidancePillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  // Viewfinder Framing Guides
  framingContainer: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  framingBox: {
    width: '75%',
    aspectRatio: 1,
    position: 'relative',
  },
  frameCornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 32,
    height: 32,
    borderTopWidth: 3.5,
    borderLeftWidth: 3.5,
    borderColor: '#FFFFFF',
    borderTopLeftRadius: 8,
  },
  frameCornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 32,
    height: 32,
    borderTopWidth: 3.5,
    borderRightWidth: 3.5,
    borderColor: '#FFFFFF',
    borderTopRightRadius: 8,
  },
  frameCornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 32,
    height: 32,
    borderBottomWidth: 3.5,
    borderLeftWidth: 3.5,
    borderColor: '#FFFFFF',
    borderBottomLeftRadius: 8,
  },
  frameCornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderBottomWidth: 3.5,
    borderRightWidth: 3.5,
    borderColor: '#FFFFFF',
    borderBottomRightRadius: 8,
  },
  // Bottom Controls
  bottomControlsWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 25,
    paddingBottom: 16,
    paddingTop: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  controlGlassBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  controlGlassBtnActive: {
    backgroundColor: 'rgba(255, 179, 115, 0.3)',
    borderColor: colors.softOrange,
  },
  shutterOuterRing: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    ...shadows.level3,
  },
  shutterInnerCircle: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: '#FFFFFF',
  },
  modeSwitchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
  },
  modeTab: {
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  modeTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.freshMint,
  },
  modeTabText: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  modeTabTextActive: {
    color: '#FFFFFF',
  },
  // -------------------------------------------------------------------------
  // CONFIRMATION OVERLAYS
  // -------------------------------------------------------------------------
  confirmationPill: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  confirmationPillText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  confirmationBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    zIndex: 30,
  },
  confirmationHint: {
    color: '#E5E7EB',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 14,
    textAlign: 'center',
  },
  confirmationBtnRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  cancelActionBtn: {
    flex: 1,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  confirmActionBtn: {
    flex: 1.2,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.level2,
  },
  confirmActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  detectingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 40,
    paddingHorizontal: 32,
  },
  detectingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
    ...shadows.level3,
  },
  detectingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
  },
  detectingSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  // -------------------------------------------------------------------------
  // PERMISSION SCREEN
  // -------------------------------------------------------------------------
  permissionContainer: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
  },
  permissionTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginBottom: 16,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  permissionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.level2,
  },
  permissionIconCircle: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: colors.mintSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  permissionHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  permissionBody: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
  },
  permissionPrimaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    width: '100%',
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    ...shadows.level2,
  },
  permissionPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  permissionSecondaryBtn: {
    backgroundColor: colors.mintSoft,
    borderRadius: radius.full,
    width: '100%',
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.lightMint,
  },
  permissionSecondaryBtnText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  // -------------------------------------------------------------------------
  // DETECTION RESULTS
  // -------------------------------------------------------------------------
  resultsContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  resultsTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resultsTopBarTitle: {
    fontSize: 17,
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
  resultsScroll: {
    flex: 1,
  },
  resultsScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  thumbCardRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: 12,
    marginBottom: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.level1,
  },
  thumbImage: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: '#000000',
  },
  thumbInfoWrap: {
    marginLeft: 12,
    flex: 1,
  },
  thumbTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  thumbSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 6,
  },
  retakeMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.mintSoft,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.lightMint,
  },
  retakeMiniText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
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
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.lightMint,
    ...shadows.level1,
  },
  manualTextInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.textPrimary,
  },
  manualAddBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manualAddBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  ingredientGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  ingredientCard: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.level1,
  },
  ingredientIconCircle: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.mintSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  ingredientNameText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  inlineEditInput: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    paddingVertical: 0,
    width: '100%',
  },
  deleteBadgeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIngredientSlot: {
    width: '31%',
    backgroundColor: colors.mintSoft,
    borderRadius: radius.lg,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.freshMint,
  },
  addSlotText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 4,
    textAlign: 'center',
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
});
