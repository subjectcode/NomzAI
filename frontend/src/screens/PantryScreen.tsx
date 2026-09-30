import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, radius, shadows, spacing } from '../theme';
import {
  PantryItem,
  getPantryItems,
  addPantryItem,
  removePantryItem,
  toggleUseFirst,
  getPantryIngredientsForRescue,
} from '../services/pantryStorage';

interface PantryScreenProps {
  onBack: () => void;
  onRescueFromPantry: (ingredients: string[]) => void;
}

export function PantryScreen({ onBack, onRescueFromPantry }: PantryScreenProps) {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [nameInput, setNameInput] = useState<string>('');
  const [qtyInput, setQtyInput] = useState<string>('');
  const [useFirstInput, setUseFirstInput] = useState<boolean>(false);

  const loadItems = async () => {
    const list = await getPantryItems();
    setItems(list);
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleAdd = async () => {
    if (!nameInput.trim()) {
      Alert.alert('Perhatian', 'Nama bahan tidak boleh kosong.');
      return;
    }
    await addPantryItem(nameInput, qtyInput, useFirstInput);
    setNameInput('');
    setQtyInput('');
    setUseFirstInput(false);
    setShowAddForm(false);
    await loadItems();
  };

  const handleRemove = async (id: string) => {
    await removePantryItem(id);
    await loadItems();
  };

  const handleToggle = async (id: string) => {
    await toggleUseFirst(id);
    await loadItems();
  };

  const handleRescue = async () => {
    if (items.length === 0) {
      Alert.alert('Dapur Kosong', 'Tambahkan bahan makanan terlebih dahulu.');
      return;
    }
    const rescueList = await getPantryIngredientsForRescue();
    onRescueFromPantry(rescueList);
  };

  const useFirstCount = items.filter((i) => i.useFirst).length;

  return (
    <View style={styles.container}>
      {/* 1. TOP BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Feather name="arrow-left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.topBarTextWrap}>
          <Text style={styles.topBarTitle}>Dapur Saya (Pantry)</Text>
          <Text style={styles.topBarSubtitle}>Kelola stok & prioritas bahan kulkas</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowAddForm((p) => !p)}
          activeOpacity={0.8}
          accessibilityLabel={showAddForm ? 'Tutup Form' : 'Tambah Bahan'}
        >
          <Feather name={showAddForm ? 'x' : 'plus'} size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. URGENCY AWARENESS BANNER (DESIGN.md Section 32) */}
        <View style={styles.infoBanner}>
          <Feather name="clock" size={16} color={colors.orangeDark} style={{ marginRight: 8 }} />
          <Text style={styles.infoBannerText}>
            {useFirstCount > 0
              ? `${useFirstCount} bahan ditandai "Gunakan Dulu" agar segera dimasak sebelum terbuang.`
              : 'Tandai bahan yang mendekati kadaluarsa agar otomatis diprioritaskan oleh Nomz.'}
          </Text>
        </View>

        {/* 3. ADD FORM */}
        {showAddForm && (
          <View style={styles.addCard}>
            <Text style={styles.addCardTitle}>Tambah Bahan ke Dapur</Text>
            <TextInput
              style={styles.input}
              placeholder="Nama bahan (contoh: Telur, Tahu, Tomat)..."
              placeholderTextColor={colors.textMuted}
              value={nameInput}
              onChangeText={setNameInput}
            />
            <TextInput
              style={styles.input}
              placeholder="Jumlah (opsional, contoh: 3 butir, 1 ikat)..."
              placeholderTextColor={colors.textMuted}
              value={qtyInput}
              onChangeText={setQtyInput}
            />
            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => setUseFirstInput((p) => !p)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, useFirstInput && styles.checkboxActive]}>
                {useFirstInput && <Feather name="check" size={12} color="#FFFFFF" />}
              </View>
              <Text style={styles.toggleText}>Tandai "Gunakan Dulu" (Cepat busuk)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.submitBtn} onPress={handleAdd} activeOpacity={0.85}>
              <Text style={styles.submitBtnText}>Simpan ke Dapur</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 4. PRIMARY RESCUE CTA BUTTON */}
        <TouchableOpacity style={styles.rescueCtaBtn} onPress={handleRescue} activeOpacity={0.88}>
          <Feather name="play" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.rescueCtaText}>Masak dari Bahan Dapur ({items.length})</Text>
        </TouchableOpacity>

        {/* 5. DAFTAR BAHAN DAPUR */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>Stok Bahan Tersedia ({items.length})</Text>
        </View>

        {items.length === 0 ? (
          <View style={styles.emptyPantryBox}>
            <Feather name="inbox" size={32} color={colors.textMuted} style={{ marginBottom: 10 }} />
            <Text style={styles.emptyPantryTitle}>Dapur Masih Kosong</Text>
            <Text style={styles.emptyPantrySubtitle}>
              Mulai tambahkan bahan yang ada di kulkas atau meja dapurmu.
            </Text>
          </View>
        ) : (
          <View style={styles.itemsList}>
            {items.map((item) => (
              <View key={item.id} style={styles.itemRowCard}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {item.quantity ? <Text style={styles.itemQty}>{item.quantity}</Text> : null}
                </View>

                {/* Use First Toggle Pill */}
                <TouchableOpacity
                  style={[styles.useFirstBadge, item.useFirst && styles.useFirstBadgeActive]}
                  onPress={() => handleToggle(item.id)}
                  activeOpacity={0.75}
                >
                  <Feather
                    name="clock"
                    size={11}
                    color={item.useFirst ? colors.orangeDark : colors.textMuted}
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={[
                      styles.useFirstBadgeText,
                      item.useFirst && styles.useFirstBadgeTextActive,
                    ]}
                  >
                    {item.useFirst ? 'Gunakan Dulu' : 'Stok Aman'}
                  </Text>
                </TouchableOpacity>

                {/* Delete Button */}
                <TouchableOpacity
                  style={styles.deleteItemBtn}
                  onPress={() => handleRemove(item.id)}
                  activeOpacity={0.7}
                  accessibilityLabel={`Hapus ${item.name}`}
                >
                  <Feather name="trash-2" size={15} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  topBarTextWrap: {
    flex: 1,
  },
  topBarTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  topBarSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
  },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.level1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderRadius: radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.warmYellow,
    marginBottom: 16,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
  },
  addCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: 16,
    ...shadows.level1,
  },
  addCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: colors.textPrimary,
    marginBottom: 10,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    backgroundColor: colors.surface,
  },
  checkboxActive: {
    backgroundColor: colors.orangeDark,
    borderColor: colors.orangeDark,
  },
  toggleText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  rescueCtaBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    minHeight: 48,
    ...shadows.level1,
  },
  rescueCtaText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  sectionHeaderRow: {
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptyPantryBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    ...shadows.level1,
  },
  emptyPantryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  emptyPantrySubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
  },
  itemsList: {
    gap: 8,
  },
  itemRowCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.level1,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
  itemQty: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  useFirstBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.full,
    marginRight: 10,
  },
  useFirstBadgeActive: {
    backgroundColor: '#FFF7ED',
    borderColor: colors.warmYellow,
  },
  useFirstBadgeText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  useFirstBadgeTextActive: {
    color: colors.orangeDark,
    fontWeight: '700',
  },
  deleteItemBtn: {
    padding: 6,
  },
});
