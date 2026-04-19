import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import { Category, MonthSummary, Transaction } from '../types/expense';

const TRANSACTIONS_KEY = '@expenses_transactions';
const CATEGORIES_KEY = '@expenses_categories';

const MONTHS_TR = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

// Sabit gelir kategorisi — silinemez
export const INCOME_CATEGORY: Category = {
    id: 'income',
    name: 'Gelir',
    icon: 'cash-plus',
    color: '#43A047',
};

const toDateStr = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const toMonthStr = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
};

const monthLabel = (monthStr: string): string => {
    const [y, m] = monthStr.split('-').map(Number);
    return `${MONTHS_TR[m - 1]} ${y}`;
};

export const useExpenses = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(() => toMonthStr(new Date()));

    const txLoaded = useRef(false);
    const catLoaded = useRef(false);

    useEffect(() => { loadAll(); }, []);

    useEffect(() => {
        if (!txLoaded.current) return;
        AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions)).catch(console.error);
    }, [transactions]);

    useEffect(() => {
        if (!catLoaded.current) return;
        AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories)).catch(console.error);
    }, [categories]);

    const loadAll = async () => {
        try {
            const [txJson, catJson] = await Promise.all([
                AsyncStorage.getItem(TRANSACTIONS_KEY),
                AsyncStorage.getItem(CATEGORIES_KEY),
            ]);
            if (txJson) setTransactions(JSON.parse(txJson));
            if (catJson) setCategories(JSON.parse(catJson));
        } catch (e) {
            console.error('Yükleme hatası', e);
        } finally {
            txLoaded.current = true;
            catLoaded.current = true;
            setLoading(false);
        }
    };

    // --- KATEGORİ CRUD ---

    const addCategory = (data: Omit<Category, 'id'>) => {
        const newCat: Category = { ...data, id: Date.now().toString() };
        setCategories(prev => [...prev, newCat]);
    };

    const removeCategory = (id: string) => {
        // Kategoriye bağlı işlemleri "Diğer" olarak işaretle
        setTransactions(prev =>
            prev.map(t => t.categoryId === id ? { ...t, categoryId: 'other' } : t)
        );
        setCategories(prev => prev.filter(c => c.id !== id));
    };

    // --- İŞLEM CRUD ---

    const addTransaction = (data: Omit<Transaction, 'id' | 'createdAt'>) => {
        const tx: Transaction = {
            ...data,
            id: Date.now().toString(),
            createdAt: Date.now(),
        };
        setTransactions(prev => [tx, ...prev]);
    };

    const removeTransaction = (id: string) => {
        setTransactions(prev => prev.filter(t => t.id !== id));
    };

    // --- HESAPLAMALAR ---

    // Seçili aydaki işlemler — yeniden eskiye sıralı
    const monthTransactions = transactions
        .filter(t => t.date.startsWith(selectedMonth))
        .sort((a, b) => b.createdAt - a.createdAt);

    // Günlere göre gruplu işlemler
    const groupedByDay = (): { date: string; items: Transaction[] }[] => {
        const map = new Map<string, Transaction[]>();
        for (const tx of monthTransactions) {
            if (!map.has(tx.date)) map.set(tx.date, []);
            map.get(tx.date)!.push(tx);
        }
        return Array.from(map.entries())
            .sort((a, b) => b[0].localeCompare(a[0]))
            .map(([date, items]) => ({ date, items }));
    };

    // Seçili ay özeti
    const getMonthTotals = (monthStr: string = selectedMonth) => {
        const txs = transactions.filter(t => t.date.startsWith(monthStr));
        const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        return { income, expense, net: income - expense };
    };

    // Kategori dağılımı (sadece giderler)
    const getCategoryBreakdown = () => {
        const expTxs = monthTransactions.filter(t => t.type === 'expense');
        const total = expTxs.reduce((s, t) => s + t.amount, 0);

        const map = new Map<string, number>();
        for (const tx of expTxs) {
            map.set(tx.categoryId, (map.get(tx.categoryId) ?? 0) + tx.amount);
        }

        const allCats = [INCOME_CATEGORY, ...categories];
        return Array.from(map.entries())
            .map(([catId, amount]) => {
                const cat = allCats.find(c => c.id === catId);
                return {
                    categoryId: catId,
                    name: cat?.name ?? 'Diğer',
                    icon: cat?.icon ?? 'help-circle',
                    color: cat?.color ?? '#aaa',
                    amount,
                    percent: total > 0 ? (amount / total) * 100 : 0,
                };
            })
            .sort((a, b) => b.amount - a.amount);
    };

    // Son 6 ayın özeti
    const getPastMonths = (): MonthSummary[] => {
        const result: MonthSummary[] = [];
        const now = new Date();

        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const mStr = toMonthStr(d);
            const { income, expense, net } = getMonthTotals(mStr);
            result.push({ monthStr: mStr, label: monthLabel(mStr), income, expense, net });
        }
        return result;
    };

    // Kategoriyi id'den bul
    const getCategoryById = (id: string): Category => {
        if (id === 'income') return INCOME_CATEGORY;
        return categories.find(c => c.id === id) ?? {
            id: 'other',
            name: 'Diğer',
            icon: 'help-circle',
            color: '#aaa',
        };
    };

    return {
        transactions,
        categories,
        loading,
        selectedMonth,
        setSelectedMonth,
        addCategory,
        removeCategory,
        addTransaction,
        removeTransaction,
        monthTransactions,
        groupedByDay,
        getMonthTotals,
        getCategoryBreakdown,
        getPastMonths,
        getCategoryById,
        toDateStr,
        monthLabel,
    };
};
