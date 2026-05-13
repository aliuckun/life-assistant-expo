import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import { Category, CategoryBreakdownItem, MonthSummary, Transaction } from '../types/expense';

const TRANSACTIONS_KEY = '@expenses_transactions';
const CATEGORIES_KEY = '@expenses_categories';
const RESET_DAY_KEY = '@expenses_reset_day'; // 1-28

const MONTHS_TR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

export const INCOME_CATEGORY: Category = {
    id: 'income', name: 'Gelir', icon: 'cash-plus', color: '#43A047',
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

/**
 * Reset günü bazlı dönem hesaplama.
 * resetDay = 15 ise:
 *   - Bugün 20 Mayıs → dönem: 15 Mayıs – 14 Haziran
 *   - Bugün 10 Mayıs → dönem: 15 Nisan – 14 Mayıs
 */
const getPeriod = (resetDay: number): { start: string; end: string; label: string } => {
    const today = new Date();
    const day = today.getDate();

    let periodStart: Date;
    if (day >= resetDay) {
        periodStart = new Date(today.getFullYear(), today.getMonth(), resetDay);
    } else {
        periodStart = new Date(today.getFullYear(), today.getMonth() - 1, resetDay);
    }

    const periodEnd = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, resetDay - 1);

    const startM = MONTHS_TR[periodStart.getMonth()];
    const endM = MONTHS_TR[periodEnd.getMonth()];
    const label = periodStart.getMonth() === periodEnd.getMonth()
        ? `${periodStart.getDate()} ${startM} – ${periodEnd.getDate()} ${endM} ${periodEnd.getFullYear()}`
        : `${periodStart.getDate()} ${startM} – ${periodEnd.getDate()} ${endM}`;

    return { start: toDateStr(periodStart), end: toDateStr(periodEnd), label };
};

export const useExpenses = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [resetDay, setResetDayState] = useState<number>(1);
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
            const [txJson, catJson, rdJson] = await Promise.all([
                AsyncStorage.getItem(TRANSACTIONS_KEY),
                AsyncStorage.getItem(CATEGORIES_KEY),
                AsyncStorage.getItem(RESET_DAY_KEY),
            ]);

            if (catJson) {
                const parsed = JSON.parse(catJson) as any[];
                const migrated = parsed.map((c: any) => ({ budget: undefined, ...c }));
                setCategories(migrated);
            }

            if (txJson) {
                setTransactions(JSON.parse(txJson));
            }

            if (rdJson) setResetDayState(parseInt(rdJson));
        } catch (e) {
            console.error('Yükleme hatası', e);
        } finally {
            txLoaded.current = true;
            catLoaded.current = true;
            setLoading(false);
        }
    };


    const saveResetDay = async (day: number) => {
        setResetDayState(day);
        await AsyncStorage.setItem(RESET_DAY_KEY, String(day));
    };

    // --- KATEGORİ CRUD ---

    const addCategory = (data: Omit<Category, 'id'>) => {
        setCategories(prev => [...prev, { ...data, id: Date.now().toString() }]);
    };

    const removeCategory = (id: string) => {
        setTransactions(prev => prev.map(t => t.categoryId === id ? { ...t, categoryId: 'other' } : t));
        setCategories(prev => prev.filter(c => c.id !== id));
    };

    const updateCategoryBudget = (id: string, budget: number | undefined) => {
        setCategories(prev => prev.map(c => c.id === id ? { ...c, budget } : c));
    };

    // --- İŞLEM CRUD ---

    const addTransaction = (data: Omit<Transaction, 'id' | 'createdAt'>) => {
        setTransactions(prev => [{ ...data, id: Date.now().toString(), createdAt: Date.now() }, ...prev]);
    };

    const removeTransaction = (id: string) => {
        setTransactions(prev => prev.filter(t => t.id !== id));
    };

    // --- DÖNEM HESAPLAMALARI ---

    // Aktif dönem (reset gününe göre)
    const currentPeriod = getPeriod(resetDay);

    // Dönem içindeki işlemler
    const periodTransactions = transactions
        .filter(t => t.date >= currentPeriod.start && t.date <= currentPeriod.end)
        .sort((a, b) => b.createdAt - a.createdAt);

    // Dönem özeti
    const getPeriodTotals = () => {
        const income = periodTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const expense = periodTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        return { income, expense, net: income - expense };
    };

    // Seçili aya göre işlemler (PastMonths için hâlâ gerekli)
    const monthTransactions = transactions
        .filter(t => t.date.startsWith(selectedMonth))
        .sort((a, b) => b.createdAt - a.createdAt);

    // Günlere göre gruplu — dönem bazlı
    const groupedByDay = (): { date: string; items: Transaction[] }[] => {
        const map = new Map<string, Transaction[]>();
        for (const tx of periodTransactions) {
            if (!map.has(tx.date)) map.set(tx.date, []);
            map.get(tx.date)!.push(tx);
        }
        return Array.from(map.entries())
            .sort((a, b) => b[0].localeCompare(a[0]))
            .map(([date, items]) => ({ date, items }));
    };

    const getMonthTotals = (monthStr: string = selectedMonth) => {
        const txs = transactions.filter(t => t.date.startsWith(monthStr));
        const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        return { income, expense, net: income - expense };
    };

    // Kategori dağılımı — monthStr verilirse o aya göre, yoksa dönem bazlı
    const getCategoryBreakdown = (monthStr?: string): CategoryBreakdownItem[] => {
        const txPool = monthStr
            ? transactions.filter(t => t.date.startsWith(monthStr))
            : periodTransactions;
        const expTxs = txPool.filter(t => t.type === 'expense');
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
                    budget: cat?.budget,
                    amount,
                    percent: total > 0 ? (amount / total) * 100 : 0,
                };
            })
            .sort((a, b) => b.amount - a.amount);
    };

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

    const getCategoryById = (id: string): Category => {
        if (id === 'income') return INCOME_CATEGORY;
        return categories.find(c => c.id === id) ?? { id: 'other', name: 'Diğer', icon: 'help-circle', color: '#aaa' };
    };

    return {
        transactions,
        categories,
        loading,
        resetDay,
        saveResetDay,
        currentPeriod,
        selectedMonth,
        setSelectedMonth,
        addCategory,
        removeCategory,
        updateCategoryBudget,
        addTransaction,
        removeTransaction,
        periodTransactions,
        monthTransactions,
        groupedByDay,
        getMonthTotals,
        getPeriodTotals,
        getCategoryBreakdown,
        getPastMonths,
        getCategoryById,
        toDateStr,
        monthLabel,
    };
};