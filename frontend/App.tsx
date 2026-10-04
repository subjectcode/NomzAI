import React, { useEffect, useState, useRef, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  View,
  BackHandler,
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

interface NavState {
  tab: TabRoute;
  subScreen: ModalSubScreen;
  cookingStep: CookingStep;
  recipe?: RecipeRecommendation | null;
  activeIngredients?: string[];
}

function MainApp() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

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

  // Stack Navigasi untuk Android Hardware Back & in-app Back (Requirement 6)
  const navHistoryRef = useRef<NavState[]>([]);

  const pushNav = (
    nextTab: TabRoute,
    nextSub: ModalSubScreen,
    nextStep: CookingStep,
    nextRecipe: RecipeRecommendation | null = selectedRecipe,
    nextIngredients: string[] = activeIngredients
  ) => {
    navHistoryRef.current.push({
      tab: activeTab,
      subScreen,
      cookingStep,
      recipe: selectedRecipe,
      activeIngredients,
    });
    setActiveTab(nextTab);
    setSubScreen(nextSub);
    setCookingStep(nextStep);
    setSelectedRecipe(nextRecipe);
    setActiveIngredients(nextIngredients);
  };

  const handleGoBack = useCallback((): boolean => {
    // 0. Alur Autentikasi (belum login): Jika di layar Daftar, kembali ke Masuk (Login)
    if (!isAuthenticated) {
      if (authSubScreen === 'register') {
        setAuthSubScreen('login');
        return true;
      }
      return false;
    }

    // 1. Pop dari riwayat stack jika ada
    const prev = navHistoryRef.current.pop();
    if (prev) {
      setActiveTab(prev.tab);
      setSubScreen(prev.subScreen);
      setCookingStep(prev.cookingStep);
      setSelectedRecipe(prev.recipe || null);
      if (prev.activeIngredients) {
        setActiveIngredients(prev.activeIngredients);
      }
      return true;
    }

    // 2. Fallback deterministik jika stack kosong
    if (subScreen === 'edit_profile' || subScreen === 'settings') {
      setSubScreen('profile');
      return true;
    }
    if (subScreen !== 'none') {
      setSubScreen('none');
      return true;
    }

    if (activeTab === 'scan') {
      if (cookingStep === 'guided_cooking') {
        setCookingStep('detail');
        return true;
      }
      if (cookingStep === 'detail') {
        if (activeIngredients && activeIngredients.length > 0) {
          setCookingStep('recommendations');
        } else {
          setCookingStep('scan');
          setActiveTab('beranda');
        }
        return true;
      }
      if (cookingStep === 'recommendations') {
        setCookingStep('scan');
        return true;
      }
      if (cookingStep === 'scan') {
        setActiveTab('beranda');
        return true;
      }
    }

    if (activeTab !== 'beranda') {
      setActiveTab('beranda');
      return true;
    }

    // Root screen (Beranda dengan subScreen === 'none'): izinkan OS keluar dari aplikasi
    return false;
  }, [isAuthenticated, authSubScreen, activeTab, subScreen, cookingStep, selectedRecipe, activeIngredients]);

  // Listener Android Hardware Back Button (Requirement 6)
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      return handleGoBack();
    });
    return () => subscription.remove();
  }, [handleGoBack]);

  // Periksa status onboarding lokal saat startup dan saat user berubah
  useEffect(() => {
    initializeGoogleAuth();
    let isMounted = true;
    getOnboardingCompleted(user?.id)
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
  }, [user?.id]);

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
    pushNav('scan', 'none', 'scan');
  };

  const handleNavigateToRecommendations = (ingredients: string[]) => {
    pushNav('scan', 'none', 'recommendations', selectedRecipe, ingredients);
  };

  const handleSelectRecipe = (recipe: RecipeRecommendation) => {
    pushNav('scan', 'none', 'detail', recipe, activeIngredients);
  };

  const handleStartGuidedCooking = (recipe: RecipeRecommendation) => {
    pushNav('scan', 'none', 'guided_cooking', recipe, activeIngredients);
  };

  const handleGuidedCookingComplete = () => {
    // Selesai memasak -> reset stack dan kembali ke beranda
    navHistoryRef.current = [];
    setCookingStep('scan');
    setActiveTab('beranda');
    setSubScreen('none');
  };

  const handleSelectTab = (tab: TabRoute) => {
    if (tab !== activeTab) {
      navHistoryRef.current = [];
    }
    setSubScreen('none');
    setActiveTab(tab);
    if (tab === 'scan' && cookingStep === 'guided_cooking') {
      setCookingStep('scan');
    }
  };

  // Navigasi Sub-layar (Profile / Pantry / History / Planner)
  const handleOpenProfile = () => pushNav(activeTab, 'profile', cookingStep);
  const handleOpenPantry = () => pushNav(activeTab, 'pantry', cookingStep);
  const handleOpenHistory = () => pushNav(activeTab, 'history', cookingStep);
  const handleOpenPlanner = () => pushNav(activeTab, 'planner', cookingStep);
  const handleCloseSubScreen = () => handleGoBack();

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
            onBack={handleGoBack}
            onNavigateToEditProfile={() => pushNav(activeTab, 'edit_profile', cookingStep)}
            onNavigateToPantry={handleOpenPantry}
            onNavigateToHistory={handleOpenHistory}
            onNavigateToPlanner={handleOpenPlanner}
            onNavigateToSaved={() => {
              pushNav('tersimpan', 'none', cookingStep);
            }}
            onNavigateToSettings={() => pushNav(activeTab, 'settings', cookingStep)}
          />
        )}

        {subScreen === 'edit_profile' && (
          <EditProfileScreen
            onBack={handleGoBack}
            onProfileUpdated={() => {
              // Context user is updated reactively
            }}
          />
        )}

        {subScreen === 'settings' && (
          <SettingsScreen
            onBack={handleGoBack}
            onNavigateToEditProfile={() => pushNav(activeTab, 'edit_profile', cookingStep)}
          />
        )}

        {subScreen === 'pantry' && (
          <PantryScreen
            onBack={handleGoBack}
            onRescueFromPantry={(ingredients) => {
              handleNavigateToRecommendations(ingredients);
            }}
          />
        )}

        {subScreen === 'history' && (
          <HistoryScreen
            onBack={handleGoBack}
            onCookAgain={(recipe) => {
              handleStartGuidedCooking(recipe);
            }}
            onStartScan={handleStartScan}
          />
        )}

        {subScreen === 'planner' && (
          <PlannerScreen
            onBack={handleGoBack}
            onSelectRecipe={(recipe) => {
              handleSelectRecipe(recipe);
            }}
            onExploreRecipes={() => {
              pushNav('jelajahi', 'none', cookingStep);
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
                onOpenExplore={() => pushNav('jelajahi', 'none', cookingStep)}
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
                onExplore={() => pushNav('jelajahi', 'none', cookingStep)}
              />
            )}

            {/* TAB: Scan & Core Cooking Flow */}
            {activeTab === 'scan' && (
              <>
                {cookingStep === 'scan' && (
                  <ScanBahanScreen
                    onNavigateToRecommendations={handleNavigateToRecommendations}
                    isActive={activeTab === 'scan' && cookingStep === 'scan' && subScreen === 'none'}
                    onBack={handleGoBack}
                  />
                )}
                {cookingStep === 'recommendations' && (
                  <RekomendasiScreen
                    ingredients={activeIngredients}
                    onSelectRecipe={handleSelectRecipe}
                    onBack={handleGoBack}
                  />
                )}
                {cookingStep === 'detail' && selectedRecipe && (
                  <DetailResepScreen
                    recipe={selectedRecipe}
                    onBack={handleGoBack}
                    onStartCooking={handleStartGuidedCooking}
                  />
                )}
                {cookingStep === 'guided_cooking' && selectedRecipe && (
                  <GuidedCookingScreen
                    recipe={selectedRecipe}
                    onBack={handleGoBack}
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
