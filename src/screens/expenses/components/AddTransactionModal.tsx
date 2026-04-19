import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { INCOME_CATEGORY } from '../hooks/useExpenses';
import { Category, Transaction, TransactionType } from '../types/expense';

interface Props {
    visible: boolean;
    onClose: () => void;
    onSave: (data: Omit<Transaction, 'id' | 'createdAt'>) => void;
    onAddCategory: () => void;
    categories: Category[];
}

const toDateStr = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

export const AddTransactionModal: React.FC<Props> = ({
    visible, onClose, onSave, onAddCategory, categories,
}) => {
    const [type, setType] = useState<TransactionType>('expense');
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [date, setDate] = useState(new Date());
    const [isDatePickerVisible, setDatePickerVisible] = useState(false);

    const expenseCategories = categories; // Kullanıcının oluşturduğu kategoriler
    const displayCategories = type === 'income'
        ? [INCOME_CATEGORY]
        : expenseCategories;

    const handleSave = () => {
        const parsed = parseFloat(amount.replace(',', '.'));
        if (!parsed || parsed <= 0) {
            Alert.alert('Geçersiz Tutar', 'Lütfen geçerli bir tutar girin.');
            return;
        }
        if (type === 'expense' && !selectedCategoryId) {
            Alert.alert('Kategori Seç', 'Lütfen bir kategori seçin.');
            return;
        }

        onSave({
            type,
            amount: parsed,
            categoryId: type === 'income' ? 'income' : selectedCategoryId,
            note: note.trim(),
            date: toDateStr(date),
        });

        reset();
        onClose();
    };

    const reset = () => {
        setType('expense');
        setAmount('');
        setNote('');
        setSelectedCategoryId('');
        setDate(new Date());
    };

    const isToday = toDateStr(date) === toDateStr(new Date());
    const dateLabel = isToday ? 'Bugün' : format(date, 'dd.MM.yyyy');

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.overlay}
            >
                <View style={styles.sheet}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>İşlem Ekle</Text>
                        <TouchableOpacity onPress={onClose}>
                            <MaterialCommunityIcons name="close" size={22} color="#888" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                        {/* Gelir / Gider seçimi */}
                        <View style={styles.typeRow}>
                            <TouchableOpacity
                                style={[styles.typeBtn, type === 'expense' && styles.typeBtnExpense]}
                                onPress={() => { setType('expense'); setSelectedCategoryId(''); }}
                            >
                                <Text style={[styles.typeBtnText, type === 'expense' && styles.typeBtnTextActive]}>
                                    Gider
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.typeBtn, type === 'income' && styles.typeBtnIncome]}
                                onPress={() => { setType('income'); setSelectedCategoryId('income'); }}
                            >
                                <Text style={[styles.typeBtnText, type === 'income' && styles.typeBtnTextActive]}>
                                    Gelir
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Tutar */}
                        <Text style={styles.label}>Tutar (₺) *</Text>
                        <View style={styles.amountRow}>
                            <Text style={styles.currencySign}>₺</Text>
                            <TextInput
                                style={styles.amountInput}
                                placeholder="0,00"
                                keyboardType="decimal-pad"
                                value={amount}
                                onChangeText={setAmount}
                                autoFocus
                            />
                        </View>

                        {/* Kategori — sadece gider için */}
                        {type === 'expense' && (
                            <>
                                <View style={styles.labelRow}>
                                    <Text style={styles.label}>Kategori *</Text>
                                    <TouchableOpacity onPress={onAddCategory}>
                                        <Text style={styles.newCatBtn}>+ Yeni kategori</Text>
                                    </TouchableOpacity>
                                </View>

                                {expenseCategories.length === 0 ? (
                                    <TouchableOpacity style={styles.emptyCatBox} onPress={onAddCategory}>
                                        <MaterialCommunityIcons name="plus-circle-outline" size={24} color="#aaa" />
                                        <Text style={styles.emptyCatText}>Önce bir kategori oluştur</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <View style={styles.catGrid}>
                                        {expenseCategories.map(cat => {
                                            const selected = selectedCategoryId === cat.id;
                                            return (
                                                <TouchableOpacity
                                                    key={cat.id}
                                                    style={[
                                                        styles.catChip,
                                                        selected && { backgroundColor: cat.color + '18', borderColor: cat.color },
                                                    ]}
                                                    onPress={() => setSelectedCategoryId(cat.id)}
                                                >
                                                    <MaterialCommunityIcons
                                                        name={cat.icon as any}
                                                        size={16}
                                                        color={selected ? cat.color : '#aaa'}
                                                    />
                                                    <Text style={[styles.catChipText, selected && { color: cat.color, fontWeight: '700' }]}>
                                                        {cat.name}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                )}
                            </>
                        )}

                        {/* Not */}
                        <Text style={styles.label}>Not</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Açıklama (opsiyonel)"
                            value={note}
                            onChangeText={setNote}
                        />

                        {/* Tarih */}
                        <Text style={styles.label}>Tarih</Text>
                        <TouchableOpacity
                            style={styles.datePicker}
                            onPress={() => setDatePickerVisible(true)}
                        >
                            <MaterialCommunityIcons name="calendar" size={18} color="#888" />
                            <Text style={styles.datePickerText}>{dateLabel}</Text>
                        </TouchableOpacity>

                        {/* Kaydet */}
                        <TouchableOpacity
                            style={[styles.saveBtn, { backgroundColor: type === 'income' ? '#43A047' : '#007AFF' }]}
                            onPress={handleSave}
                        >
                            <Text style={styles.saveBtnText}>
                                {type === 'income' ? 'Gelir Ekle' : 'Gider Ekle'}
                            </Text>
                        </TouchableOpacity>

                        <View style={{ height: 40 }} />
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>

            <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={d => { setDate(d); setDatePickerVisible(false); }}
                onCancel={() => setDatePickerVisible(false)}
                locale="tr_TR"
                maximumDate={new Date()}
            />
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
    sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '90%' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#222' },
    // Tip seçimi
    typeRow: { flexDirection: 'row', backgroundColor: '#F5F7FA', borderRadius: 14, padding: 4, marginBottom: 8 },
    typeBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
    typeBtnExpense: { backgroundColor: '#007AFF' },
    typeBtnIncome: { backgroundColor: '#43A047' },
    typeBtnText: { fontSize: 14, fontWeight: '600', color: '#aaa' },
    typeBtnTextActive: { color: '#fff' },
    // Tutar
    label: { fontSize: 13, fontWeight: '600', color: '#777', marginTop: 16, marginBottom: 8 },
    amountRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F7FA', borderRadius: 12, borderWidth: 1, borderColor: '#eee', paddingHorizontal: 14 },
    currencySign: { fontSize: 22, fontWeight: 'bold', color: '#333', marginRight: 6 },
    amountInput: { flex: 1, fontSize: 26, fontWeight: 'bold', color: '#333', paddingVertical: 12 },
    // Kategori
    labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 8 },
    newCatBtn: { fontSize: 12, color: '#007AFF', fontWeight: '600' },
    emptyCatBox: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16, backgroundColor: '#F5F7FA', borderRadius: 12, borderWidth: 1, borderColor: '#eee', borderStyle: 'dashed' },
    emptyCatText: { fontSize: 13, color: '#aaa' },
    catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    catChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#eee', backgroundColor: '#FAFAFA' },
    catChipText: { fontSize: 12, color: '#888' },
    // Not
    input: { backgroundColor: '#F5F7FA', padding: 13, borderRadius: 12, fontSize: 15, color: '#333', borderWidth: 1, borderColor: '#eee' },
    // Tarih
    datePicker: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F5F7FA', padding: 13, borderRadius: 12, borderWidth: 1, borderColor: '#eee' },
    datePickerText: { fontSize: 15, color: '#555' },
    // Kaydet
    saveBtn: { padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 24 },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
