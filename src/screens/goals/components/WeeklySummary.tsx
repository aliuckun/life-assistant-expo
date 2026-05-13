import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, rs } from '../../../styles';
import { WeeklyStats } from '../types/goal';

interface Props { stats: WeeklyStats; }

const StatItem = ({ icon, value, label, color }: {
    icon: string; value: string | number; label: string; color: string;
}) => (
    <View style={styles.statItem}>
        <View style={[styles.statIconBg, { backgroundColor: color + '15' }]}>
            <MaterialCommunityIcons name={icon as any} size={rs(18)} color={color} />
        </View>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

export const WeeklySummary: React.FC<Props> = ({ stats }) => {
    const rateColor = stats.completionRate >= 80 ? Colors.success
        : stats.completionRate >= 50 ? '#FB8C00' : Colors.danger;

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Haftalık Özet</Text>
            <View style={styles.card}>
                <StatItem
                    icon="chart-arc"
                    value={`%${stats.completionRate}`}
                    label="Başarı Oranı"
                    color={rateColor}
                />
                <View style={styles.divider} />
                <StatItem
                    icon="flag-checkered"
                    value={stats.goalsCompleted}
                    label="Tamamlanan"
                    color={Colors.success}
                />
                <View style={styles.divider} />
                <StatItem
                    icon="fire"
                    value={stats.dayStreak}
                    label="Seri Gün"
                    color='#FF6D00'
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { paddingHorizontal: rs(20), marginBottom: rs(24) },
    sectionTitle: { fontSize: rs(18), fontWeight: '800', color: '#222', marginBottom: rs(12), letterSpacing: -0.3 },
    card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: rs(20), padding: rs(20), shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 3 },
    statItem: { flex: 1, alignItems: 'center', gap: rs(5) },
    statIconBg: { width: rs(40), height: rs(40), borderRadius: rs(13), justifyContent: 'center', alignItems: 'center' },
    statValue: { fontSize: rs(20), fontWeight: '800' },
    statLabel: { fontSize: rs(10), color: Colors.textLight, fontWeight: '500', textAlign: 'center' },
    divider: { width: 1, backgroundColor: Colors.divider, marginVertical: rs(4) },
});