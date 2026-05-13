import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, rs } from '../../../styles';
import { Goal } from '../types/goal';

interface Props {
    goals: Goal[];
    onToggle: (goalId: string, dayIndex: number) => void;
    getDateString: (index: number) => string;
}

const DAYS = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'];

const toDateStr = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

export const WeeklyProgress: React.FC<Props> = ({ goals, onToggle, getDateString }) => {
    if (goals.length === 0) return null;

    const todayStr = toDateStr(new Date());

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Haftalık Takip</Text>
            <View style={styles.card}>

                {/* Gün başlıkları */}
                <View style={styles.headerRow}>
                    <View style={styles.labelPlaceholder} />
                    {DAYS.map((day, i) => {
                        const dateStr = getDateString(i);
                        const isToday = dateStr === todayStr;
                        return (
                            <View key={i} style={styles.dayHeaderWrap}>
                                <Text style={[styles.dayHeader, isToday && styles.dayHeaderToday]}>
                                    {day}
                                </Text>
                                {isToday && <View style={styles.todayDot} />}
                            </View>
                        );
                    })}
                </View>

                {/* Hedef satırları */}
                {goals.map((goal, index) => (
                    <View key={goal.id} style={[styles.row, index !== goals.length - 1 && styles.rowBorder]}>

                        {/* Sol: ikon + isim */}
                        <View style={styles.labelContainer}>
                            <View style={[styles.goalIconBg, { backgroundColor: goal.color + '18' }]}>
                                <MaterialCommunityIcons name={goal.icon as any} size={rs(13)} color={goal.color} />
                            </View>
                            <Text style={styles.label} numberOfLines={1}>{goal.title}</Text>
                        </View>

                        {/* Sağ: checkbox'lar */}
                        <View style={styles.daysContainer}>
                            {DAYS.map((_, dayIndex) => {
                                const dateStr = getDateString(dayIndex);
                                const isCompleted = goal.completedDays.includes(dateStr);
                                const isToday = dateStr === todayStr;
                                const isFuture = dateStr > todayStr;

                                return (
                                    <TouchableOpacity
                                        key={dayIndex}
                                        style={styles.checkWrap}
                                        onPress={() => onToggle(goal.id, dayIndex)}
                                        activeOpacity={0.7}
                                        disabled={isFuture}
                                    >
                                        {isCompleted ? (
                                            <View style={[styles.checkDone, { backgroundColor: goal.color }]}>
                                                <MaterialCommunityIcons name="check" size={rs(11)} color="#fff" />
                                            </View>
                                        ) : (
                                            <View style={[
                                                styles.checkEmpty,
                                                isToday && { borderColor: goal.color, borderWidth: 2 },
                                                isFuture && styles.checkFuture,
                                            ]} />
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { paddingHorizontal: rs(20), marginBottom: rs(24) },
    sectionTitle: { fontSize: rs(18), fontWeight: '800', color: '#222', marginBottom: rs(12), letterSpacing: -0.3 },
    card: { backgroundColor: '#fff', borderRadius: rs(20), padding: rs(16), shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 3 },

    headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: rs(8), paddingBottom: rs(8), borderBottomWidth: 1, borderBottomColor: Colors.divider },
    labelPlaceholder: { width: rs(88) },
    dayHeaderWrap: { width: rs(28), alignItems: 'center', gap: rs(3) },
    dayHeader: { fontSize: rs(11), color: Colors.textLight, fontWeight: '600' },
    dayHeaderToday: { color: Colors.primary, fontWeight: '800' },
    todayDot: { width: rs(4), height: rs(4), borderRadius: rs(2), backgroundColor: Colors.primary },

    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: rs(10) },
    rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.divider },

    labelContainer: { width: rs(88), flexDirection: 'row', alignItems: 'center', gap: rs(7), paddingRight: rs(4) },
    goalIconBg: { width: rs(24), height: rs(24), borderRadius: rs(7), justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
    label: { fontSize: rs(11), fontWeight: '600', color: '#444', flex: 1 },

    daysContainer: { flex: 1, flexDirection: 'row', justifyContent: 'space-between' },
    checkWrap: { width: rs(28), height: rs(28), justifyContent: 'center', alignItems: 'center' },
    checkDone: { width: rs(22), height: rs(22), borderRadius: rs(7), justifyContent: 'center', alignItems: 'center' },
    checkEmpty: { width: rs(22), height: rs(22), borderRadius: rs(7), backgroundColor: '#F0F0F0', borderWidth: 1.5, borderColor: '#E0E0E0' },
    checkFuture: { opacity: 0.35 },
});