import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';

/**
 * Rute navigasi bottom bar Nomz.
 * Target arsitektur final: Beranda | Jelajahi | Scan | Tersimpan.
 * Catatan: Profil diakses via avatar di header, bukan tab bar.
 */
export type TabRoute = 'beranda' | 'jelajahi' | 'scan' | 'tersimpan';

export interface TabConfig {
  id: TabRoute;
  label: string;
  icon: keyof typeof Feather.glyphMap;
  isAvailable: boolean;
}

/**
 * Konfigurasi seluruh rute bottom navigation target.
 * Jelajahi & Tersimpan disiapkan untuk milestone mendatang.
 */
export const ALL_TABS: TabConfig[] = [
  { id: 'beranda', label: 'Beranda', icon: 'home', isAvailable: true },
  { id: 'jelajahi', label: 'Jelajahi', icon: 'compass', isAvailable: false },
  { id: 'scan', label: 'Scan', icon: 'camera', isAvailable: true },
  { id: 'tersimpan', label: 'Tersimpan', icon: 'bookmark', isAvailable: false },
];

interface BottomNavBarProps {
  currentTab: TabRoute;
  onSelectTab: (tab: TabRoute) => void;
}

export function BottomNavBar({ currentTab, onSelectTab }: BottomNavBarProps) {
  const insets = useSafeAreaInsets();
  // Hanya mengekspos tab yang sudah functional agar tidak membuat dead navigation
  const functionalTabs = ALL_TABS.filter((tab) => tab.isAvailable);

  // Menggunakan actual bottom inset dari device, dengan minimum 8px
  // Ini menangani Android 3-button nav, gesture nav, dan iOS home indicator
  const bottomPadding = Math.max(insets.bottom, 8);

  return (
    <View style={[styles.container, { paddingBottom: bottomPadding }]}>
      <View style={styles.tabRow}>
        {functionalTabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabButton}
              onPress={() => onSelectTab(tab.id)}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <Feather
                name={tab.icon}
                size={22}
                color={isActive ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.tabLabel,
                  isActive ? styles.tabLabelActive : styles.tabLabelInactive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    paddingHorizontal: 24,
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 20,
    minWidth: 72,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  tabLabelInactive: {
    color: colors.textSecondary,
  },
});
