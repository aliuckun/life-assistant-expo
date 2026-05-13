import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { Colors, rs } from '../../styles';
import { AddGoalModal } from './components/AddGoalModal';
import { ArchivedGoals } from './components/ArchivedGoals';
import { CurrentGoals } from './components/CurrentGoals';
import { GoalNoteModal } from './components/GoalNoteModal';
import { PreviousWeeks } from './components/PreviousWeeks';
import { WeeklyProgress } from './components/WeeklyProgress';
import { WeeklySummary } from './components/WeeklySummary';
import { useGoals } from './hooks/useGoals';
import { Goal } from './types/goal';

export default function GoalsScreen() {
    const {
        goals, archivedGoals, loading,
        addGoal, addNote, archiveGoal, unarchiveGoal,
        toggleDayCompletion, getStats, getWeekDate,
        removeGoal, getHistory,
    } = useGoals();

    const [isModalVisible, setModalVisible] = useState(false);
    const [noteModalVisible, setNoteModalVisible] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
    const [selectedDate, setSelectedDate] = useState('');

    const stats = getStats();
    const history = getHistory();

    const handleNotePress = (goal: Goal, date: string) => {
        setSelectedGoal(goal);
        setSelectedDate(date);
        setNoteModalVisible(true);
    };

    const handleNoteSave = (note: string) => {
        if (selectedGoal && selectedDate) addNote(selectedGoal.id, selectedDate, note);
    };

    if (loading) return null;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Hedefler</Text>
                    <Text style={styles.headerSub}>
                        {stats.goalsCompleted}/{goals.length} hedef tamamlandı
                    </Text>
                </View>
                <View style={styles.headerRight}>
                    {/* Streak badge */}
                    {stats.dayStreak > 0 && (
                        <View style={styles.streakBadge}>
                            <Text style={styles.streakText}>🔥 {stats.dayStreak}</Text>
                        </View>
                    )}
                    {/* Başarı oranı */}
                    <View style={[styles.rateBadge, {
                        backgroundColor: stats.completionRate >= 80 ? Colors.success + '15'
                            : stats.completionRate >= 50 ? '#FB8C0015' : Colors.danger + '15'
                    }]}>
                        <Text style={[styles.rateText, {
                            color: stats.completionRate >= 80 ? Colors.success
                                : stats.completionRate >= 50 ? '#FB8C00' : Colors.danger
                        }]}>%{stats.completionRate}</Text>
                    </View>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                <CurrentGoals
                    goals={goals}
                    onAddPress={() => setModalVisible(true)}
                    onRemove={removeGoal}
                    onArchive={archiveGoal}
                    onNotePress={handleNotePress}
                />

                <WeeklyProgress
                    goals={goals}
                    onToggle={toggleDayCompletion}
                    getDateString={getWeekDate}
                />

                <PreviousWeeks history={history} />
                <WeeklySummary stats={stats} />

                <ArchivedGoals
                    goals={archivedGoals}
                    onUnarchive={unarchiveGoal}
                    onRemove={removeGoal}
                />

            </ScrollView>

            <AddGoalModal
                visible={isModalVisible}
                onClose={() => setModalVisible(false)}
                onAdd={addGoal}
            />

            <GoalNoteModal
                visible={noteModalVisible}
                onClose={() => { setNoteModalVisible(false); setSelectedGoal(null); }}
                onSave={handleNoteSave}
                goal={selectedGoal}
                date={selectedDate}
                existingNote={selectedGoal?.notes?.[selectedDate]}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: rs(20),
        paddingTop: rs(14),
        paddingBottom: rs(16),
        backgroundColor: Colors.background,
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
    streakBadge: {
        backgroundColor: '#FFF3E0',
        paddingHorizontal: rs(10),
        paddingVertical: rs(5),
        borderRadius: rs(20),
    },
    streakText: {
        fontSize: rs(13),
        fontWeight: '700',
        color: '#FF6D00',
    },
    rateBadge: {
        paddingHorizontal: rs(12),
        paddingVertical: rs(5),
        borderRadius: rs(20),
    },
    rateText: {
        fontSize: rs(14),
        fontWeight: '800',
    },
    scroll: {
        paddingBottom: rs(100),
    },
});