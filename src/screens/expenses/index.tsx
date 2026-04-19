import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    SectionList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import { AddCategoryModal } from './components/AddCategoryModal';
import { AddTransactionModal } from './components/AddTransactionModal';
import { CategoryBreakdown } from './components/CategoryBreakdown';
import { PastMonths } from './components/PastMonths';
import { TransactionItem } from './components/TransactionItem';
import { useExpenses } from './hooks/useExpenses';
import { Transaction } from './types/expense';

const MONTHS_TR = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];

const fmt = (n: number) => n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// 'YYYY-MM-DD' → 'Bugün' / '19 Nisan'
const dayLabel = (dateStr: string): string => {
    const today = new Date();
    const [y, m, d] = dateStr.split('-').map(Number);
    const isToday = y === today.getFullYear() && m === today.getMonth() + 1 && d === today.getDate();
    if (isToday) return 'Bugün';
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = y === yesterday.getFullYear() && m === yesterday.getMonth() + 1 && d === yesterday.getDate();
    if (isYesterday) return 'Dün';
    return `${d} ${MONTHS_TR[m - 1]}`;
};

type Tab = 'list' | 'summary';

export default function ExpensesScreen() {
    const {
        categories, loading,
        selectedMonth, setSelectedMonth,
        addCategory, removeCategory,
        addTransaction, removeTransaction,
        groupedByDay,
        getMonthTotals,
        getCategoryBreakdown,
        getPastMonths,
        getCategoryById,
        monthLabel,
    } = useExpenses();

    const [tab, setTab] = useState<Tab>('list');
    const [txModalVisible, setTxModalVisible] = useState(false);
    const [catModalVisible, setCatModalVisible] = useState(false);

    const totals = getMonthTotals();
    const groups = groupedByDay();
    const pastMonths = getPastMonths();

    // Seçili ay etiketi
    const [selY, selM] = selectedMonth.split('-').map(Number);
    const currentMonthStr = (() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    })();
    const isCurrentMonth = selectedMonth === currentMonthStr;
    const monthDisplayLabel = isCurrentMonth ? 'Bu Ay' : `${MONTHS_TR[selM - 1]} ${selY}`;

    const handleLongPress = (tx: Transaction) => {
        Alert.alert(
            'İşlemi Sil',
            'Bu işlemi silmek istediğine emin misin?',
            [
                { text: 'Vazgeç', style: 'cancel' },
                { text: 'Sil', style: 'destructive', onPress: () => removeTransaction(tx.id) },
            ]
        );
    };

    const sections = groups.map(g => ({
        title: g.date,
        data: g.items,
        dayTotal: g.items.reduce((s, t) => t.type === 'expense' ? s - t.amount : s + t.amount, 0),
    }));

    if (loading) return null;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Harcamalar</Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => setTxModalVisible(true)}>
                    <MaterialCommunityIcons name="plus" size={26} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Net bakiye kartı */}
            <View style={styles.balanceCard}>
                <View style={styles.balanceMain}>
                    <Text style={styles.balanceLabel}>{monthDisplayLabel} Net Bakiye</Text>
                    <Text style={[styles.balanceAmount, { color: totals.net >= 0 ? '#43A047' : '#E53935' }]}>
                        {totals.net >= 0 ? '+' : ''}₺{fmt(totals.net)}
                    </Text>
                </View>
                <View style={styles.balanceSub}>
                    <View style={styles.balanceSubItem}>
                        <Text style={styles.balanceSubLabel}>Gelir</Text>
                        <Text style={[styles.balanceSubValue, { color: '#43A047' }]}>₺{fmt(totals.income)}</Text>
                    </View>
                    <View style={styles.balanceSubDivider} />
                    <View style={styles.balanceSubItem}>
                        <Text style={styles.balanceSubLabel}>Gider</Text>
                        <Text style={[styles.balanceSubValue, { color: '#E53935' }]}>₺{fmt(totals.expense)}</Text>
                    </View>
                </View>
            </View>

            {/* Tab seçici */}
            <View style={styles.tabRow}>
                <TouchableOpacity
                    style={[styles.tabBtn, tab === 'list' && styles.tabBtnActive]}
                    onPress={() => setTab('list')}
                >
                    <Text style={[styles.tabBtnText, tab === 'list' && styles.tabBtnTextActive]}>Liste</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabBtn, tab === 'summary' && styles.tabBtnActive]}
                    onPress={() => setTab('summary')}
                >
                    <Text style={[styles.tabBtnText, tab === 'summary' && styles.tabBtnTextActive]}>Özet</Text>
                </TouchableOpacity>
            </View>

            {/* İçerik */}
            {tab === 'list' ? (
                <SectionList
                    sections={sections}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    stickySectionHeadersEnabled={false}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <MaterialCommunityIcons name="wallet-outline" size={56} color="#e0e0e0" />
                            <Text style={styles.emptyTitle}>Bu ay işlem yok</Text>
                            <Text style={styles.emptySub}>Sağ üstteki + ile işlem ekle</Text>
                        </View>
                    }
                    renderSectionHeader={({ section }) => (
                        <View style={styles.dayHeader}>
                            <Text style={styles.dayLabel}>{dayLabel(section.title)}</Text>
                            <Text style={[
                                styles.dayTotal,
                                { color: section.dayTotal >= 0 ? '#43A047' : '#E53935' }
                            ]}>
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
                    <CategoryBreakdown data={getCategoryBreakdown()} />
                    <PastMonths
                        data={pastMonths}
                        selectedMonth={selectedMonth}
                        onSelect={setSelectedMonth}
                    />

                    {/* Kategori yönetimi */}
                    <View style={styles.catSection}>
                        <View style={styles.catSectionHeader}>
                            <Text style={styles.catSectionTitle}>Kategoriler</Text>
                            <TouchableOpacity onPress={() => setCatModalVisible(true)}>
                                <Text style={styles.catAddBtn}>+ Ekle</Text>
                            </TouchableOpacity>
                        </View>
                        {categories.length === 0 ? (
                            <Text style={styles.emptyCat}>Henüz kategori yok</Text>
                        ) : (
                            categories.map(cat => (
                                <View key={cat.id} style={styles.catRow}>
                                    <View style={[styles.catIcon, { backgroundColor: cat.color + '18' }]}>
                                        <MaterialCommunityIcons name={cat.icon as any} size={18} color={cat.color} />
                                    </View>
                                    <Text style={styles.catName}>{cat.name}</Text>
                                    <TouchableOpacity
                                        onPress={() => Alert.alert(
                                            'Kategoriyi Sil',
                                            `"${cat.name}" silinsin mi? Bu kategorideki işlemler "Diğer" olarak işaretlenir.`,
                                            [
                                                { text: 'Vazgeç', style: 'cancel' },
                                                { text: 'Sil', style: 'destructive', onPress: () => removeCategory(cat.id) },
                                            ]
                                        )}
                                    >
                                        <MaterialCommunityIcons name="trash-can-outline" size={18} color="#ccc" />
                                    </TouchableOpacity>
                                </View>
                            ))
                        )}
                    </View>
                </ScrollView>
            )}

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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA' },
    header: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', paddingHorizontal: 20, paddingTop: 14, paddingBottom: 10,
    },
    headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#222' },
    addBtn: { backgroundColor: '#007AFF', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
    // Bakiye kartı
    balanceCard: {
        backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 20,
        padding: 20, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.05, elevation: 3,
    },
    balanceMain: { alignItems: 'center', marginBottom: 16 },
    balanceLabel: { fontSize: 12, color: '#aaa', marginBottom: 4 },
    balanceAmount: { fontSize: 32, fontWeight: 'bold' },
    balanceSub: { flexDirection: 'row' },
    balanceSubItem: { flex: 1, alignItems: 'center' },
    balanceSubDivider: { width: 1, backgroundColor: '#f0f0f0' },
    balanceSubLabel: { fontSize: 11, color: '#aaa', marginBottom: 3 },
    balanceSubValue: { fontSize: 14, fontWeight: '600' },
    // Tab
    tabRow: {
        flexDirection: 'row', backgroundColor: '#EBEBEB',
        borderRadius: 12, marginHorizontal: 20, marginBottom: 14, padding: 3,
    },
    tabBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
    tabBtnActive: { backgroundColor: '#fff' },
    tabBtnText: { fontSize: 13, fontWeight: '600', color: '#aaa' },
    tabBtnTextActive: { color: '#333' },
    // Liste
    list: { paddingHorizontal: 20, paddingBottom: 100 },
    dayHeader: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginTop: 16, marginBottom: 8,
    },
    dayLabel: { fontSize: 13, fontWeight: '700', color: '#555' },
    dayTotal: { fontSize: 12, fontWeight: '600' },
    txWrapper: { backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 14, marginBottom: 2 },
    separator: { height: 1, backgroundColor: '#F5F5F5', marginHorizontal: 0 },
    // Boş
    empty: { alignItems: 'center', marginTop: 60 },
    emptyTitle: { fontSize: 17, fontWeight: '600', color: '#ccc', marginTop: 14 },
    emptySub: { fontSize: 13, color: '#ddd', marginTop: 6 },
    // Kategori yönetimi
    catSection: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16 },
    catSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    catSectionTitle: { fontSize: 15, fontWeight: '700', color: '#333' },
    catAddBtn: { fontSize: 13, color: '#007AFF', fontWeight: '600' },
    emptyCat: { fontSize: 13, color: '#ccc', textAlign: 'center', paddingVertical: 12 },
    catRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },
    catIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    catName: { flex: 1, fontSize: 14, fontWeight: '500', color: '#333' },
});
