import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { AddHabitModal } from './components/AddHabitModal';
import { HabitCard } from './components/HabitCard';
import { HabitDateStrip } from './components/HabitDateStrip';
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
        isEditable,
    } = useHabits();

    const [modalVisible, setModalVisible] = useState(false);
    // selectedDate artık string — mutation riski yok
    const [selectedDateStr, setSelectedDateStr] = useState(() => toDateStr(new Date()));

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

    // Header tarihi
    const [selY, selM, selD] = selectedDateStr.split('-').map(Number);
    const headerDate = isToday ? 'Bugün' : `${selD} ${MONTHS_TR[selM - 1]}`;

    if (loading) return null;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />

            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Alışkanlıklar</Text>
                    <Text style={styles.headerDate}>{headerDate}</Text>
                </View>
                <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
                    <MaterialCommunityIcons name="plus" size={26} color="#fff" />
                </TouchableOpacity>
            </View>

            <HabitDateStrip
                selectedDateStr={selectedDateStr}
                onSelectDate={setSelectedDateStr}
            />

            {habits.length > 0 && (
                <View style={styles.summaryBar}>
                    <View style={styles.summaryItem}>
                        <Text style={[styles.summaryNum, { color: '#43A047' }]}>{completed}</Text>
                        <Text style={styles.summaryLabel}>Tamamlandı</Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryNum}>{pending}</Text>
                        <Text style={styles.summaryLabel}>Bekliyor</Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryItem}>
                        <Text style={[styles.summaryNum, overLimit > 0 && { color: '#E53935' }]}>
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
                        <MaterialCommunityIcons name="clipboard-check-outline" size={56} color="#e0e0e0" />
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
                    />
                )}
            />

            <AddHabitModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onAdd={addHabit}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 14,
        paddingBottom: 10,
    },
    headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#222' },
    headerDate: { fontSize: 13, color: '#aaa', marginTop: 1 },
    addBtn: {
        backgroundColor: '#007AFF',
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    summaryBar: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        marginHorizontal: 20,
        borderRadius: 16,
        paddingVertical: 12,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        elevation: 2,
    },
    summaryItem: { flex: 1, alignItems: 'center' },
    summaryDivider: { width: 1, backgroundColor: '#f0f0f0' },
    summaryNum: { fontSize: 22, fontWeight: 'bold', color: '#333' },
    summaryLabel: { fontSize: 11, color: '#aaa', marginTop: 2 },
    list: { paddingHorizontal: 20, paddingBottom: 100 },
    empty: { alignItems: 'center', marginTop: 70 },
    emptyTitle: { fontSize: 18, fontWeight: '600', color: '#ccc', marginTop: 16 },
    emptySub: { fontSize: 13, color: '#ddd', marginTop: 8, textAlign: 'center', lineHeight: 20 },
});