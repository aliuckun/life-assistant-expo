import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, rs } from '../../../styles';
import { HistoryItem } from '../types/goal';

const DAYS_TR = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const MONTHS_TR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

// 'YYYY-MM-DD' → Date (UTC kaymasız)
const parseDate = (s: string): Date => {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
};

// O haftanın 7 günlük tarih dizisi (Pazartesi → Pazar)
const getWeekDays = (startDate: string): string[] => {
    const start = parseDate(startDate);
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    });
};

const shortDate = (dateStr: string): string => {
    const [, m, d] = dateStr.split('-').map(Number);
    return `${d} ${MONTHS_TR[m - 1]}`;
};

interface Props {
    history: HistoryItem[];
}

export const PreviousWeeks: React.FC<Props> = ({ history }) => {
    const [selected, setSelected] = useState<HistoryItem | null>(null);

    if (history.length === 0) return null;

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Geçmiş Haftalar</Text>
            <View style={styles.list}>
                {history.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.card}
                        onPress={() => setSelected(item)}
                        activeOpacity={0.75}
                    >
                        <View style={styles.cardLeft}>
                            <Text style={styles.weekText}>{item.week}</Text>
                            <Text style={styles.subText}>{item.label}</Text>
                        </View>
                        <View style={styles.cardRight}>
                            <View style={[styles.badge, { backgroundColor: item.color + '30' }]}>
                                <Text style={styles.badgeText}>%{item.completedRate}</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={rs(18)} color="#ccc" />
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Detay Modal */}
            <Modal
                visible={!!selected}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setSelected(null)}
            >
                {selected && (
                    <View style={styles.modal}>
                        {/* Handle */}
                        <View style={styles.handle} />

                        {/* Modal header */}
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>{selected.week}</Text>
                                <Text style={styles.modalSub}>{shortDate(selected.startDate)} – {shortDate(selected.endDate)}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setSelected(null)} style={styles.closeBtn}>
                                <MaterialCommunityIcons name="close" size={rs(22)} color={Colors.textLight} />
                            </TouchableOpacity>
                        </View>

                        {/* Oran özeti */}
                        <View style={[styles.rateBanner, { backgroundColor: selected.color + '22' }]}>
                            <Text style={[styles.rateText, { color: selected.completedRate >= 80 ? Colors.success : selected.completedRate >= 50 ? '#FB8C00' : Colors.danger }]}>
                                %{selected.completedRate}
                            </Text>
                            <Text style={styles.rateLabel}>haftalık tamamlanma oranı</Text>
                        </View>

                        <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
                            {selected.goals.length === 0 ? (
                                <View style={styles.emptyWrap}>
                                    <MaterialCommunityIcons name="flag-outline" size={rs(40)} color="#ddd" />
                                    <Text style={styles.emptyText}>Bu haftaya ait hedef verisi yok</Text>
                                </View>
                            ) : (
                                selected.goals.map(goal => {
                                    const weekDays = getWeekDays(selected.startDate);
                                    const doneSet = new Set(goal.completedDays);
                                    const doneCount = goal.completedDays.length;
                                    const rate = goal.targetCount > 0
                                        ? Math.round((doneCount / goal.targetCount) * 100)
                                        : 0;

                                    return (
                                        <View key={goal.goalId} style={styles.goalCard}>
                                            {/* Başlık satırı */}
                                            <View style={styles.goalHeader}>
                                                <View style={[styles.goalIcon, { backgroundColor: goal.color + '1A' }]}>
                                                    <MaterialCommunityIcons name={goal.icon as any} size={rs(18)} color={goal.color} />
                                                </View>
                                                <Text style={styles.goalTitle} numberOfLines={1}>{goal.title}</Text>
                                                <Text style={[styles.goalRate, { color: rate >= 100 ? Colors.success : rate >= 50 ? '#FB8C00' : Colors.danger }]}>
                                                    %{Math.min(rate, 100)}
                                                </Text>
                                            </View>

                                            {/* 7 günlük hücre grid */}
                                            <View style={styles.daysRow}>
                                                {weekDays.map((dateStr, i) => {
                                                    const done = doneSet.has(dateStr);
                                                    return (
                                                        <View key={i} style={styles.dayCell}>
                                                            <View style={[
                                                                styles.dayDot,
                                                                { backgroundColor: done ? goal.color : Colors.divider },
                                                            ]}>
                                                                {done && <MaterialCommunityIcons name="check" size={rs(10)} color="#fff" />}
                                                            </View>
                                                            <Text style={styles.dayLabel}>{DAYS_TR[i]}</Text>
                                                        </View>
                                                    );
                                                })}
                                            </View>

                                            {/* Progress bar */}
                                            <View style={styles.progressRow}>
                                                <View style={styles.progressBg}>
                                                    <View style={[styles.progressFill, {
                                                        width: `${Math.min(rate, 100)}%`,
                                                        backgroundColor: goal.color,
                                                    }]} />
                                                </View>
                                                <Text style={styles.progressLabel}>
                                                    {doneCount}/{goal.targetCount} gün
                                                </Text>
                                            </View>
                                        </View>
                                    );
                                })
                            )}
                        </ScrollView>
                    </View>
                )}
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { paddingHorizontal: rs(20), marginBottom: rs(30) },
    sectionTitle: { fontSize: rs(18), fontWeight: 'bold', color: '#333', marginBottom: rs(15) },
    list: { gap: rs(10) },

    card: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: rs(16),
        borderRadius: rs(14),
        shadowColor: '#000',
        shadowOpacity: 0.03,
        elevation: 1,
    },
    cardLeft: { flex: 1 },
    cardRight: { flexDirection: 'row', alignItems: 'center', gap: rs(6) },
    weekText: { fontSize: rs(14), fontWeight: '700', color: '#333' },
    subText: { fontSize: rs(12), color: '#999', marginTop: rs(2) },
    badge: { paddingHorizontal: rs(10), paddingVertical: rs(4), borderRadius: rs(8) },
    badgeText: { fontSize: rs(11), fontWeight: '700', color: '#333' },

    // Modal
    modal: { flex: 1, backgroundColor: Colors.background },
    handle: { width: rs(36), height: rs(4), backgroundColor: '#ddd', borderRadius: rs(2), alignSelf: 'center', marginTop: rs(12) },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: rs(20), paddingVertical: rs(16), backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.divider },
    modalTitle: { fontSize: rs(17), fontWeight: '700', color: Colors.textPrimary },
    modalSub: { fontSize: rs(12), color: Colors.textLight, marginTop: rs(2) },
    closeBtn: { padding: rs(4) },

    rateBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: rs(8), paddingVertical: rs(14), marginHorizontal: rs(20), marginTop: rs(16), borderRadius: rs(14) },
    rateText: { fontSize: rs(28), fontWeight: '800' },
    rateLabel: { fontSize: rs(13), color: Colors.textLight },

    modalScroll: { padding: rs(20), gap: rs(12), paddingBottom: rs(60) },
    emptyWrap: { alignItems: 'center', paddingTop: rs(60), gap: rs(10) },
    emptyText: { fontSize: rs(13), color: '#ccc' },

    // Hedef kartı
    goalCard: {
        backgroundColor: Colors.surface,
        borderRadius: rs(16),
        padding: rs(16),
        shadowColor: '#000',
        shadowOpacity: 0.04,
        elevation: 2,
    },
    goalHeader: { flexDirection: 'row', alignItems: 'center', gap: rs(10), marginBottom: rs(14) },
    goalIcon: { width: rs(34), height: rs(34), borderRadius: rs(10), justifyContent: 'center', alignItems: 'center' },
    goalTitle: { flex: 1, fontSize: rs(14), fontWeight: '700', color: Colors.textSecondary },
    goalRate: { fontSize: rs(13), fontWeight: '700' },

    // 7 günlük grid
    daysRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: rs(12) },
    dayCell: { alignItems: 'center', gap: rs(4) },
    dayDot: { width: rs(28), height: rs(28), borderRadius: rs(8), justifyContent: 'center', alignItems: 'center' },
    dayLabel: { fontSize: rs(9), color: Colors.textLight, fontWeight: '500' },

    // Progress
    progressRow: { flexDirection: 'row', alignItems: 'center', gap: rs(10) },
    progressBg: { flex: 1, height: rs(5), backgroundColor: Colors.divider, borderRadius: rs(3) },
    progressFill: { height: rs(5), borderRadius: rs(3) },
    progressLabel: { fontSize: rs(11), color: Colors.textLight, minWidth: rs(40), textAlign: 'right' },
});