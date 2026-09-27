import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, SafeAreaView, View } from 'react-native';
import {
  BerandaScreen,
  ScanBahanScreen,
  RekomendasiScreen,
  DetailResepScreen,
} from './src/screens';
import { BottomNavBar, TabRoute } from './src/components';
import { colors } from './src/theme';
import { RecipeRecommendation } from './src/types';

type CookingStep = 'scan' | 'recommendations' | 'detail';

export default function App() {
  // State Navigasi Tab Utama (M5.1: Beranda & Scan aktif; Riwayat & Profil disiapkan untuk M5.3)
  const [activeTab, setActiveTab] = useState<TabRoute>('beranda');

  // State Alur Memasak (Core Cooking Flow: Scan -> Rekomendasi -> Detail)
  const [cookingStep, setCookingStep] = useState<CookingStep>('scan');
  const [activeIngredients, setActiveIngredients] = useState<string[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeRecommendation | null>(null);

  // Navigasi dari Beranda ke Scan Bahan
  const handleStartScanFromHome = () => {
    setActiveTab('scan');
    setCookingStep('scan');
  };

  // Navigasi dari Scan Bahan ke Rekomendasi Resep
  const handleNavigateToRecommendations = (ingredients: string[]) => {
    setActiveIngredients(ingredients);
    setCookingStep('recommendations');
  };

  // Navigasi dari Rekomendasi ke Detail Resep
  const handleSelectRecipe = (recipe: RecipeRecommendation) => {
    setSelectedRecipe(recipe);
    setCookingStep('detail');
  };

  // Kembali dari Detail Resep ke Rekomendasi
  const handleBackToRecommendations = () => {
    setCookingStep('recommendations');
  };

  // Kembali dari Rekomendasi ke Scan Bahan
  const handleBackToScan = () => {
    setCookingStep('scan');
  };

  // Pergantian Tab Bawah
  const handleSelectTab = (tab: TabRoute) => {
    setActiveTab(tab);
    if (tab === 'scan') {
      // Saat membuka tab scan, pastikan berada di layar scan awal
      setCookingStep('scan');
    }
  };

  // Bottom Nav hanya ditampilkan pada top-level screen (Beranda atau Scan awal)
  // Pada sub-screen Rekomendasi & Detail, fokus penuh pada konten dengan TopBar back button
  const shouldShowBottomNav =
    activeTab === 'beranda' || (activeTab === 'scan' && cookingStep === 'scan');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.mainContent}>
        {/* TAB 1: Beranda */}
        {activeTab === 'beranda' && (
          <BerandaScreen onStartScan={handleStartScanFromHome} />
        )}

        {/* TAB 2: Scan & Core Cooking Flow */}
        {activeTab === 'scan' && (
          <>
            {cookingStep === 'scan' && (
              <ScanBahanScreen
                onNavigateToRecommendations={handleNavigateToRecommendations}
              />
            )}
            {cookingStep === 'recommendations' && (
              <RekomendasiScreen
                ingredients={activeIngredients}
                onSelectRecipe={handleSelectRecipe}
                onBack={handleBackToScan}
              />
            )}
            {cookingStep === 'detail' && selectedRecipe && (
              <DetailResepScreen
                recipe={selectedRecipe}
                onBack={handleBackToRecommendations}
              />
            )}
          </>
        )}
      </View>

      {/* Bottom Navigation Bar */}
      {shouldShowBottomNav && (
        <BottomNavBar currentTab={activeTab} onSelectTab={handleSelectTab} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mainContent: {
    flex: 1,
  },
});
