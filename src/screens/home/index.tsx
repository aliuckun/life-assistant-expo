import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View
} from 'react-native';

// --- Tipler (minimal, sadece ihtiyaç duyulanlar) ---
interface Task {
    id: string;
    title: string;
    category: string;
    priority: 'Yüksek' | 'Orta' | 'Düşük';
    isCompleted: boolean;
    date: string;
    startTime: string;
}

interface Habit {
    id: string;
    title: string;
    type: 'good' | 'bad';
    frequency: 'daily' | 'weekly' | 'monthly';
    targetCount: number;
    icon: string;
    color: string;
    dailyLog: Record<string, number>;
    createdAt: string;
}

// --- Yardımcılar ---
const toDateStr = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const DAYS_TR = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
const MONTHS_TR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

const getGreeting = (hour: number): string => {
    if (hour < 6) return 'İyi geceler';
    if (hour < 12) return 'Günaydın';
    if (hour < 18) return 'İyi günler';
    return 'İyi akşamlar';
};

const MOTIVATIONS = [
    'Küçük adımlar büyük fark yaratır.',
    'Her gün biraz daha iyi olmak yeter.',
    'Bugün yapabildiğini yarına bırakma.',
    'Alışkanlıklar karakteri, karakter kaderi şekillendirir.',
    'İlerleme mükemmellikten önemlidir.',
    'Bugün zor olanlar yarın alışkanlık olur.',
    'Disiplin, hedeflere giden en kısa yoldur.',
];

const getDailyMotivation = (): string => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return MOTIVATIONS[dayOfYear % MOTIVATIONS.length];
};

// Alışkanlık bugün tamamlandı mı?
const isHabitDoneToday = (habit: Habit): boolean => {
    const today = toDateStr(new Date());
    if (habit.frequency === 'daily') {
        const count = habit.dailyLog[today] ?? 0;
        return habit.type === 'good' ? count >= habit.targetCount : false;
    }
    return false;
};

// Alışkanlık streak hesapla
const getHabitStreak = (habit: Habit): number => {
    let streak = 0;
    const check = new Date();
    check.setHours(0, 0, 0, 0);
    const created = new Date(habit.createdAt.replace(/-/g, '/'));
    created.setHours(0, 0, 0, 0);

    while (check >= created) {
        const dateStr = toDateStr(check);
        const count = habit.dailyLog[dateStr] ?? 0;
        const ok = habit.type === 'good'
            ? count >= habit.targetCount
            : count <= habit.targetCount;
        if (!ok) break;
        streak++;
        check.setDate(check.getDate() - 1);
    }
    return streak;
};

const PRIORITY_ORDER = { 'Yüksek': 0, 'Orta': 1, 'Düşük': 2 };

// ---

export default function HomeScreen() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [habits, setHabits] = useState<Habit[]>([]);

    // Her tab değişiminde veriyi yenile
    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        try {
            const [txJson, habitsJson] = await Promise.all([
                AsyncStorage.getItem('@planner_tasks'),
                AsyncStorage.getItem('@habits_data'),
            ]);
            if (txJson) setTasks(JSON.parse(txJson));
            if (habitsJson) setHabits(JSON.parse(habitsJson));
        } catch (e) {
            console.error('Home veri yükleme hatası', e);
        }
    };

    const today = new Date();
    const todayStr = toDateStr(today);
    const hour = today.getHours();

    // Bugünkü görevler
    const todayTasks = tasks
        .filter(t => t.date === todayStr)
        .sort((a, b) => {
            if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
            return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        });

    const completedTasks = todayTasks.filter(t => t.isCompleted).length;
    const taskProgress = todayTasks.length > 0 ? completedTasks / todayTasks.length : 0;

    // Bugünkü alışkanlıklar (sadece daily)
    const dailyHabits = habits.filter(h => h.frequency === 'daily');
    const completedHabits = dailyHabits.filter(isHabitDoneToday).length;

    // En uzun streak
    const maxStreak = habits.length > 0
        ? Math.max(...habits.map(getHabitStreak))
        : 0;

    const dateLabel = `${DAYS_TR[today.getDay()]}, ${today.getDate()} ${MONTHS_TR[today.getMonth()]}`;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />

            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
            >
                {/* Karşılama */}
                <View style={styles.greetingBlock}>
                    <Text style={styles.dateText}>{dateLabel}</Text>
                    <Text style={styles.greetingText}>{getGreeting(hour)} 👋</Text>
                    <Text style={styles.motivationText}>{getDailyMotivation()}</Text>
                </View>

                {/* Streak kartı */}
                {maxStreak > 0 && (
                    <View style={styles.streakCard}>
                        <Text style={styles.streakEmoji}>🔥</Text>
                        <View style={styles.streakContent}>
                            <Text style={styles.streakTitle}>En uzun seri</Text>
                            <Text style={styles.streakSub}>Alışkanlıklarında {maxStreak} günlük seri var</Text>
                        </View>
                        <Text style={styles.streakCount}>{maxStreak}</Text>
                    </View>
                )}

                {/* Görevler özeti */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Bugünkü Görevler</Text>
                        <Text style={styles.sectionMeta}>
                            {completedTasks}/{todayTasks.length} tamamlandı
                        </Text>
                    </View>

                    {todayTasks.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <MaterialCommunityIcons name="calendar-check-outline" size={28} color="#ddd" />
                            <Text style={styles.emptyText}>Bugün için görev yok</Text>
                        </View>
                    ) : (
                        <View style={styles.card}>
                            {/* Progress bar */}
                            <View style={styles.progressRow}>
                                <View style={styles.progressBg}>
                                    <View style={[styles.progressFill, { width: `${taskProgress * 100}%` }]} />
                                </View>
                                <Text style={styles.progressPct}>%{Math.round(taskProgress * 100)}</Text>
                            </View>

                            {/* İlk 4 görev */}
                            {todayTasks.slice(0, 4).map((task, i) => (
                                <View
                                    key={task.id}
                                    style={[styles.taskRow, i < Math.min(todayTasks.length, 4) - 1 && styles.taskRowBorder]}
                                >
                                    <View style={[
                                        styles.taskDot,
                                        task.isCompleted && styles.taskDotDone,
                                    ]}>
                                        {task.isCompleted && (
                                            <MaterialCommunityIcons name="check" size={10} color="#fff" />
                                        )}
                                    </View>
                                    <Text
                                        style={[styles.taskTitle, task.isCompleted && styles.taskTitleDone]}
                                        numberOfLines={1}
                                    >
                                        {task.title}
                                    </Text>
                                    {task.startTime !== '--:--' && (
                                        <Text style={styles.taskTime}>{task.startTime}</Text>
                                    )}
                                </View>
                            ))}

                            {todayTasks.length > 4 && (
                                <Text style={styles.moreText}>+{todayTasks.length - 4} görev daha</Text>
                            )}
                        </View>
                    )}
                </View>

                {/* Alışkanlıklar özeti */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Günlük Alışkanlıklar</Text>
                        <Text style={styles.sectionMeta}>
                            {completedHabits}/{dailyHabits.length} tamamlandı
                        </Text>
                    </View>

                    {dailyHabits.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <MaterialCommunityIcons name="clipboard-check-outline" size={28} color="#ddd" />
                            <Text style={styles.emptyText}>Henüz alışkanlık yok</Text>
                        </View>
                    ) : (
                        <View style={styles.habitsGrid}>
                            {dailyHabits.map(habit => {
                                const done = isHabitDoneToday(habit);
                                const count = habit.dailyLog[todayStr] ?? 0;
                                const isOver = habit.type === 'bad' && count > habit.targetCount;
                                const accent = isOver ? '#E53935' : habit.color;

                                return (
                                    <View
                                        key={habit.id}
                                        style={[
                                            styles.habitChip,
                                            done && styles.habitChipDone,
                                            isOver && styles.habitChipOver,
                                        ]}
                                    >
                                        <MaterialCommunityIcons
                                            name={habit.icon as any}
                                            size={16}
                                            color={done ? '#fff' : accent}
                                        />
                                        <Text
                                            style={[styles.habitChipText, done && styles.habitChipTextDone]}
                                            numberOfLines={1}
                                        >
                                            {habit.title}
                                        </Text>
                                        {done && (
                                            <MaterialCommunityIcons name="check" size={12} color="#fff" />
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    )}
                </View>

                {/* Hızlı durum kartları */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{todayTasks.length}</Text>
                        <Text style={styles.statLabel}>Görev</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{dailyHabits.length}</Text>
                        <Text style={styles.statLabel}>Alışkanlık</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={[styles.statValue, { color: '#FF6D00' }]}>{maxStreak}</Text>
                        <Text style={styles.statLabel}>🔥 Seri</Text>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA' },
    scroll: { paddingHorizontal: 20, paddingBottom: 100, paddingTop: 16 },

    // Karşılama
    greetingBlock: { marginBottom: 20 },
    dateText: { fontSize: 13, color: '#aaa', marginBottom: 4 },
    greetingText: { fontSize: 28, fontWeight: 'bold', color: '#222', marginBottom: 8 },
    motivationText: {
        fontSize: 14,
        color: '#888',
        fontStyle: 'italic',
        lineHeight: 20,
    },

    // Streak kartı
    streakCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF8E1',
        borderRadius: 16,
        padding: 14,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#FFE082',
    },
    streakEmoji: { fontSize: 28, marginRight: 12 },
    streakContent: { flex: 1 },
    streakTitle: { fontSize: 14, fontWeight: '700', color: '#E65100' },
    streakSub: { fontSize: 12, color: '#BF360C', marginTop: 2 },
    streakCount: { fontSize: 32, fontWeight: 'bold', color: '#FF6D00' },

    // Section
    section: { marginBottom: 20 },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    sectionTitle: { fontSize: 17, fontWeight: '700', color: '#333' },
    sectionMeta: { fontSize: 12, color: '#aaa' },

    // Card
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        elevation: 2,
    },

    // Progress bar
    progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
    progressBg: { flex: 1, height: 6, backgroundColor: '#f0f0f0', borderRadius: 3 },
    progressFill: { height: 6, backgroundColor: '#007AFF', borderRadius: 3 },
    progressPct: { fontSize: 12, fontWeight: '600', color: '#007AFF', minWidth: 34, textAlign: 'right' },

    // Görev satırı
    taskRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 9,
        gap: 10,
    },
    taskRowBorder: { borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
    taskDot: {
        width: 18,
        height: 18,
        borderRadius: 5,
        borderWidth: 2,
        borderColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    taskDotDone: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
    taskTitle: { flex: 1, fontSize: 14, fontWeight: '500', color: '#333' },
    taskTitleDone: { color: '#bbb', textDecorationLine: 'line-through' },
    taskTime: { fontSize: 11, color: '#aaa' },
    moreText: { fontSize: 12, color: '#aaa', textAlign: 'center', marginTop: 10 },

    // Boş durum
    emptyCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        gap: 8,
        shadowColor: '#000',
        shadowOpacity: 0.03,
        elevation: 1,
    },
    emptyText: { fontSize: 13, color: '#ccc' },

    // Alışkanlık chip'leri
    habitsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    habitChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#fff',
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: '#eee',
        maxWidth: '48%',
    },
    habitChipDone: {
        backgroundColor: '#43A047',
        borderColor: '#43A047',
    },
    habitChipOver: {
        backgroundColor: '#FFEBEE',
        borderColor: '#FFCDD2',
    },
    habitChipText: { fontSize: 12, fontWeight: '500', color: '#555', flexShrink: 1 },
    habitChipTextDone: { color: '#fff' },

    // Alt stat kartları
    statsRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.03,
        elevation: 1,
    },
    statValue: { fontSize: 22, fontWeight: 'bold', color: '#333' },
    statLabel: { fontSize: 11, color: '#aaa', marginTop: 3 },
});
