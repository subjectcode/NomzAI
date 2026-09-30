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
  GuidedCookingScreen,
  TersimpanScreen,
  JelajahiScreen,
  PantryScreen,
  HistoryScreen,
  PlannerScreen,
  ProfileScreen,
  EditProfileScreen,
  SettingsScreen,
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
import { initializeGoogleAuth } from './src/services/googleAuth';

type CookingStep = 'scan' | 'recommendations' | 'detail' | 'guided_cooking';
type ModalSubScreen = 'none' | 'profile' | 'pantry' | 'history' | 'planner' | 'edit_profile' | 'settings';
type AuthSubScreen = 'welcome' | 'login' | 'register';

function MainApp() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  // Status onboarding lokal (AsyncStorage)
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean | null>(null);

  // Sub-layar alur autentikasi (welcome | login | register)
  const [authSubScreen, setAuthSubScreen] = useState<AuthSubScreen>('login');

  // State Navigasi Tab Utama (Beranda | Jelajahi | Scan | Tersimpan)
  const [activeTab, setActiveTab] = useState<TabRoute>('beranda');

  // Modal / Sub-layar tingkat atas (profile | pantry | history | planner | none)
  const [subScreen, setSubScreen] = useState<ModalSubScreen>('none');

  // State Alur Memasak (Core Cooking Flow: Scan -> Rekomendasi -> Detail -> Guided)
  const [cookingStep, setCookingStep] = useState<CookingStep>('scan');
  const [activeIngredients, setActiveIngredients] = useState<string[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeRecommendation | null>(null);

  // Periksa status onboarding lokal saat startup
  useEffect(() => {
    initializeGoogleAuth();
    let isMounted = true;
    getOnboardingCompleted()
      .then((completed) => {
        if (isMounted) {
          setIsOnboardingCompleted(completed);
          if (!completed) {
            setAuthSubScreen('welcome');
          } else {
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

    return (
      <LoginScreen
        onNavigateToRegister={() => setAuthSubScreen('register')}
        onNavigateToWelcome={() => setAuthSubScreen('welcome')}
      />
    );
  }

  // 4. MAIN APP: Onboarding selesai & terautentikasi (Aplikasi Utama Nomz)
  const handleStartScan = () => {
    setSubScreen('none');
    setActiveTab('scan');
    setCookingStep('scan');
  };

  const handleNavigateToRecommendations = (ingredients: string[]) => {
    setSubScreen('none');
    setActiveIngredients(ingredients);
    setActiveTab('scan');
    setCookingStep('recommendations');
  };

  const handleSelectRecipe = (recipe: RecipeRecommendation) => {
    setSelectedRecipe(recipe);
    setCookingStep('detail');
    setActiveTab('scan');
  };

  const handleStartGuidedCooking = (recipe: RecipeRecommendation) => {
    setSelectedRecipe(recipe);
    setCookingStep('guided_cooking');
    setActiveTab('scan');
  };

  const handleGuidedCookingComplete = () => {
    // Selesai memasak -> kembali ke beranda
    setCookingStep('scan');
    setActiveTab('beranda');
    setSubScreen('none');
  };

  const handleBackToRecommendations = () => {
    if (activeIngredients && activeIngredients.length > 0) {
      setCookingStep('recommendations');
    } else {
      setCookingStep('scan');
      setActiveTab('beranda');
    }
  };

  const handleBackToScan = () => {
    setCookingStep('scan');
  };

  const handleSelectTab = (tab: TabRoute) => {
    setSubScreen('none');
    setActiveTab(tab);
    if (tab === 'scan' && cookingStep === 'guided_cooking') {
      setCookingStep('scan');
    }
  };

  // Navigasi Sub-layar (Profile / Pantry / History / Planner)
  const handleOpenProfile = () => setSubScreen('profile');
  const handleOpenPantry = () => setSubScreen('pantry');
  const handleOpenHistory = () => setSubScreen('history');
  const handleOpenPlanner = () => setSubScreen('planner');
  const handleCloseSubScreen = () => setSubScreen('none');

  // Menentukan apakah BottomNavBar harus tampil
  const shouldShowBottomNav =
    subScreen === 'none' &&
    cookingStep !== 'guided_cooking' &&
    !(activeTab === 'scan' && (cookingStep === 'detail' || cookingStep === 'recommendations'));

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.mainContent}>
        {/* SUB-SCREENS (Full modal stack) */}
        {subScreen === 'profile' && (
          <ProfileScreen
            onBack={handleCloseSubScreen}
            onNavigateToEditProfile={() => setSubScreen('edit_profile')}
            onNavigateToPantry={handleOpenPantry}
            onNavigateToHistory={handleOpenHistory}
            onNavigateToPlanner={handleOpenPlanner}
            onNavigateToSaved={() => {
              handleCloseSubScreen();
              setActiveTab('tersimpan');
            }}
            onNavigateToSettings={() => setSubScreen('settings')}
          />
        )}

        {subScreen === 'edit_profile' && (
          <EditProfileScreen
            onBack={() => setSubScreen('profile')}
            onProfileUpdated={() => {
              // Context user is updated reactively
            }}
          />
        )}

        {subScreen === 'settings' && (
          <SettingsScreen
            onBack={() => setSubScreen('profile')}
            onNavigateToEditProfile={() => setSubScreen('edit_profile')}
          />
        )}

        {subScreen === 'pantry' && (
          <PantryScreen
            onBack={handleCloseSubScreen}
            onRescueFromPantry={(ingredients) => {
              handleCloseSubScreen();
              handleNavigateToRecommendations(ingredients);
            }}
          />
        )}

        {subScreen === 'history' && (
          <HistoryScreen
            onBack={handleCloseSubScreen}
            onCookAgain={(recipe) => {
              handleCloseSubScreen();
              handleStartGuidedCooking(recipe);
            }}
            onStartScan={handleStartScan}
          />
        )}

        {subScreen === 'planner' && (
          <PlannerScreen
            onBack={handleCloseSubScreen}
            onSelectRecipe={(recipe) => {
              handleCloseSubScreen();
              handleSelectRecipe(recipe);
            }}
            onExploreRecipes={() => {
              handleCloseSubScreen();
              setActiveTab('jelajahi');
            }}
          />
        )}

        {/* MAIN TABS (When no subscreen is active) */}
        {subScreen === 'none' && (
          <>
            {/* TAB: Beranda */}
            {activeTab === 'beranda' && (
              <BerandaScreen
                onStartScan={handleStartScan}
                onOpenProfile={handleOpenProfile}
                onOpenPantry={handleOpenPantry}
                onOpenExplore={() => setActiveTab('jelajahi')}
                onSelectRecipe={handleSelectRecipe}
              />
            )}

            {/* TAB: Jelajahi */}
            {activeTab === 'jelajahi' && (
              <JelajahiScreen
                onSelectCategoryIngredients={(ingredients) => {
                  handleNavigateToRecommendations(ingredients);
                }}
                onStartScan={handleStartScan}
              />
            )}

            {/* TAB: Tersimpan */}
            {activeTab === 'tersimpan' && (
              <TersimpanScreen
                isActive={activeTab === 'tersimpan'}
                onSelectRecipe={handleSelectRecipe}
                onExplore={() => setActiveTab('jelajahi')}
              />
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
                    onStartCooking={handleStartGuidedCooking}
                  />
                )}
                {cookingStep === 'guided_cooking' && selectedRecipe && (
                  <GuidedCookingScreen
                    recipe={selectedRecipe}
                    onBack={() => setCookingStep('detail')}
                    onComplete={handleGuidedCookingComplete}
                  />
                )}
              </>
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
