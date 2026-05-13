/**
 * HabitStatsModal.tsx
 * Alışkanlık detay & istatistik modalı.
 * İçerik: başlık, streak, 30 günlük başarı oranı, en aktif gün, ısı haritası.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import {
    Modal, ScrollView, StyleSheet,
    Text, TouchableOpacity, View,
} from 'react-native';
import { Colors, rs } from '../../../styles';
import { Habit } from '../types/habit';
import { HabitHeatmap } from './HabitHeatmap';

type DayStatus = 'completed' | 'failed' | 'pending' | 'before_start';

interface DayData {
    date: string;
    status: DayStatus;
}

interface Props {
    visible: boolean;
    onClose: () => void;
    habit: Habit | null;
    streak: number;
    last30: DayData[];
}

const DAYS_TR = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

const StatBox = ({ value, label, color }: { value: string; label: string; color?: string }) => (
    <View style={styles.statBox}>
        <Text style={[styles.statValue, color ? { color } : {}]}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

export const HabitStatsModal = ({ visible, onClose, habit, streak, last30 }: Props) => {
    if (!habit) return null;

    // Son 30 gün istatistikleri
    const validDays = last30.filter(d => d.status !== 'before_start');
    const completedDays = last30.filter(d => d.status === 'completed').length;
    const totalDays = validDays.length;
    const successRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

    // En aktif gün (en çok tamamlanan haftanın günü)
    const dayCount: Record<number, number> = {};
    last30.forEach(d => {
        if (d.status !== 'completed') return;
        const dow = new Date(d.date.replace(/-/g, '/')).getDay();
        dayCount[dow] = (dayCount[dow] ?? 0) + 1;
    });
    const bestDow = Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0];
    const bestDay = bestDow ? DAYS_TR[parseInt(bestDow[0])] : '—';

    // Streak rengi
    const streakColor = streak >= 7 ? '#FF6D00' : streak >= 3 ? '#FB8C00' : Colors.textSecondary;

    // Başarı oranı rengi
    const rateColor = successRate >= 80 ? Colors.success : successRate >= 50 ? '#FB8C00' : Colors.danger;

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <View style={styles.container}>

                {/* Handle */}
                <View style={styles.handle} />

                {/* Header */}
                <View style={styles.header}>
                    <View style={[styles.iconBg, { backgroundColor: habit.color + '22' }]}>
                        <MaterialCommunityIcons
                            name={habit.icon as any}
                            size={rs(28)}
                            color={habit.color}
                        />
                    </View>
                    <View style={styles.headerText}>
                        <Text style={styles.title}>{habit.title}</Text>
                        <Text style={styles.subtitle}>
                            {habit.type === 'good' ? '✅ İyi Alışkanlık' : '🚫 Kötü Alışkanlık'}
                            {'  ·  '}
                            {habit.frequency === 'daily' ? 'Günlük' : habit.frequency === 'weekly' ? 'Haftalık' : 'Aylık'}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <MaterialCommunityIcons name="close" size={rs(22)} color={Colors.textLight} />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                    {/* İstatistik kutuları */}
                    <View style={styles.statsRow}>
                        <StatBox
                            value={streak > 0 ? `🔥 ${streak}` : '—'}
                            label="Güncel Seri"
                            color={streakColor}
                        />
                        <StatBox
                            value={`%${successRate}`}
                            label="30 Gün Başarı"
                            color={rateColor}
                        />
                        <StatBox
                            value={`${completedDays}`}
                            label="Tamamlanan Gün"
                            color={Colors.primary}
                        />
                        <StatBox
                            value={bestDay}
                            label="En Aktif Gün"
                        />
                    </View>

                    {/* Hedef bilgisi */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Hedef</Text>
                        <View style={styles.targetCard}>
                            <MaterialCommunityIcons
                                name={habit.type === 'good' ? 'target' : 'shield-alert-outline'}
                                size={rs(20)}
                                color={habit.color}
                            />
                            <Text style={styles.targetText}>
                                {habit.type === 'good'
                                    ? `Günde ${habit.targetCount} kez tamamla`
                                    : `Günde ${habit.targetCount} kez limitini aşma`}
                            </Text>
                        </View>
                    </View>

                    {/* Isı haritası */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Son 30 Gün</Text>
                        <View style={styles.heatmapCard}>
                            <HabitHeatmap
                                data={last30}
                                color={habit.color}
                                type={habit.type}
                            />
                        </View>
                    </View>

                </ScrollView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    handle: {
        width: rs(36),
        height: rs(4),
        backgroundColor: '#ddd',
        borderRadius: rs(2),
        alignSelf: 'center',
        marginTop: rs(12),
        marginBottom: rs(8),
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: rs(20),
        paddingVertical: rs(16),
        gap: rs(12),
        backgroundColor: Colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.divider,
    },
    iconBg: {
        width: rs(52),
        height: rs(52),
        borderRadius: rs(16),
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerText: { flex: 1 },
    title: {
        fontSize: rs(18),
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: rs(3),
    },
    subtitle: {
        fontSize: rs(12),
        color: Colors.textLight,
    },
    closeBtn: {
        padding: rs(6),
    },
    scroll: {
        padding: rs(20),
        paddingBottom: rs(60),
    },

    // İstatistik kutuları
    statsRow: {
        flexDirection: 'row',
        gap: rs(10),
        marginBottom: rs(20),
    },
    statBox: {
        flex: 1,
        backgroundColor: Colors.surface,
        borderRadius: rs(14),
        paddingVertical: rs(14),
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowOffset: { width: 0, height: 1 },
        elevation: 1,
    },
    statValue: {
        fontSize: rs(18),
        fontWeight: '800',
        color: Colors.textSecondary,
        marginBottom: rs(3),
    },
    statLabel: {
        fontSize: rs(9),
        color: Colors.textLight,
        textAlign: 'center',
        fontWeight: '500',
    },

    // Section
    section: { marginBottom: rs(20) },
    sectionTitle: {
        fontSize: rs(14),
        fontWeight: '700',
        color: Colors.textSecondary,
        marginBottom: rs(10),
    },

    // Hedef kartı
    targetCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: rs(10),
        backgroundColor: Colors.surface,
        borderRadius: rs(14),
        padding: rs(14),
        shadowColor: '#000',
        shadowOpacity: 0.03,
        elevation: 1,
    },
    targetText: {
        fontSize: rs(14),
        color: Colors.textSecondary,
        fontWeight: '500',
    },

    // Isı haritası kartı
    heatmapCard: {
        backgroundColor: Colors.surface,
        borderRadius: rs(16),
        padding: rs(16),
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowOffset: { width: 0, height: 1 },
        elevation: 2,
    },
});