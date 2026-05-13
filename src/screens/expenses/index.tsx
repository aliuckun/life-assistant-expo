import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert, Modal, SafeAreaView, ScrollView,
    SectionList, StatusBar, StyleSheet, Text,
    TextInput, TouchableOpacity, View,
} from 'react-native';
import { Colors, rs } from '../../styles';
import { AddCategoryModal } from './components/AddCategoryModal';
import { AddTransactionModal } from './components/AddTransactionModal';
import { CategoryBreakdown } from './components/CategoryBreakdown';
import { PastMonths } from './components/PastMonths';
import { TransactionItem } from './components/TransactionItem';
import { useExpenses } from './hooks/useExpenses';
import { Category, Transaction } from './types/expense';

const MONTHS_TR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const fmt = (n: number) => n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const dayLabel = (dateStr: string): string => {
    const today = new Date();
    const [y, m, d] = dateStr.split('-').map(Number);
    if (y === today.getFullYear() && m === today.getMonth() + 1 && d === today.getDate()) return 'Bugün';
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (y === yesterday.getFullYear() && m === yesterday.getMonth() + 1 && d === yesterday.getDate()) return 'Dün';
    return `${d} ${MONTHS_TR[m - 1]}`;
};

type Tab = 'list' | 'summary';

// ─── Reset günü modal ─────────────────────────────────────────
const ResetDayModal = ({ visible, current, onSave, onClose }: {
    visible: boolean; current: number; onSave: (d: number) => void; onClose: () => void;
}) => {
    const [selected, setSelected] = useState(current);
    const days = Array.from({ length: 28 }, (_, i) => i + 1);

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <View style={rdStyles.container}>
                <View style={rdStyles.handle} />
                <Text style={rdStyles.title}>Dönem Başlangıç Günü</Text>
                <Text style={rdStyles.sub}>
                    Her ayın bu gününde harcama dönemi sıfırlanır.{'\n'}
                    Örn: 15 seçerseniz 15 Mayıs–14 Haziran bir dönemdir.
                </Text>
                <View style={rdStyles.grid}>
                    {days.map(d => (
                        <TouchableOpacity
                            key={d}
                            style={[rdStyles.dayBtn, selected === d && rdStyles.dayBtnActive]}
                            onPress={() => setSelected(d)}
                        >
                            <Text style={[rdStyles.dayText, selected === d && rdStyles.dayTextActive]}>{d}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={rdStyles.btnRow}>
                    <TouchableOpacity style={[rdStyles.btn, rdStyles.cancelBtn]} onPress={onClose}>
                        <Text style={rdStyles.cancelText}>İptal</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[rdStyles.btn, rdStyles.saveBtn]} onPress={() => { onSave(selected); onClose(); }}>
                        <Text style={rdStyles.saveText}>Kaydet</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const rdStyles = StyleSheet.create({
    container: { flex: 1, padding: rs(20), paddingTop: rs(12) },
    handle: { width: rs(36), height: rs(4), backgroundColor: '#ddd', borderRadius: rs(2), alignSelf: 'center', marginBottom: rs(20) },
    title: { fontSize: rs(18), fontWeight: '700', color: '#333', textAlign: 'center', marginBottom: rs(8) },
    sub: { fontSize: rs(13), color: '#888', textAlign: 'center', lineHeight: rs(20), marginBottom: rs(24) },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: rs(10), justifyContent: 'center', marginBottom: rs(32) },
    dayBtn: { width: rs(48), height: rs(48), borderRadius: rs(12), borderWidth: 1.5, borderColor: '#eee', justifyContent: 'center', alignItems: 'center' },
    dayBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    dayText: { fontSize: rs(15), fontWeight: '600', color: '#555' },
    dayTextActive: { color: '#fff' },
    btnRow: { flexDirection: 'row', gap: rs(12) },
    btn: { flex: 1, padding: rs(15), borderRadius: rs(14), alignItems: 'center' },
    cancelBtn: { backgroundColor: '#f0f0f0' },
    cancelText: { fontSize: rs(15), color: '#666', fontWeight: '600' },
    saveBtn: { backgroundColor: Colors.primary },
    saveText: { fontSize: rs(15), color: '#fff', fontWeight: '700' },
});

// ─── Ana ekran ───────────────────────────────────────────────
export default function ExpensesScreen() {
    const {
        categories, loading,
        resetDay, saveResetDay, currentPeriod,
        selectedMonth, setSelectedMonth,
        addCategory, removeCategory, updateCategoryBudget,
        addTransaction, removeTransaction,
        groupedByDay, getMonthTotals, getPeriodTotals,
        getCategoryBreakdown, getPastMonths,
        getCategoryById, monthLabel,
    } = useExpenses();

    const [tab, setTab] = useState<Tab>('list');
    const [txModalVisible, setTxModalVisible] = useState(false);
    const [catModalVisible, setCatModalVisible] = useState(false);
    const [resetModalVisible, setResetModalVisible] = useState(false);
    const [budgetTarget, setBudgetTarget] = useState<Category | null>(null);
    const [budgetInput, setBudgetInput] = useState('');

    const totals = getPeriodTotals();
    const groups = groupedByDay();
    const pastMonths = getPastMonths();
    const selectedMonthTotals = getMonthTotals(selectedMonth);

    const handleLongPress = (tx: Transaction) => {
        Alert.alert('İşlemi Sil', 'Bu işlemi silmek istediğine emin misin?', [
            { text: 'Vazgeç', style: 'cancel' },
            { text: 'Sil', style: 'destructive', onPress: () => removeTransaction(tx.id) },
        ]);
    };

    const sections = groups.map(g => ({
        title: g.date,
        data: g.items,
        dayTotal: g.items.reduce((s, t) => t.type === 'expense' ? s - t.amount : s + t.amount, 0),
    }));

    if (loading) return null;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Harcamalar</Text>
                    <Text style={styles.headerSub}>{currentPeriod.label}</Text>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.resetDayBtn} onPress={() => setResetModalVisible(true)}>
                        <MaterialCommunityIcons name="calendar-refresh" size={rs(14)} color={Colors.primary} />
                        <Text style={styles.resetDayText}>{resetDay}. gün</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.addBtn} onPress={() => setTxModalVisible(true)}>
                        <MaterialCommunityIcons name="plus" size={rs(24)} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Bakiye kartı */}
            <View style={styles.balanceCard}>
                {/* Net */}
                <View style={styles.balanceTop}>
                    <Text style={styles.balanceLabel}>Dönem Net Bakiye</Text>
                    <Text style={[styles.balanceAmount, { color: totals.net >= 0 ? Colors.success : Colors.danger }]}>
                        {totals.net >= 0 ? '+' : ''}₺{fmt(totals.net)}
                    </Text>
                </View>

                {/* Gelir / Gider */}
                <View style={styles.balanceRow}>
                    <View style={styles.balanceItem}>
                        <View style={[styles.balanceDot, { backgroundColor: Colors.success + '20' }]}>
                            <MaterialCommunityIcons name="arrow-down" size={rs(12)} color={Colors.success} />
                        </View>
                        <View>
                            <Text style={styles.balanceItemLabel}>Gelir</Text>
                            <Text style={[styles.balanceItemValue, { color: Colors.success }]}>
                                +₺{fmt(totals.income)}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.balanceDivider} />
                    <View style={styles.balanceItem}>
                        <View style={[styles.balanceDot, { backgroundColor: Colors.danger + '20' }]}>
                            <MaterialCommunityIcons name="arrow-up" size={rs(12)} color={Colors.danger} />
                        </View>
                        <View>
                            <Text style={styles.balanceItemLabel}>Gider</Text>
                            <Text style={[styles.balanceItemValue, { color: Colors.danger }]}>
                                -₺{fmt(totals.expense)}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Tab */}
            <View style={styles.tabRow}>
                <TouchableOpacity
                    style={[styles.tabBtn, tab === 'list' && styles.tabBtnActive]}
                    onPress={() => setTab('list')}
                >
                    <MaterialCommunityIcons
                        name="format-list-bulleted"
                        size={rs(14)}
                        color={tab === 'list' ? Colors.primary : Colors.textLight}
                    />
                    <Text style={[styles.tabBtnText, tab === 'list' && styles.tabBtnTextActive]}>Liste</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabBtn, tab === 'summary' && styles.tabBtnActive]}
                    onPress={() => setTab('summary')}
                >
                    <MaterialCommunityIcons
                        name="chart-pie"
                        size={rs(14)}
                        color={tab === 'summary' ? Colors.primary : Colors.textLight}
                    />
                    <Text style={[styles.tabBtnText, tab === 'summary' && styles.tabBtnTextActive]}>Özet</Text>
                </TouchableOpacity>
            </View>

            {tab === 'list' ? (
                <SectionList
                    sections={sections}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    stickySectionHeadersEnabled={false}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <MaterialCommunityIcons name="wallet-outline" size={rs(56)} color="#e0e0e0" />
                            <Text style={styles.emptyTitle}>Bu dönemde işlem yok</Text>
                            <Text style={styles.emptySub}>Sağ üstteki + ile işlem ekle</Text>
                        </View>
                    }
                    renderSectionHeader={({ section }) => (
                        <View style={styles.dayHeader}>
                            <Text style={styles.dayLabel}>{dayLabel(section.title)}</Text>
                            <Text style={[styles.dayTotal, {
                                color: section.dayTotal >= 0 ? Colors.success : Colors.danger
                            }]}>
                                {section.dayTotal >= 0 ? '+' : ''}₺{fmt(Math.abs(section.dayTotal))}
                            </Text>
                        </View>
                    )}
                    renderItem={({ item, index, section }) => (
                        <View style={styles.txWrapper}>
                            <TransactionItem
                                transaction={item}
                                category={getCategoryById(item.categoryId)}
                                onLongPress={() => handleLongPress(item)}
                            />
                            {index < section.data.length - 1 && <View style={styles.separator} />}
                        </View>
                    )}
                />
            ) : (
                <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
                    <CategoryBreakdown data={getCategoryBreakdown(selectedMonth)} />
                    <PastMonths data={pastMonths} selectedMonth={selectedMonth} onSelect={setSelectedMonth} />

                    {/* Kategori yönetimi */}
                    <View style={styles.catSection}>
                        <View style={styles.catHeader}>
                            <Text style={styles.catTitle}>Kategoriler</Text>
                            <TouchableOpacity onPress={() => setCatModalVisible(true)}>
                                <Text style={styles.catAddBtn}>+ Ekle</Text>
                            </TouchableOpacity>
                        </View>
                        {categories.length === 0 ? (
                            <Text style={styles.catEmpty}>Henüz kategori yok</Text>
                        ) : (
                            categories.map(cat => (
                                <View key={cat.id} style={styles.catRow}>
                                    <View style={[styles.catIcon, { backgroundColor: cat.color + '18' }]}>
                                        <MaterialCommunityIcons name={cat.icon as any} size={rs(18)} color={cat.color} />
                                    </View>
                                    <Text style={styles.catName}>{cat.name}</Text>
                                    <TouchableOpacity
                                        style={styles.budgetBtn}
                                        onPress={() => { setBudgetTarget(cat); setBudgetInput(cat.budget ? String(cat.budget) : ''); }}
                                    >
                                        <Text style={[styles.budgetBtnText, { color: cat.budget ? Colors.primary : '#ccc' }]}>
                                            {cat.budget ? `₺${fmt(cat.budget)}` : 'Limit yok'}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => Alert.alert('Kategoriyi Sil', `"${cat.name}" silinsin mi?`, [
                                            { text: 'Vazgeç', style: 'cancel' },
                                            { text: 'Sil', style: 'destructive', onPress: () => removeCategory(cat.id) },
                                        ])}
                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                    >
                                        <MaterialCommunityIcons name="trash-can-outline" size={rs(18)} color="#ccc" />
                                    </TouchableOpacity>
                                </View>
                            ))
                        )}
                    </View>
                </ScrollView>
            )}

            {/* Bütçe modal */}
            <Modal visible={!!budgetTarget} animationType="fade" transparent>
                <View style={styles.budgetOverlay}>
                    <View style={styles.budgetModal}>
                        <Text style={styles.budgetModalTitle}>{budgetTarget?.name} Bütçe Limiti</Text>
                        <Text style={styles.budgetModalSub}>Boş bırakırsanız limit kaldırılır</Text>
                        <View style={styles.budgetInputRow}>
                            <Text style={styles.budgetCurrency}>₺</Text>
                            <TextInput
                                style={styles.budgetInput}
                                value={budgetInput}
                                onChangeText={setBudgetInput}
                                keyboardType="numeric"
                                placeholder="0"
                            />
                        </View>
                        <View style={styles.budgetBtnRow}>
                            <TouchableOpacity style={[styles.budgetActionBtn, { backgroundColor: '#f0f0f0' }]} onPress={() => setBudgetTarget(null)}>
                                <Text style={{ color: '#666', fontWeight: '600' }}>İptal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.budgetActionBtn, { backgroundColor: Colors.primary }]}
                                onPress={() => {
                                    if (budgetTarget) {
                                        const val = budgetInput.trim() ? parseFloat(budgetInput) : undefined;
                                        updateCategoryBudget(budgetTarget.id, val && !isNaN(val) ? val : undefined);
                                    }
                                    setBudgetTarget(null);
                                }}
                            >
                                <Text style={{ color: '#fff', fontWeight: '700' }}>Kaydet</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <AddTransactionModal
                visible={txModalVisible}
                onClose={() => setTxModalVisible(false)}
                onSave={addTransaction}
                onAddCategory={() => { setTxModalVisible(false); setCatModalVisible(true); }}
                categories={categories}
            />
            <AddCategoryModal
                visible={catModalVisible}
                onClose={() => setCatModalVisible(false)}
                onAdd={data => { addCategory(data); setCatModalVisible(false); setTxModalVisible(true); }}
            />
            <ResetDayModal
                visible={resetModalVisible}
                current={resetDay}
                onSave={saveResetDay}
                onClose={() => setResetModalVisible(false)}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: rs(20),
        paddingTop: rs(14),
        paddingBottom: rs(10),
    },
    headerTitle: { fontSize: rs(26), fontWeight: '800', color: '#222', letterSpacing: -0.5 },
    headerSub: { fontSize: rs(11), color: Colors.textLight, marginTop: rs(2) },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: rs(10) },
    resetDayBtn: {
        flexDirection: 'row', alignItems: 'center', gap: rs(4),
        backgroundColor: Colors.primary + '12',
        paddingHorizontal: rs(10), paddingVertical: rs(6), borderRadius: rs(10),
    },
    resetDayText: { fontSize: rs(12), color: Colors.primary, fontWeight: '600' },
    addBtn: {
        width: rs(44), height: rs(44), borderRadius: rs(22),
        backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center',
        shadowColor: Colors.primary, shadowOpacity: 0.35, shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8, elevation: 5,
    },

    // Bakiye kartı
    balanceCard: {
        backgroundColor: Colors.surface,
        marginHorizontal: rs(16),
        borderRadius: rs(20),
        padding: rs(18),
        marginBottom: rs(12),
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 8,
        elevation: 3,
    },
    balanceTop: { alignItems: 'center', marginBottom: rs(16) },
    balanceLabel: { fontSize: rs(12), color: Colors.textLight, marginBottom: rs(4), fontWeight: '500' },
    balanceAmount: { fontSize: rs(32), fontWeight: '800', letterSpacing: -1 },
    balanceRow: { flexDirection: 'row', alignItems: 'center' },
    balanceItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: rs(10) },
    balanceDot: { width: rs(28), height: rs(28), borderRadius: rs(14), justifyContent: 'center', alignItems: 'center' },
    balanceDivider: { width: 1, height: rs(32), backgroundColor: Colors.divider },
    balanceItemLabel: { fontSize: rs(11), color: Colors.textLight, fontWeight: '500' },
    balanceItemValue: { fontSize: rs(15), fontWeight: '700' },

    // Tab
    tabRow: {
        flexDirection: 'row',
        backgroundColor: '#EBEBEB',
        borderRadius: rs(14),
        marginHorizontal: rs(16),
        marginBottom: rs(12),
        padding: rs(3),
    },
    tabBtn: {
        flex: 1, flexDirection: 'row', justifyContent: 'center',
        alignItems: 'center', gap: rs(5),
        paddingVertical: rs(8), borderRadius: rs(11),
    },
    tabBtnActive: { backgroundColor: Colors.surface },
    tabBtnText: { fontSize: rs(13), fontWeight: '600', color: Colors.textLight },
    tabBtnTextActive: { color: Colors.primary },

    // Liste
    list: { paddingHorizontal: rs(16), paddingBottom: rs(100), paddingTop: rs(4) },

    // Gün başlığı
    dayHeader: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginTop: rs(14), marginBottom: rs(6),
    },
    dayLabel: { fontSize: rs(13), fontWeight: '700', color: '#555' },
    dayTotal: { fontSize: rs(12), fontWeight: '700' },

    // İşlem wrapper
    txWrapper: {
        backgroundColor: Colors.surface,
        borderRadius: rs(14),
        paddingHorizontal: rs(14),
        marginBottom: rs(2),
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowOffset: { width: 0, height: 1 },
        elevation: 1,
    },
    separator: { height: 1, backgroundColor: Colors.divider },

    // Boş durum
    empty: { alignItems: 'center', marginTop: rs(60), gap: rs(10) },
    emptyTitle: { fontSize: rs(17), fontWeight: '700', color: Colors.textFaint },
    emptySub: { fontSize: rs(13), color: Colors.textLight, textAlign: 'center' },

    // Kategori yönetimi
    catSection: { backgroundColor: Colors.surface, borderRadius: rs(16), padding: rs(16), marginBottom: rs(16) },
    catHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: rs(12) },
    catTitle: { fontSize: rs(15), fontWeight: '700', color: '#333' },
    catAddBtn: { fontSize: rs(13), color: Colors.primary, fontWeight: '600' },
    catEmpty: { fontSize: rs(13), color: Colors.textFaint, textAlign: 'center', paddingVertical: rs(12) },
    catRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: rs(10), gap: rs(12) },
    catIcon: { width: rs(36), height: rs(36), borderRadius: rs(10), justifyContent: 'center', alignItems: 'center' },
    catName: { flex: 1, fontSize: rs(14), fontWeight: '500', color: '#333' },
    budgetBtn: { paddingRight: rs(8) },
    budgetBtnText: { fontSize: rs(12), fontWeight: '600' },

    // Bütçe modal
    budgetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', padding: rs(24) },
    budgetModal: { backgroundColor: '#fff', borderRadius: rs(20), padding: rs(24), width: '100%' },
    budgetModalTitle: { fontSize: rs(16), fontWeight: '700', color: '#333', marginBottom: rs(4) },
    budgetModalSub: { fontSize: rs(12), color: '#aaa', marginBottom: rs(16) },
    budgetInputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: rs(12), paddingHorizontal: rs(14), marginBottom: rs(20) },
    budgetCurrency: { fontSize: rs(22), fontWeight: '700', color: '#333', marginRight: rs(6) },
    budgetInput: { flex: 1, fontSize: rs(22), fontWeight: '700', color: '#333', paddingVertical: rs(12) },
    budgetBtnRow: { flexDirection: 'row', gap: rs(10) },
    budgetActionBtn: { flex: 1, padding: rs(14), borderRadius: rs(12), alignItems: 'center' },
});