// src/screens/goals/hooks/useGoals.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import { Goal, HistoryItem, WeeklyStats } from '../types/goal';

const STORAGE_KEY = '@goals_data';

export const useGoals = () => {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);
    const isLoaded = useRef(false);

    useEffect(() => {
        loadGoals();
    }, []);

    useEffect(() => {
        if (!isLoaded.current) return;
        saveGoals(goals);
    }, [goals]);

    // Haftanın Pazartesi'sini döndür
    const getMonday = (d: Date): Date => {
        const date = new Date(d);
        date.setHours(0, 0, 0, 0);
        const day = date.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        date.setDate(date.getDate() + diff);
        return date;
    };

    // Bu haftanın Pazartesi ve Pazar'ını döndür
    const getCurrentWeekRange = (): { start: Date; end: Date } => {
        const start = getMonday(new Date());
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        return { start, end };
    };

    // Bir hedefin bu haftaki tamamlanan gün sayısını hesapla
    const getThisWeekCount = (goal: Goal): number => {
        const { start, end } = getCurrentWeekRange();
        return goal.completedDays.filter(dateStr => {
            const d = new Date(dateStr);
            return d >= start && d <= end;
        }).length;
    };

    const toDateStr = (d: Date): string => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    const getHistory = (): HistoryItem[] => {
        const historyData: HistoryItem[] = [];
        const currentWeekMonday = getMonday(new Date());
        const MONTHS_TR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

        for (let i = 1; i <= 3; i++) {
            const startOfWeek = new Date(currentWeekMonday);
            startOfWeek.setDate(startOfWeek.getDate() - (i * 7));

            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(endOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);

            let totalTarget = 0;
            let totalDone = 0;

            const allGoals = goals; // aktif + arşivlenenler dahil (goals state hepsi)

            const goalDetails = allGoals.map(goal => {
                const daysInWeek = goal.completedDays.filter(dateStr => {
                    const d = new Date(dateStr.replace(/-/g, '/'));
                    return d >= startOfWeek && d <= endOfWeek;
                });
                totalTarget += goal.targetCount;
                totalDone += daysInWeek.length;
                return {
                    goalId: goal.id,
                    title: goal.title,
                    icon: goal.icon,
                    color: goal.color,
                    completedDays: daysInWeek,
                    targetCount: goal.targetCount,
                };
            }).filter(g => g.targetCount > 0);

            const rate = totalTarget > 0 ? Math.round((totalDone / totalTarget) * 100) : 0;

            let color = '#E0E0E0';
            if (rate >= 80) color = '#69F0AE';
            else if (rate >= 50) color = '#FFD740';
            else if (rate > 0) color = '#FF6D00';

            historyData.push({
                week: `${startOfWeek.getDate()} ${MONTHS_TR[startOfWeek.getMonth()]} Haftası`,
                completedRate: rate,
                label: `${i * 7} gün önce`,
                color,
                startDate: toDateStr(startOfWeek),
                endDate: toDateStr(endOfWeek),
                goals: goalDetails,
            });
        }

        return historyData;
    };

    const removeGoal = (id: string) => {
        setGoals(prevGoals => prevGoals.filter(goal => goal.id !== id));
    };

    // Haftanın gününe göre tarih stringi döndürür (Pazartesi = index 0)
    const getWeekDate = (dayIndex: number): string => {
        const d = new Date();
        const currentDay = d.getDay();
        const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
        d.setDate(d.getDate() - distanceToMonday + dayIndex);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    const toggleDayCompletion = (goalId: string, dayIndex: number) => {
        const targetDate = getWeekDate(dayIndex);

        setGoals(prevGoals => {
            return prevGoals.map(goal => {
                if (goal.id !== goalId) return goal;

                const isCompleted = goal.completedDays.includes(targetDate);
                const newCompletedDays = isCompleted
                    ? goal.completedDays.filter(d => d !== targetDate)
                    : [...goal.completedDays, targetDate];

                // currentCount sadece bu haftanın tamamlanan gün sayısı
                const { start, end } = getCurrentWeekRange();
                const thisWeekCount = newCompletedDays.filter(dateStr => {
                    const d = new Date(dateStr);
                    return d >= start && d <= end;
                }).length;

                return {
                    ...goal,
                    completedDays: newCompletedDays,
                    currentCount: thisWeekCount,
                };
            });
        });
    };

    const loadGoals = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
            if (jsonValue != null) {
                const parsed: Goal[] = JSON.parse(jsonValue);
                // Yükleme sonrası currentCount'ları bu haftaya göre düzelt
                const corrected = parsed.map(goal => ({
                    ...goal,
                    currentCount: getThisWeekCountFromData(goal),
                    notes: goal.notes ?? {},
                    isArchived: goal.isArchived ?? false,
                }));
                setGoals(corrected);
            } else {
                setGoals([]);
            }
        } catch (e) {
            console.error(e);
        } finally {
            isLoaded.current = true;
            setLoading(false);
        }
    };

    // loadGoals içinde kullanmak için state'e bağımlı olmayan saf fonksiyon
    const getThisWeekCountFromData = (goal: Goal): number => {
        const start = getMonday(new Date());
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        return goal.completedDays.filter(dateStr => {
            const d = new Date(dateStr);
            return d >= start && d <= end;
        }).length;
    };

    const saveGoals = async (newGoals: Goal[]) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newGoals));
        } catch (e) {
            console.error('Veri kaydedilemedi', e);
        }
    };

    const addGoal = (newGoalData: Omit<Goal, 'id' | 'currentCount' | 'completedDays' | 'notes' | 'isArchived'>) => {
        const newGoal: Goal = {
            id: Date.now().toString(),
            currentCount: 0,
            completedDays: [],
            notes: {},
            isArchived: false,
            ...newGoalData,
        };
        setGoals(prev => [...prev, newGoal]);
    };

    // Belirli bir güne not ekle / güncelle
    const addNote = (goalId: string, date: string, note: string) => {
        setGoals(prev => prev.map(g => {
            if (g.id !== goalId) return g;
            const newNotes = { ...g.notes };
            if (note.trim() === '') {
                delete newNotes[date];
            } else {
                newNotes[date] = note.trim();
            }
            return { ...g, notes: newNotes };
        }));
    };

    // Hedefi arşivle
    const archiveGoal = (goalId: string) => {
        const today = new Date();
        const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        setGoals(prev => prev.map(g =>
            g.id === goalId ? { ...g, isArchived: true, archivedAt: dateStr } : g
        ));
    };

    // Arşivden geri al
    const unarchiveGoal = (goalId: string) => {
        setGoals(prev => prev.map(g =>
            g.id === goalId ? { ...g, isArchived: false, archivedAt: undefined } : g
        ));
    };

    const getStats = (): WeeklyStats => {
        const totalGoals = goals.length;

        // Bu haftaki tamamlanan gün sayısına göre hesapla
        const completed = goals.filter(g => getThisWeekCount(g) >= g.targetCount).length;

        // Streak: tüm hedeflerden en az biri tamamlanan günler
        const allCompletedDates = new Set<string>();
        goals.forEach(goal => {
            goal.completedDays.forEach(date => allCompletedDates.add(date));
        });

        let streak = 0;
        const checkDate = new Date();
        checkDate.setHours(0, 0, 0, 0);

        const toDateString = (date: Date): string => {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        };

        if (allCompletedDates.has(toDateString(checkDate))) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
            while (allCompletedDates.has(toDateString(checkDate))) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            }
        }

        return {
            completionRate: totalGoals > 0 ? Math.round((completed / totalGoals) * 100) : 0,
            goalsCompleted: completed,
            activeGoals: totalGoals,
            dayStreak: streak,
        };
    };

    // Aktif ve arşivlenmiş hedefleri ayır
    const activeGoals = goals.filter(g => !g.isArchived);
    const archivedGoals = goals.filter(g => g.isArchived);

    return {
        goals: activeGoals,
        archivedGoals,
        loading,
        addGoal,
        addNote,
        archiveGoal,
        unarchiveGoal,
        toggleDayCompletion,
        getStats,
        getWeekDate,
        removeGoal,
        getHistory,
        reload: loadGoals,
    };
};