import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import { Habit, HabitStatus } from '../types/habit';

const STORAGE_KEY = '@habits_data';

// String → 'YYYY-MM-DD'
const toDateStr = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const todayStr = (): string => toDateStr(new Date());

// 'YYYY-MM-DD' → Date (LOCAL time, UTC'den değil!)
const parseDate = (dateStr: string): Date => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
};

const getWeekStartStr = (dateStr: string): string => {
    const date = parseDate(dateStr);
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    date.setDate(date.getDate() + diff);
    return toDateStr(date);
};

const weekTotal = (log: Record<string, number>, dateStr: string): number => {
    const start = parseDate(getWeekStartStr(dateStr));
    let total = 0;
    for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        total += log[toDateStr(d)] ?? 0;
    }
    return total;
};

const monthTotal = (log: Record<string, number>, dateStr: string): number => {
    const year = parseInt(dateStr.slice(0, 4));
    const month = parseInt(dateStr.slice(5, 7)) - 1;
    const days = new Date(year, month + 1, 0).getDate();
    let total = 0;
    for (let i = 1; i <= days; i++) {
        const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        total += log[key] ?? 0;
    }
    return total;
};

export const useHabits = () => {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [loading, setLoading] = useState(true);
    const isLoaded = useRef(false);

    useEffect(() => { loadHabits(); }, []);
    useEffect(() => {
        if (!isLoaded.current) return;
        saveHabits(habits);
    }, [habits]);

    const loadHabits = async () => {
        try {
            const json = await AsyncStorage.getItem(STORAGE_KEY);
            if (json) setHabits(JSON.parse(json));
        } catch (e) {
            console.error('Habits yüklenemedi', e);
        } finally {
            isLoaded.current = true;
            setLoading(false);
        }
    };

    const saveHabits = async (data: Habit[]) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.error('Habits kaydedilemedi', e);
        }
    };

    const addHabit = (data: Omit<Habit, 'id' | 'dailyLog' | 'createdAt'>) => {
        const newHabit: Habit = {
            ...data,
            id: Date.now().toString(),
            dailyLog: {},
            createdAt: todayStr(),
        };
        setHabits(prev => [...prev, newHabit]);
    };

    const removeHabit = (id: string) => {
        setHabits(prev => prev.filter(h => h.id !== id));
    };

    // dateStr string olarak geliyor — mutation riski sıfır
    const increment = (id: string, dateStr: string) => {
        // Günlük: seçili güne yaz. Haftalık/aylık: her zaman bugüne yaz.
        const key = (() => {
            const habit = habits.find(h => h.id === id);
            return habit?.frequency === 'daily' ? dateStr : todayStr();
        })();

        setHabits(prev => prev.map(h => {
            if (h.id !== id) return h;
            const effectiveKey = h.frequency === 'daily' ? dateStr : todayStr();
            return { ...h, dailyLog: { ...h.dailyLog, [effectiveKey]: (h.dailyLog[effectiveKey] ?? 0) + 1 } };
        }));
    };

    const decrement = (id: string, dateStr: string) => {
        setHabits(prev => prev.map(h => {
            if (h.id !== id) return h;
            const effectiveKey = h.frequency === 'daily' ? dateStr : todayStr();
            return { ...h, dailyLog: { ...h.dailyLog, [effectiveKey]: Math.max(0, (h.dailyLog[effectiveKey] ?? 0) - 1) } };
        }));
    };

    // dateStr: hangi günün/haftanın/ayın verisi gösterilsin
    const getStatus = (habit: Habit, dateStr: string = todayStr()): HabitStatus => {
        let count: number;

        if (habit.frequency === 'daily') {
            count = habit.dailyLog[dateStr] ?? 0;
        } else if (habit.frequency === 'weekly') {
            count = weekTotal(habit.dailyLog, dateStr);
        } else {
            count = monthTotal(habit.dailyLog, dateStr);
        }

        if (habit.type === 'good') {
            return { count, isCompleted: count >= habit.targetCount, isOverLimit: false };
        } else {
            return { count, isCompleted: false, isOverLimit: count > habit.targetCount };
        }
    };

    // Seçili tarih için bu alışkanlık düzenlenebilir mi?
    // Günlük: her zaman evet. Haftalık: sadece bu haftadaysa. Aylık: sadece bu aydaysa.
    const isEditable = (habit: Habit, dateStr: string): boolean => {
        if (habit.frequency === 'daily') return true;
        if (habit.frequency === 'weekly') {
            return getWeekStartStr(dateStr) === getWeekStartStr(todayStr());
        }
        return dateStr.slice(0, 7) === todayStr().slice(0, 7);
    };

    const getStreak = (habit: Habit): number => {
        if (habit.frequency === 'daily') return getDailyStreak(habit);
        if (habit.frequency === 'weekly') return getWeeklyStreak(habit);
        return getMonthlyStreak(habit);
    };

    const getDailyStreak = (habit: Habit): number => {
        let streak = 0;
        const today = todayStr();

        // Bugün tamamlandıysa bugünden başla, tamamlanmadıysa dünden başla
        const todayCount = habit.dailyLog[today] ?? 0;
        const todayOk = habit.type === 'good'
            ? todayCount >= habit.targetCount
            : todayCount <= habit.targetCount;

        let check = todayOk ? today : (() => {
            const d = parseDate(today);
            d.setDate(d.getDate() - 1);
            return toDateStr(d);
        })();

        // createdAt yerine 365 gün geriye limit koy.
        // Kullanıcı geçmişe veri girebildiğinden createdAt streak'i kesmemeli.
        const limitDate = new Date();
        limitDate.setFullYear(limitDate.getFullYear() - 1);
        const limitStr = toDateStr(limitDate);

        while (check >= limitStr) {
            const count = habit.dailyLog[check] ?? 0;
            // createdAt öncesi günler kayıt yok — good için 0 < target → seriyi keser.
            // Ama kullanıcı o güne log girdiyse sayılmalı, girmemişse kesilmeli. Bu doğru davranış.
            const ok = habit.type === 'good' ? count >= habit.targetCount : count <= habit.targetCount;
            if (!ok) break;
            streak++;
            const d = parseDate(check);
            d.setDate(d.getDate() - 1);
            check = toDateStr(d);
        }
        return streak;
    };

    const getWeeklyStreak = (habit: Habit): number => {
        let streak = 0;
        const thisWeek = getWeekStartStr(todayStr());
        const createdWeek = getWeekStartStr(habit.createdAt);

        // Bu haftayı tamamladıysa bu haftadan başla, tamamlamadıysa geçen haftadan
        const thisWeekCount = weekTotal(habit.dailyLog, thisWeek);
        const thisWeekOk = habit.type === 'good'
            ? thisWeekCount >= habit.targetCount
            : thisWeekCount <= habit.targetCount;

        let checkWeek = thisWeekOk ? thisWeek : (() => {
            const d = parseDate(thisWeek);
            d.setDate(d.getDate() - 7);
            return getWeekStartStr(toDateStr(d));
        })();

        const limitWeek = (() => {
            const d = new Date();
            d.setFullYear(d.getFullYear() - 1);
            return getWeekStartStr(toDateStr(d));
        })();

        while (checkWeek >= limitWeek) {
            const count = weekTotal(habit.dailyLog, checkWeek);
            const ok = habit.type === 'good' ? count >= habit.targetCount : count <= habit.targetCount;
            if (!ok) break;
            streak++;
            const d = parseDate(checkWeek);
            d.setDate(d.getDate() - 7);
            checkWeek = getWeekStartStr(toDateStr(d));
        }
        return streak;
    };

    const getMonthlyStreak = (habit: Habit): number => {
        let streak = 0;
        const thisMonth = todayStr().slice(0, 7);
        const createdMonth = habit.createdAt.slice(0, 7);

        // Bu ay tamamlandıysa bu aydan başla, tamamlanmadıysa geçen aydan
        const thisMonthCount = monthTotal(habit.dailyLog, thisMonth + '-01');
        const thisMonthOk = habit.type === 'good'
            ? thisMonthCount >= habit.targetCount
            : thisMonthCount <= habit.targetCount;

        let checkMonth = thisMonthOk ? thisMonth : (() => {
            const [y, m] = thisMonth.split('-').map(Number);
            const d = new Date(y, m - 2, 1);
            return toDateStr(d).slice(0, 7);
        })();

        const limitMonth = (() => {
            const d = new Date();
            d.setFullYear(d.getFullYear() - 1);
            return toDateStr(d).slice(0, 7);
        })();

        while (checkMonth >= limitMonth) {
            const count = monthTotal(habit.dailyLog, checkMonth + '-01');
            const ok = habit.type === 'good' ? count >= habit.targetCount : count <= habit.targetCount;
            if (!ok) break;
            streak++;
            const [y, m] = checkMonth.split('-').map(Number);
            const d = new Date(y, m - 2, 1);
            checkMonth = toDateStr(d).slice(0, 7);
        }
        return streak;
    };

    const getLast30Days = (habit: Habit) => {
        const today = todayStr();
        return Array.from({ length: 30 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (29 - i));
            const dateStr = toDateStr(d);
            if (dateStr < habit.createdAt) return { date: dateStr, status: 'before_start' as const };
            const s = getStatus(habit, dateStr);
            if (dateStr === today) {
                return { date: dateStr, status: s.isCompleted ? 'completed' as const : s.isOverLimit ? 'failed' as const : 'pending' as const };
            }
            return { date: dateStr, status: (s.isCompleted ? 'completed' : 'failed') as 'completed' | 'failed' };
        });
    };

    return {
        habits, loading,
        addHabit, removeHabit,
        increment, decrement,
        getStatus, getStreak,
        isEditable,
        getLast30Days,
    };
};