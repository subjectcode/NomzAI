import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context';
import {
  BerandaScreen,
  ScanBahanScreen,
  RekomendasiScreen,
  DetailResepScreen,
  SplashScreen,
  OnboardingScreen,
  AuthWelcomeScreen,
  LoginScreen,
  RegisterScreen,
} from './src/screens';
import { BottomNavBar, TabRoute } from './src/components';
import { colors } from './src/theme';
import { RecipeRecommendation } from './src/types';
import { getOnboardingCompleted } from './src/services/onboardingStorage';

type CookingStep = 'scan' | 'recommendations' | 'detail';
type AuthSubScreen = 'welcome' | 'login' | 'register';

function MainApp() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  // Status onboarding lokal (AsyncStorage)
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean | null>(null);

  // Sub-layar alur autentikasi (welcome | login | register)
  const [authSubScreen, setAuthSubScreen] = useState<AuthSubScreen>('login');

  // State Navigasi Tab Utama (Target: Beranda | Jelajahi | Scan | Tersimpan)
  const [activeTab, setActiveTab] = useState<TabRoute>('beranda');

  // State Alur Memasak (Core Cooking Flow: Scan -> Rekomendasi -> Detail)
  const [cookingStep, setCookingStep] = useState<CookingStep>('scan');
  const [activeIngredients, setActiveIngredients] = useState<string[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeRecommendation | null>(null);

  // Periksa status onboarding lokal saat startup
  useEffect(() => {
    let isMounted = true;
    getOnboardingCompleted()
      .then((completed) => {
        if (isMounted) {
          setIsOnboardingCompleted(completed);
          if (!completed) {
            // Pengguna baru pertama kali instalasi: setelah onboarding masuk ke Welcome
            setAuthSubScreen('welcome');
          } else {
            // Pengguna lama yang belum login: langsung ke Login
            setAuthSubScreen('login');
          }
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsOnboardingCompleted(false);
          setAuthSubScreen('welcome');
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 1. SPLASH: Menunggu resolusi session auth dan onboarding lokal tanpa fake delay
  const isAppLoading = isAuthLoading || isOnboardingCompleted === null;
  if (isAppLoading) {
    return <SplashScreen />;
  }

  // 2. ONBOARDING: Pengguna baru pertama kali membuka aplikasi
  if (!isOnboardingCompleted) {
    return (
      <OnboardingScreen
        onComplete={() => {
          setIsOnboardingCompleted(true);
          setAuthSubScreen('welcome');
        }}
      />
    );
  }

  // 3. AUTH FLOW: Onboarding selesai, namun belum terautentikasi
  if (!isAuthenticated) {
    if (authSubScreen === 'welcome') {
      return (
        <AuthWelcomeScreen
          onNavigateToLogin={() => setAuthSubScreen('login')}
          onNavigateToRegister={() => setAuthSubScreen('register')}
        />
      );
    }

    if (authSubScreen === 'register') {
      return (
        <RegisterScreen
          onNavigateToLogin={() => setAuthSubScreen('login')}
          onNavigateToWelcome={() => setAuthSubScreen('welcome')}
        />
      );
    }

    // Default: LoginScreen
    return (
      <LoginScreen
        onNavigateToRegister={() => setAuthSubScreen('register')}
        onNavigateToWelcome={() => setAuthSubScreen('welcome')}
      />
    );
  }

  // 4. MAIN APP: Onboarding selesai & terautentikasi (Aplikasi Utama Nomz)
  const handleStartScanFromHome = () => {
    setActiveTab('scan');
    setCookingStep('scan');
  };

  const handleNavigateToRecommendations = (ingredients: string[]) => {
    setActiveIngredients(ingredients);
    setCookingStep('recommendations');
  };

  const handleSelectRecipe = (recipe: RecipeRecommendation) => {
    setSelectedRecipe(recipe);
    setCookingStep('detail');
  };

  const handleBackToRecommendations = () => {
    setCookingStep('recommendations');
  };

  const handleBackToScan = () => {
    setCookingStep('scan');
  };

  const handleSelectTab = (tab: TabRoute) => {
    setActiveTab(tab);
    if (tab === 'scan') {
      setCookingStep('scan');
    }
  };

  const shouldShowBottomNav =
    activeTab === 'beranda' || (activeTab === 'scan' && cookingStep === 'scan');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.mainContent}>
        {/* TAB: Beranda */}
        {activeTab === 'beranda' && (
          <BerandaScreen onStartScan={handleStartScanFromHome} />
        )}

        {/* TAB: Scan & Core Cooking Flow */}
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

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </SafeAreaProvider>
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
