import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, shadows } from '../theme';

/**
 * Rute navigasi bottom bar Nomz.
 * Arsitektur final 5 Tab: Beranda | Jelajahi | Scan (Center Action) | Tersimpan | Profil.
 */
export type TabRoute = 'beranda' | 'jelajahi' | 'scan' | 'tersimpan' | 'profil';

export interface TabConfig {
  id: TabRoute;
  label: string;
  icon: keyof typeof Feather.glyphMap;
  isAvailable: boolean;
}

export const ALL_TABS: TabConfig[] = [
  { id: 'beranda', label: 'Beranda', icon: 'home', isAvailable: true },
  { id: 'jelajahi', label: 'Jelajahi', icon: 'compass', isAvailable: true },
  { id: 'scan', label: 'Scan', icon: 'camera', isAvailable: true },
  { id: 'tersimpan', label: 'Tersimpan', icon: 'bookmark', isAvailable: true },
  { id: 'profil', label: 'Profil', icon: 'user', isAvailable: true },
];

interface BottomNavBarProps {
  currentTab: TabRoute;
  onSelectTab: (tab: TabRoute) => void;
}

export function BottomNavBar({ currentTab, onSelectTab }: BottomNavBarProps) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 8);

  return (
    <View style={[styles.wrapper, { paddingBottom: bottomPadding }]}>
      <View style={styles.barContainer}>
        {/* Tab 1: Beranda */}
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => onSelectTab('beranda')}
          activeOpacity={0.7}
          accessibilityRole="tab"
          accessibilityState={{ selected: currentTab === 'beranda' }}
        >
          <Feather
            name="home"
            size={22}
            color={currentTab === 'beranda' ? colors.primary : colors.textMuted}
          />
          <Text
            style={[
              styles.tabLabel,
              currentTab === 'beranda' ? styles.tabLabelActive : styles.tabLabelInactive,
            ]}
          >
            Beranda
          </Text>
        </TouchableOpacity>

        {/* Tab 2: Jelajahi */}
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => onSelectTab('jelajahi')}
          activeOpacity={0.7}
          accessibilityRole="tab"
          accessibilityState={{ selected: currentTab === 'jelajahi' }}
        >
          <Feather
            name="compass"
            size={22}
            color={currentTab === 'jelajahi' ? colors.primary : colors.textMuted}
          />
          <Text
            style={[
              styles.tabLabel,
              currentTab === 'jelajahi' ? styles.tabLabelActive : styles.tabLabelInactive,
            ]}
          >
            Jelajahi
          </Text>
        </TouchableOpacity>

        {/* Tab 3: Center Primary Action (Scan Medallion) */}
        <TouchableOpacity
          style={styles.scanButtonWrapper}
          onPress={() => onSelectTab('scan')}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Pindai Bahan Makanan"
        >
          <View style={[styles.scanMedallion, currentTab === 'scan' && styles.scanMedallionActive]}>
            <Feather name="camera" size={24} color="#FFFFFF" />
          </View>
          <Text
            style={[
              styles.scanLabel,
              currentTab === 'scan' ? styles.tabLabelActive : styles.tabLabelInactive,
            ]}
          >
            Scan
          </Text>
        </TouchableOpacity>

        {/* Tab 4: Tersimpan */}
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => onSelectTab('tersimpan')}
          activeOpacity={0.7}
          accessibilityRole="tab"
          accessibilityState={{ selected: currentTab === 'tersimpan' }}
        >
          <Feather
            name="bookmark"
            size={22}
            color={currentTab === 'tersimpan' ? colors.primary : colors.textMuted}
          />
          <Text
            style={[
              styles.tabLabel,
              currentTab === 'tersimpan' ? styles.tabLabelActive : styles.tabLabelInactive,
            ]}
          >
            Tersimpan
          </Text>
        </TouchableOpacity>

        {/* Tab 5: Profil */}
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => onSelectTab('profil')}
          activeOpacity={0.7}
          accessibilityRole="tab"
          accessibilityState={{ selected: currentTab === 'profil' }}
        >
          <Feather
            name="user"
            size={22}
            color={currentTab === 'profil' ? colors.primary : colors.textMuted}
          />
          <Text
            style={[
              styles.tabLabel,
              currentTab === 'profil' ? styles.tabLabelActive : styles.tabLabelInactive,
            ]}
          >
            Profil
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingTop: 6,
    paddingHorizontal: 8,
    ...shadows.level1,
  },
  barContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    minHeight: 48,
  },
  scanButtonWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -14, // Subtle elevation above bar
    minHeight: 56,
  },
  scanMedallion: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.surface,
    ...shadows.level2,
  },
  scanMedallionActive: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.lightMint,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
  scanLabel: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  tabLabelInactive: {
    color: colors.textMuted,
  },
});
