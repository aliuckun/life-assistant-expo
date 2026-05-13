import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert, FlatList, SafeAreaView,
    StatusBar, StyleSheet, Text,
    TouchableOpacity, View,
} from 'react-native';
import { Colors, rs } from '../../styles';
import { AddHabitModal } from './components/AddHabitModal';
import { HabitCard } from './components/HabitCard';
import { HabitDateStrip } from './components/HabitDateStrip';
import { HabitStatsModal } from './components/HabitStatsModal';
import { useHabits } from './hooks/useHabits';
import { Habit } from './types/habit';

const MONTHS_TR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

const toDateStr = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

export default function HabitsScreen() {
    const {
        habits, loading,
        addHabit, removeHabit,
        increment, decrement,
        getStatus, getStreak,
        isEditable, getLast30Days,
    } = useHabits();

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedDateStr, setSelectedDateStr] = useState(() => toDateStr(new Date()));
    const [statsHabit, setStatsHabit] = useState<Habit | null>(null);
    const [statsVisible, setStatsVisible] = useState(false);

    const todayStr = toDateStr(new Date());
    const isToday = selectedDateStr === todayStr;

    const handleLongPress = (habit: Habit) => {
        Alert.alert(
            'Alışkanlığı Sil',
            `"${habit.title}" alışkanlığını silmek istediğine emin misin?\nTüm geçmiş silinecek.`,
            [
                { text: 'Vazgeç', style: 'cancel' },
                { text: 'Sil', style: 'destructive', onPress: () => removeHabit(habit.id) },
            ]
        );
    };

    const sortedHabits = [...habits].sort((a, b) => {
        const as = getStatus(a, selectedDateStr);
        const bs = getStatus(b, selectedDateStr);
        if (bs.isOverLimit && !as.isOverLimit) return 1;
        if (as.isOverLimit && !bs.isOverLimit) return -1;
        if (as.isCompleted && !bs.isCompleted) return 1;
        if (!as.isCompleted && bs.isCompleted) return -1;
        return 0;
    });

    const completed = habits.filter(h => getStatus(h, selectedDateStr).isCompleted).length;
    const overLimit = habits.filter(h => getStatus(h, selectedDateStr).isOverLimit).length;
    const pending = habits.length - completed - overLimit;

    const [, selM, selD] = selectedDateStr.split('-').map(Number);
    const headerDate = isToday ? 'Bugün' : `${selD} ${MONTHS_TR[selM - 1]}`;

    if (loading) return null;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Alışkanlıklar</Text>
                    <Text style={styles.headerSub}>{headerDate}</Text>
                </View>
                <View style={styles.headerRight}>
                    {/* Özet badge'leri */}
                    {habits.length > 0 && (
                        <>
                            {completed > 0 && (
                                <View style={[styles.badge, { backgroundColor: Colors.success + '15' }]}>
                                    <MaterialCommunityIcons name="check" size={rs(11)} color={Colors.success} />
                                    <Text style={[styles.badgeText, { color: Colors.success }]}>{completed}</Text>
                                </View>
                            )}
                            {overLimit > 0 && (
                                <View style={[styles.badge, { backgroundColor: Colors.danger + '15' }]}>
                                    <MaterialCommunityIcons name="alert" size={rs(11)} color={Colors.danger} />
                                    <Text style={[styles.badgeText, { color: Colors.danger }]}>{overLimit}</Text>
                                </View>
                            )}
                        </>
                    )}
                    <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
                        <MaterialCommunityIcons name="plus" size={rs(24)} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            <HabitDateStrip selectedDateStr={selectedDateStr} onSelectDate={setSelectedDateStr} />

            {/* Özet bar */}
            {habits.length > 0 && (
                <View style={styles.summaryBar}>
                    <View style={styles.summaryItem}>
                        <Text style={[styles.summaryNum, { color: Colors.success }]}>{completed}</Text>
                        <Text style={styles.summaryLabel}>Tamamlandı</Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryNum}>{pending}</Text>
                        <Text style={styles.summaryLabel}>Bekliyor</Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryItem}>
                        <Text style={[styles.summaryNum, overLimit > 0 && { color: Colors.danger }]}>
                            {overLimit}
                        </Text>
                        <Text style={styles.summaryLabel}>Aşıldı</Text>
                    </View>
                </View>
            )}

            <FlatList
                data={sortedHabits}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <MaterialCommunityIcons name="clipboard-check-outline" size={rs(56)} color="#e0e0e0" />
                        <Text style={styles.emptyTitle}>Henüz alışkanlık yok</Text>
                        <Text style={styles.emptySub}>
                            Sağ üstteki + butonuna basarak{'\n'}ilk alışkanlığını ekle
                        </Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <HabitCard
                        habit={item}
                        status={getStatus(item, selectedDateStr)}
                        streak={getStreak(item)}
                        isReadOnly={!isEditable(item, selectedDateStr)}
                        onIncrement={() => increment(item.id, selectedDateStr)}
                        onDecrement={() => decrement(item.id, selectedDateStr)}
                        onLongPress={() => handleLongPress(item)}
                        onDetail={() => { setStatsHabit(item); setStatsVisible(true); }}
                    />
                )}
            />

            <AddHabitModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onAdd={addHabit}
            />

            <HabitStatsModal
                visible={statsVisible}
                onClose={() => { setStatsVisible(false); setStatsHabit(null); }}
                habit={statsHabit}
                streak={statsHabit ? getStreak(statsHabit) : 0}
                last30={statsHabit ? getLast30Days(statsHabit) : []}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: rs(20),
        paddingTop: rs(14),
        paddingBottom: rs(8),
    },
    headerTitle: {
        fontSize: rs(26),
        fontWeight: '800',
        color: '#222',
        letterSpacing: -0.5,
    },
    headerSub: {
        fontSize: rs(12),
        color: Colors.textLight,
        marginTop: rs(2),
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: rs(8),
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: rs(3),
        paddingHorizontal: rs(8),
        paddingVertical: rs(4),
        borderRadius: rs(20),
    },
    badgeText: {
        fontSize: rs(12),
        fontWeight: '700',
    },
    addBtn: {
        width: rs(44),
        height: rs(44),
        borderRadius: rs(22),
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Colors.primary,
        shadowOpacity: 0.35,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
        elevation: 5,
    },

    // Özet bar
    summaryBar: {
        flexDirection: 'row',
        backgroundColor: Colors.surface,
        marginHorizontal: rs(16),
        borderRadius: rs(14),
        paddingVertical: rs(10),
        marginBottom: rs(8),
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowOffset: { width: 0, height: 1 },
        elevation: 1,
    },
    summaryItem: { flex: 1, alignItems: 'center' },
    summaryDivider: { width: 1, backgroundColor: Colors.divider },
    summaryNum: { fontSize: rs(20), fontWeight: '800', color: Colors.textSecondary },
    summaryLabel: { fontSize: rs(10), color: Colors.textLight, marginTop: rs(2), fontWeight: '500' },

    // Liste
    list: { paddingHorizontal: rs(16), paddingBottom: rs(100), paddingTop: rs(4) },

    // Boş durum
    empty: { alignItems: 'center', marginTop: rs(60), gap: rs(10) },
    emptyTitle: { fontSize: rs(17), fontWeight: '700', color: Colors.textFaint },
    emptySub: { fontSize: rs(13), color: Colors.textLight, textAlign: 'center', lineHeight: rs(20) },
});