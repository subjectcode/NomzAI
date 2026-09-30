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
import { colors } from '../theme';
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
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Feather name="arrow-left" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.topBarTextWrap}>
          <Text style={styles.topBarTitle}>Dapur Saya (Pantry)</Text>
          <Text style={styles.topBarSubtitle}>Inventaris bahan & prioritasi tanggal kadaluarsa</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowAddForm((p) => !p)}
          activeOpacity={0.8}
        >
          <Feather name={showAddForm ? "x" : "plus"} size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Feather name="shield" size={16} color={colors.primary} style={{ marginRight: 8 }} />
          <Text style={styles.infoBannerText}>
            {useFirstCount > 0
              ? `${useFirstCount} bahan ditandai "Gunakan Dulu" untuk diprioritaskan saat Food Rescue.`
              : 'Tandai bahan yang hampir kadaluarsa dengan "Gunakan Dulu" agar segera dimasak.'}
          </Text>
        </View>

        {/* Add Form */}
        {showAddForm && (
          <View style={styles.addCard}>
            <Text style={styles.addCardTitle}>Tambah Bahan ke Dapur</Text>
            <TextInput
              style={styles.input}
              placeholder="Nama bahan (contoh: Telur, Tahu, Tomat)..."
              placeholderTextColor="#a8a29e"
              value={nameInput}
              onChangeText={setNameInput}
            />
            <TextInput
              style={styles.input}
              placeholder="Jumlah (opsional, contoh: 3 butir, 1 ikat)..."
              placeholderTextColor="#a8a29e"
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
              <Text style={styles.toggleText}>Prioritaskan "Gunakan Dulu" (Cepat busuk/kadaluarsa)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.submitBtn} onPress={handleAdd} activeOpacity={0.85}>
              <Text style={styles.submitBtnText}>Simpan ke Dapur</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Items List */}
        <View style={styles.itemsWrap}>
          {items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <TouchableOpacity
                style={styles.itemMain}
                onPress={() => handleToggle(item.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.useFirstDot, item.useFirst && styles.useFirstDotActive]} />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    {item.useFirst && (
                      <View style={styles.useFirstBadge}>
                        <Text style={styles.useFirstBadgeText}>Gunakan Dulu</Text>
                      </View>
                    )}
                  </View>
                  {item.quantity && <Text style={styles.itemQty}>{item.quantity}</Text>}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleRemove(item.id)}
                activeOpacity={0.7}
              >
                <Feather name="trash-2" size={15} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Footer Action */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.rescueBtn} onPress={handleRescue} activeOpacity={0.85}>
          <Feather name="shield" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.rescueBtnText}>
            Rescue Bahan Dapur ({items.length} Bahan)
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F3',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E7E5DE',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f4',
    marginRight: 12,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTextWrap: {
    flex: 1,
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  topBarSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 90,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF3EF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 12,
    color: colors.primaryDark,
    lineHeight: 17,
  },
  addCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E7E5DE',
    padding: 16,
    marginBottom: 16,
  },
  addCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#FAF8F3',
    borderWidth: 1,
    borderColor: '#E7E5DE',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: colors.textPrimary,
    marginBottom: 10,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    marginTop: 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  toggleText: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  itemsWrap: {
    gap: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E7E5DE',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  itemMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  useFirstDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d6d3d1',
    marginRight: 10,
  },
  useFirstDotActive: {
    backgroundColor: '#ea580c',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
  itemQty: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  useFirstBadge: {
    backgroundColor: '#ffedd5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  useFirstBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ea580c',
  },
  deleteBtn: {
    padding: 6,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E7E5DE',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  rescueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
  },
  rescueBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
