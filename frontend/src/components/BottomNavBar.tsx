import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme';

export type TabRoute = 'beranda' | 'scan' | 'riwayat' | 'profil';

export interface TabConfig {
  id: TabRoute;
  label: string;
  icon: keyof typeof Feather.glyphMap;
  isAvailable: boolean;
}

/**
 * Konfigurasi seluruh rute bottom navigation Nomz.
 * Riwayat & Profil disiapkan untuk M5.3.
 */
export const ALL_TABS: TabConfig[] = [
  { id: 'beranda', label: 'Beranda', icon: 'home', isAvailable: true },
  { id: 'scan', label: 'Scan', icon: 'camera', isAvailable: true },
  { id: 'riwayat', label: 'Riwayat', icon: 'clock', isAvailable: false },
  { id: 'profil', label: 'Profil', icon: 'user', isAvailable: false },
];

interface BottomNavBarProps {
  currentTab: TabRoute;
  onSelectTab: (tab: TabRoute) => void;
}

export function BottomNavBar({ currentTab, onSelectTab }: BottomNavBarProps) {
  // Hanya menampilkan tab yang functional untuk M5.1 agar menghindari dead clicks / fake screen
  const functionalTabs = ALL_TABS.filter((tab) => tab.isAvailable);

  return (
    <View style={styles.container}>
      <View style={styles.tabRow}>
        {functionalTabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
              onPress={() => onSelectTab(tab.id)}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <Feather
                name={tab.icon}
                size={20}
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
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 28,
    borderRadius: 16,
  },
  tabButtonActive: {
    backgroundColor: '#EFF3EF',
  },
  tabLabel: {
    fontSize: 12,
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
