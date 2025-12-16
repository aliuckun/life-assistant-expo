// src/screens/goals/components/WeeklySummary.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WeeklyStats } from '../types/goal';

interface Props {
    stats: WeeklyStats;
}

export const WeeklySummary: React.FC<Props> = ({ stats }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Haftalık Özet</Text>

            {/* İstatistikler */}
            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: '#2962FF' }]}>%{stats.completionRate}</Text>
                    <Text style={styles.statLabel}>Başarı</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: '#43A047' }]}>{stats.goalsCompleted}</Text>
                    <Text style={styles.statLabel}>Tamamlanan</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: '#FF6D00' }]}>{stats.dayStreak}</Text>
                    <Text style={styles.statLabel}>Seri Gün</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { paddingHorizontal: 20, marginBottom: 50 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', padding: 20, borderRadius: 16, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, elevation: 2 },
    statItem: { alignItems: 'center' },
    statValue: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
    statLabel: { fontSize: 12, color: '#666' },

    insightCard: { backgroundColor: '#fff', padding: 20, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.05, elevation: 2 },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 },
    insightItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    iconBox: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    insightTextParams: { flex: 1 },
    insightTitle: { fontSize: 14, fontWeight: 'bold', color: '#444' },
    insightDesc: { fontSize: 12, color: '#888' },
    button: { paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 10 },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});