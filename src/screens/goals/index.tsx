// src/screens/goals/GoalsScreen.tsx
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet } from 'react-native';
import { AddGoalModal } from './components/AddGoalModal';
import { CurrentGoals } from './components/Currentgoals';
import { PreviousWeeks } from './components/PreviousWeeks';
import { WeeklyProgress } from './components/WeeklyProgress';
import { WeeklySummary } from './components/WeeklySummary';
import { useGoals } from './hook/useGoals';

export default function GoalsScreen() {
    // Hook'tan yeni fonksiyonları çekiyoruz
    const { goals, loading, addGoal, toggleDayCompletion, getStats, getWeekDate, removeGoal, getHistory } = useGoals();
    const [isModalVisible, setModalVisible] = useState(false);
    const stats = getStats();
    const history = getHistory(); // <--- Veriyi hesaplattık

    if (loading) {
        // ... loading aynı
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <CurrentGoals
                    goals={goals}
                    onAddPress={() => setModalVisible(true)}
                    onRemove={removeGoal}
                />

                {/* GÜNCELLENDİ: Propsları geçiriyoruz */}
                <WeeklyProgress
                    goals={goals}
                    onToggle={toggleDayCompletion}
                    getDateString={getWeekDate}
                />

                <PreviousWeeks history={history} />
                <WeeklySummary stats={stats} />

            </ScrollView>

            <AddGoalModal
                visible={isModalVisible}
                onClose={() => setModalVisible(false)}
                onAdd={addGoal}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA', // Görseldeki hafif gri/mavi arka plan
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingBottom: 40,
    },
});