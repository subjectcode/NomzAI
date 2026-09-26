import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, SafeAreaView } from 'react-native';
import { ScanBahanScreen, RekomendasiScreen, DetailResepScreen } from './src/screens';
import { RecipeRecommendation } from './src/types';

type ScreenState = 'scan' | 'recommendations' | 'detail';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('scan');
  const [activeIngredients, setActiveIngredients] = useState<string[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeRecommendation | null>(null);

  const handleNavigateToRecommendations = (ingredients: string[]) => {
    setActiveIngredients(ingredients);
    setCurrentScreen('recommendations');
  };

  const handleSelectRecipe = (recipe: RecipeRecommendation) => {
    setSelectedRecipe(recipe);
    setCurrentScreen('detail');
  };

  const handleBackToRecommendations = () => {
    setCurrentScreen('recommendations');
  };

  const handleBackToScan = () => {
    setCurrentScreen('scan');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      {currentScreen === 'scan' && (
        <ScanBahanScreen onNavigateToRecommendations={handleNavigateToRecommendations} />
      )}
      {currentScreen === 'recommendations' && (
        <RekomendasiScreen
          ingredients={activeIngredients}
          onSelectRecipe={handleSelectRecipe}
          onBack={handleBackToScan}
        />
      )}
      {currentScreen === 'detail' && selectedRecipe && (
        <DetailResepScreen
          recipe={selectedRecipe}
          onBack={handleBackToRecommendations}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fafaf9',
  },
});
