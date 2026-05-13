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
    View,
} from 'react-native';
import AppStyles, { Colors, rs } from '../../styles';
import { useGoals } from '../goals/hooks/useGoals';
import { SkeletonHome } from './components/Skeleton';
import { WeeklyRing } from './components/WeeklyRing';

interface Task {
    id: string;
    title: string;
    category: string;
    priority: 'Yüksek' | 'Orta' | 'Düşük';
    isCompleted: boolean;
    date: string;
    startTime: string;
}

const toDateStr = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const DAYS_TR = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
const DAYS_SHORT = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
const MONTHS_TR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

const shortDateLabel = (dateStr: string): string => {
    const [, m, d] = dateStr.split('-').map(Number);
    return `${d} ${MONTHS_TR[m - 1]}`;
};

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
    'İlerleme mükemmellikten önemlidir.',
    'Bugün zor olanlar yarın alışkanlık olur.',
    'Disiplin, hedeflere giden en kısa yoldur.',
];

const getDailyMotivation = (): string => {
    const dayOfYear = Math.floor(
        (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    return MOTIVATIONS[dayOfYear % MOTIVATIONS.length];
};

const PRIORITY_ORDER: Record<string, number> = { 'Yüksek': 0, 'Orta': 1, 'Düşük': 2 };
const PRIORITY_COLOR: Record<string, string> = {
    'Yüksek': '#E53935',
    'Orta': '#FB8C00',
    'Düşük': '#43A047',
};

// ── Alt bileşenler ────────────────────────────────────────────────────────────

const TaskRow = ({ task, showDate = false, isLast = false }: {
    task: Task; showDate?: boolean; isLast?: boolean;
}) => (
    <View style={[styles.taskRow, !isLast && styles.taskRowBorder]}>
        <View style={[styles.priorityDot, { backgroundColor: PRIORITY_COLOR[task.priority] }]} />
        <View style={styles.taskBody}>
            <Text style={styles.taskTitle} numberOfLines={1}>{task.title}</Text>
            {showDate
                ? <Text style={styles.taskDateBadge}>{shortDateLabel(task.date)}</Text>
                : task.startTime !== '--:--' && <Text style={styles.taskTime}>{task.startTime}</Text>
            }
        </View>
    </View>
);

const PanelEmpty = ({ icon, text }: { icon: string; text: string }) => (
    <View style={styles.panelEmpty}>
        <MaterialCommunityIcons name={icon as any} size={22} color="#ddd" />
        <Text style={styles.panelEmptyText}>{text}</Text>
    </View>
);

const StatCard = ({ icon, value, label, color }: {
    icon: string; value: string | number; label: string; color?: string;
}) => (
    <View style={styles.statCard}>
        <View style={[styles.statIconBg, { backgroundColor: (color ?? Colors.primary) + '15' }]}>
            <MaterialCommunityIcons name={icon as any} size={rs(18)} color={color ?? Colors.primary} />
        </View>
        <Text style={[styles.statValue, color ? { color } : {}]}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

// ── Ana ekran ─────────────────────────────────────────────────────────────────

export default function HomeScreen() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [animKey, setAnimKey] = useState(0);
    const { goals, getWeekDate, reload: reloadGoals } = useGoals();

    useFocusEffect(useCallback(() => {
        loadData();
        reloadGoals();
        setAnimKey(k => k + 1);
    }, []));

    const loadData = async () => {
        try {
            const json = await AsyncStorage.getItem('@planner_tasks');
            if (json) setTasks(JSON.parse(json));
        } catch (e) {
            console.error('Home veri yükleme hatası', e);
        } finally {
            setLoading(false);
        }
    };

    const today = new Date();
    const todayStr = toDateStr(today);
    const hour = today.getHours();
    const dateLabel = `${DAYS_TR[today.getDay()]}, ${today.getDate()} ${MONTHS_TR[today.getMonth()]}`;

    const todayAll = tasks.filter(t => t.date === todayStr);
    const todayPending = todayAll.filter(t => !t.isCompleted)
        .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]).slice(0, 3);
    const completedCount = todayAll.filter(t => t.isCompleted).length;
    const taskProgress = todayAll.length > 0 ? completedCount / todayAll.length : 0;
    const todayPendingTotal = todayAll.filter(t => !t.isCompleted).length;

    const upcomingHigh = tasks
        .filter(t => t.date > todayStr && t.priority === 'Yüksek' && !t.isCompleted)
        .sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);
    const upcomingHighTotal = tasks.filter(
        t => t.date > todayStr && t.priority === 'Yüksek' && !t.isCompleted
    ).length;

    const totalPending = tasks.filter(t => !t.isCompleted && t.date >= todayStr).length;

    const dayBars = Array.from({ length: 7 }, (_, i) => {
        const dateStr = getWeekDate(i);
        const d = new Date(dateStr.replace(/-/g, '/'));
        return {
            label: DAYS_SHORT[d.getDay()],
            total: goals.length,
            completed: goals.filter(g => g.completedDays.includes(dateStr)).length,
            isToday: dateStr === todayStr,
        };
    });

    const pastBars = dayBars.filter((_, i) => getWeekDate(i) <= todayStr);
    const weekTotal = pastBars.reduce((s, d) => s + d.total, 0);
    const weekCompleted = pastBars.reduce((s, d) => s + d.completed, 0);
    const weekPercent = weekTotal > 0 ? Math.round((weekCompleted / weekTotal) * 100) : 0;

    if (loading) {
        return (
            <SafeAreaView style={AppStyles.container}>
                <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
                <ScrollView showsVerticalScrollIndicator={false}>
                    <SkeletonHome />
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={AppStyles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                {/* ── Karşılama ──────────────────────────────────────────── */}
                <View style={styles.greeting}>
                    <Text style={styles.greetingDate}>{dateLabel}</Text>
                    <Text style={styles.greetingText}>{getGreeting(hour)} 👋</Text>
                    <View style={styles.motivationChip}>
                        <MaterialCommunityIcons name="lightning-bolt" size={rs(12)} color={Colors.primary} />
                        <Text style={styles.motivationText}>{getDailyMotivation()}</Text>
                    </View>
                </View>

                {/* ── Haftalık özet kartı ────────────────────────────────── */}
                <View style={styles.weeklyCard}>
                    <View style={styles.weeklyHeader}>
                        <View>
                            <Text style={styles.weeklyTitle}>Haftalık Özet</Text>
                            <Text style={styles.weeklyMeta}>{weekCompleted}/{weekTotal} hedef tamamlandı</Text>
                        </View>
                        <View style={[styles.weeklyBadge, {
                            backgroundColor: weekPercent >= 80 ? Colors.success + '18'
                                : weekPercent >= 50 ? '#FB8C0018' : Colors.danger + '18'
                        }]}>
                            <Text style={[styles.weeklyBadgeText, {
                                color: weekPercent >= 80 ? Colors.success
                                    : weekPercent >= 50 ? '#FB8C00' : Colors.danger
                            }]}>%{weekPercent}</Text>
                        </View>
                    </View>
                    <WeeklyRing percent={weekPercent} dayBars={dayBars} animate={animKey > 0} />
                </View>

                {/* ── İkili panel ────────────────────────────────────────── */}
                <View style={styles.splitCard}>

                    {/* Bugün */}
                    <View style={styles.panel}>
                        <View style={styles.panelHeader}>
                            <Text style={styles.panelTitle}>Bugün</Text>
                            <Text style={[styles.panelBadge, {
                                backgroundColor: completedCount === todayAll.length && todayAll.length > 0
                                    ? Colors.success + '18' : Colors.primary + '12',
                                color: completedCount === todayAll.length && todayAll.length > 0
                                    ? Colors.success : Colors.primary,
                            }]}>{completedCount}/{todayAll.length}</Text>
                        </View>

                        {/* Progress bar */}
                        <View style={styles.progressBg}>
                            <View style={[styles.progressFill, {
                                width: `${taskProgress * 100}%` as any,
                                backgroundColor: taskProgress === 1 ? Colors.success : Colors.primary,
                            }]} />
                        </View>

                        {todayAll.length === 0 ? (
                            <PanelEmpty icon="calendar-check-outline" text="Görev yok" />
                        ) : todayPending.length === 0 ? (
                            <View style={styles.allDoneRow}>
                                <MaterialCommunityIcons name="check-circle" size={rs(15)} color={Colors.success} />
                                <Text style={styles.allDoneText}>Hepsi tamam 🎉</Text>
                            </View>
                        ) : (
                            <>
                                {todayPending.map((task, i) => (
                                    <TaskRow key={task.id} task={task}
                                        isLast={i === todayPending.length - 1 && todayPendingTotal <= 3} />
                                ))}
                                {todayPendingTotal > 3 && (
                                    <Text style={styles.moreText}>+{todayPendingTotal - 3} daha</Text>
                                )}
                            </>
                        )}
                    </View>

                    <View style={styles.divider} />

                    {/* Yaklaşan */}
                    <View style={styles.panel}>
                        <View style={styles.panelHeader}>
                            <Text style={styles.panelTitle}>Yaklaşan</Text>
                            <View style={styles.highPriBadge}>
                                <MaterialCommunityIcons name="flag" size={rs(9)} color={Colors.danger} />
                                <Text style={styles.highPriBadgeText}>Yüksek</Text>
                            </View>
                        </View>
                        <View style={styles.progressPlaceholder} />

                        {upcomingHigh.length === 0 ? (
                            <PanelEmpty icon="flag-outline" text="Yüksek öncelikli görev yok" />
                        ) : (
                            <>
                                {upcomingHigh.map((task, i) => (
                                    <TaskRow key={task.id} task={task} showDate
                                        isLast={i === upcomingHigh.length - 1 && upcomingHighTotal <= 3} />
                                ))}
                                {upcomingHighTotal > 3 && (
                                    <Text style={styles.moreText}>+{upcomingHighTotal - 3} daha</Text>
                                )}
                            </>
                        )}
                    </View>

                </View>

                {/* ── Stat kartları ──────────────────────────────────────── */}
                <View style={styles.statsRow}>
                    <StatCard
                        icon="check-circle-outline"
                        value={completedCount}
                        label="Tamamlanan"
                        color={Colors.success}
                    />
                    <StatCard
                        icon="clock-outline"
                        value={totalPending}
                        label="Bekleyen"
                        color={Colors.primary}
                    />
                    <StatCard
                        icon="alert-circle-outline"
                        value={upcomingHighTotal}
                        label="Yüksek öncelik"
                        color={upcomingHighTotal > 0 ? Colors.danger : Colors.textLight}
                    />
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({

    scroll: {
        paddingHorizontal: rs(20),
        paddingBottom: rs(100),
        paddingTop: rs(16),
    },

    // ── Karşılama ──────────────────────────────────────────────────────────
    greeting: {
        marginBottom: rs(20),
    },
    greetingDate: {
        fontSize: rs(12),
        color: Colors.textLight,
        fontWeight: '500',
        letterSpacing: 0.3,
        marginBottom: rs(4),
    },
    greetingText: {
        fontSize: rs(28),
        fontWeight: '800',
        color: Colors.textPrimary,
        letterSpacing: -0.5,
        marginBottom: rs(10),
    },
    motivationChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: rs(5),
        alignSelf: 'flex-start',
        backgroundColor: Colors.primary + '10',
        paddingHorizontal: rs(10),
        paddingVertical: rs(5),
        borderRadius: rs(20),
    },
    motivationText: {
        fontSize: rs(12),
        color: Colors.primary,
        fontWeight: '500',
    },

    // ── Haftalık özet kartı ────────────────────────────────────────────────
    weeklyCard: {
        backgroundColor: Colors.surface,
        borderRadius: rs(20),
        padding: rs(18),
        marginBottom: rs(14),
        shadowColor: Colors.shadow,
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 8,
        elevation: 3,
    },
    weeklyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: rs(14),
    },
    weeklyTitle: {
        fontSize: rs(15),
        fontWeight: '700',
        color: Colors.textSecondary,
    },
    weeklyMeta: {
        fontSize: rs(11),
        color: Colors.textLight,
        marginTop: rs(2),
    },
    weeklyBadge: {
        paddingHorizontal: rs(12),
        paddingVertical: rs(5),
        borderRadius: rs(20),
    },
    weeklyBadgeText: {
        fontSize: rs(14),
        fontWeight: '800',
    },

    // ── İkili panel ────────────────────────────────────────────────────────
    splitCard: {
        flexDirection: 'row',
        backgroundColor: Colors.surface,
        borderRadius: rs(20),
        marginBottom: rs(14),
        shadowColor: Colors.shadow,
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 8,
        elevation: 3,
        overflow: 'hidden',
    },
    panel: {
        flex: 1,
        padding: rs(14),
        paddingBottom: rs(16),
    },
    divider: {
        width: 1,
        backgroundColor: Colors.divider,
        marginVertical: rs(12),
    },
    panelHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: rs(10),
    },
    panelTitle: {
        fontSize: rs(13),
        fontWeight: '700',
        color: Colors.textSecondary,
        letterSpacing: 0.2,
    },
    panelBadge: {
        fontSize: rs(10),
        fontWeight: '700',
        paddingHorizontal: rs(7),
        paddingVertical: rs(2),
        borderRadius: rs(10),
    },
    highPriBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: rs(3),
        backgroundColor: Colors.danger + '12',
        paddingHorizontal: rs(7),
        paddingVertical: rs(2),
        borderRadius: rs(10),
    },
    highPriBadgeText: {
        fontSize: rs(9),
        fontWeight: '700',
        color: Colors.danger,
    },
    progressBg: {
        height: rs(3),
        backgroundColor: Colors.divider,
        borderRadius: rs(2),
        marginBottom: rs(12),
    },
    progressFill: {
        height: rs(3),
        borderRadius: rs(2),
    },
    progressPlaceholder: {
        height: rs(15),
    },

    // ── Görev satırı ───────────────────────────────────────────────────────
    taskRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: rs(6),
        gap: rs(7),
    },
    taskRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: Colors.separator,
    },
    priorityDot: {
        width: rs(5),
        height: rs(5),
        borderRadius: rs(3),
        marginTop: rs(5),
        flexShrink: 0,
    },
    taskBody: { flex: 1, gap: rs(1) },
    taskTitle: {
        fontSize: rs(12),
        fontWeight: '500',
        color: Colors.textSecondary,
        lineHeight: rs(17),
    },
    taskDateBadge: {
        fontSize: rs(10),
        color: Colors.primary,
        fontWeight: '600',
    },
    taskTime: {
        fontSize: rs(10),
        color: Colors.textLight,
    },

    allDoneRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: rs(5),
        paddingTop: rs(4),
    },
    allDoneText: {
        fontSize: rs(12),
        color: Colors.success,
        fontWeight: '600',
    },

    panelEmpty: {
        alignItems: 'center',
        paddingVertical: rs(14),
        gap: rs(5),
    },
    panelEmptyText: {
        fontSize: rs(10),
        color: Colors.textFaint,
        textAlign: 'center',
    },
    moreText: {
        fontSize: rs(10),
        color: Colors.textLight,
        textAlign: 'center',
        marginTop: rs(6),
    },

    // ── Stat kartları ──────────────────────────────────────────────────────
    statsRow: {
        flexDirection: 'row',
        gap: rs(10),
    },
    statCard: {
        flex: 1,
        backgroundColor: Colors.surface,
        borderRadius: rs(16),
        paddingVertical: rs(14),
        paddingHorizontal: rs(8),
        alignItems: 'center',
        gap: rs(4),
        shadowColor: Colors.shadow,
        shadowOpacity: 0.04,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    statIconBg: {
        width: rs(36),
        height: rs(36),
        borderRadius: rs(11),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: rs(2),
    },
    statValue: {
        fontSize: rs(20),
        fontWeight: '800',
        color: Colors.textSecondary,
    },
    statLabel: {
        fontSize: rs(9),
        color: Colors.textLight,
        textAlign: 'center',
        fontWeight: '500',
    },
});