// src/screens/goals/hooks/useGoals.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Goal, HistoryItem, WeeklyStats } from '../types/goal';

const STORAGE_KEY = '@goals_data';

export const useGoals = () => {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadGoals();
    }, []);

    const getMonday = (d: Date) => {
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Pazar günü ayarı
        const monday = new Date(d.setDate(diff));
        monday.setHours(0, 0, 0, 0);
        return monday;
    };

    const getHistory = (): HistoryItem[] => {
        const historyData: HistoryItem[] = [];
        const today = new Date();
        const currentWeekMonday = getMonday(new Date(today)); // Bu haftanın başı

        // Son 3 haftayı kontrol edelim (i=1 geçen hafta, i=2 önceki hafta...)
        for (let i = 1; i <= 3; i++) {
            // 1. Haftanın başlangıç (Pzt) ve bitiş (Paz) tarihlerini hesapla
            const startOfWeek = new Date(currentWeekMonday);
            startOfWeek.setDate(startOfWeek.getDate() - (i * 7));

            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(endOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);

            // 2. Bu hafta aralığındaki toplam hedef ve yapılan sayısını bul
            let totalTarget = 0;
            let totalDone = 0;

            goals.forEach(goal => {
                totalTarget += goal.targetCount; // O hafta için hedeflenen (Örn: 5 gün)

                // Bu hedefin completedDays dizisinde, o haftaya düşen kaç tarih var?
                const doneInWeek = goal.completedDays.filter(dateStr => {
                    const d = new Date(dateStr);
                    return d >= startOfWeek && d <= endOfWeek;
                }).length;

                totalDone += doneInWeek;
            });

            // 3. Yüzdeyi hesapla
            const rate = totalTarget > 0 ? Math.round((totalDone / totalTarget) * 100) : 0;

            // 4. Renk belirle (Başarıya göre)
            let color = '#E0E0E0'; // Gri (0%)
            if (rate >= 80) color = '#69F0AE'; // Yeşil (Yüksek)
            else if (rate >= 50) color = '#FFD740'; // Sarı (Orta)
            else if (rate > 0) color = '#FF6D00'; // Turuncu (Düşük)

            // 5. Ay ismini al (Örn: Kasım)
            const monthName = startOfWeek.toLocaleDateString('tr-TR', { month: 'long' });

            historyData.push({
                week: `${startOfWeek.getDate()} ${monthName} Haftası`,
                completedRate: rate,
                label: `${i * 7} gün önce`,
                color: color
            });
        }

        return historyData;
    };

    // YENİ: Hedef Silme Fonksiyonu
    const removeGoal = (id: string) => {
        setGoals(prevGoals => {
            // ID'si eşleşmeyenleri filtrele (yani eşleşeni çıkar)
            const updatedGoals = prevGoals.filter(goal => goal.id !== id);
            saveGoals(updatedGoals); // Güncel listeyi kaydet
            return updatedGoals;
        });
    };
    // YARDIMCI: Haftanın gününe göre tarih stringi döndürür (Pazartesi = 0)
    const getWeekDate = (dayIndex: number) => {
        const d = new Date();
        const currentDay = d.getDay(); // 0 = Pazar, 1 = Pzt ...

        // Şu anki günü Pazartesi endeksli (0-6) hale getir
        const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;

        // Hedef günü hesapla (Bugün - Pazartesiye Uzaklık + Hedeflenen Index)
        d.setDate(d.getDate() - distanceToMonday + dayIndex);

        return d.toISOString().split('T')[0]; // "2023-12-15" formatı
    };

    const toggleDayCompletion = (goalId: string, dayIndex: number) => {
        const targetDate = getWeekDate(dayIndex); // Örn: "2023-12-12"

        setGoals(prevGoals => {
            const updatedGoals = prevGoals.map(goal => {
                if (goal.id === goalId) {
                    const isCompleted = goal.completedDays.includes(targetDate);
                    let newCompletedDays;

                    if (isCompleted) {
                        // Varsa çıkar (Uncheck)
                        newCompletedDays = goal.completedDays.filter(d => d !== targetDate);
                    } else {
                        // Yoksa ekle (Check)
                        newCompletedDays = [...goal.completedDays, targetDate];
                    }

                    // CurrentCount'u da güncelleyelim (tamamlanan gün sayısı kadar)
                    return {
                        ...goal,
                        completedDays: newCompletedDays,
                        currentCount: newCompletedDays.length
                    };
                }
                return goal;
            });

            saveGoals(updatedGoals);
            return updatedGoals;
        });
    };


    const loadGoals = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
            if (jsonValue != null) {
                setGoals(JSON.parse(jsonValue));
            } else {
                setGoals([]); // Başlangıçta boş veya dummy veri
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const saveGoals = async (newGoals: Goal[]) => {
        try {
            const jsonValue = JSON.stringify(newGoals);
            await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
        } catch (e) {
            console.error("Veri kaydedilemedi", e);
        }
    };

    // YENİ EKLENEN FONKSİYON
    const addGoal = (newGoalData: Omit<Goal, 'id' | 'currentCount' | 'completedDays'>) => {
        const newGoal: Goal = {
            id: Date.now().toString(), // Basit ID oluşturucu
            currentCount: 0,
            completedDays: [],
            ...newGoalData,
        };

        const updatedGoals = [...goals, newGoal];
        setGoals(updatedGoals);
        saveGoals(updatedGoals);
    };

    const getStats = (): WeeklyStats => {
        const totalGoals = goals.length;
        // Mevcut sayı hedef sayıya eşit veya büyükse tamamlanmış say
        const completed = goals.filter(g => g.currentCount >= g.targetCount).length;

        // --- DİNAMİK STREAK (SERİ) HESAPLAMA ---

        // 1. Tüm tamamlanmış tarihleri tek bir Set (küme) içinde topla (Tekrarları önlemek için)
        const allCompletedDates = new Set<string>();
        goals.forEach(goal => {
            goal.completedDays.forEach(date => allCompletedDates.add(date));
        });

        let streak = 0;
        const checkDate = new Date();

        // Helper: Date objesini veritabanındaki formatla aynı stringe çevir (YYYY-MM-DD)
        // Not: UTC kullandığımız için tutarlılık adına toISOString kullanıyoruz
        const toDateString = (date: Date) => date.toISOString().split('T')[0];

        // 2. Bugün herhangi bir şey yapıldı mı kontrol et
        if (allCompletedDates.has(toDateString(checkDate))) {
            streak++;
        }

        // 3. Döngüyle dünden geriye doğru git
        // Düne geç
        checkDate.setDate(checkDate.getDate() - 1);

        // Tarih kümesinde o gün varsa seriyi artır, yoksa döngüyü kır
        while (allCompletedDates.has(toDateString(checkDate))) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1); // Bir gün daha geri git
        }

        // ----------------------------------------

        return {
            completionRate: totalGoals > 0 ? Math.round((completed / totalGoals) * 100) : 0,
            goalsCompleted: completed,
            activeGoals: totalGoals,
            dayStreak: streak, // Artık hesaplanan gerçek veriyi dönüyor
        };

    };

    return { goals, loading, addGoal, toggleDayCompletion, getStats, getWeekDate, removeGoal, getHistory };
};