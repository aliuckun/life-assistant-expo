// src/screens/goals/components/WeeklyProgress.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Goal } from '../types/goal';

interface Props {
    goals: Goal[];
    onToggle: (goalId: string, dayIndex: number) => void; // Tıklama olayı
    getDateString: (index: number) => string; // Tarih hesaplayıcı helper
}

const DAYS = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'];

export const WeeklyProgress: React.FC<Props> = ({ goals, onToggle, getDateString }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Haftalık Takip</Text>
            <View style={styles.card}>
                {/* Gün Başlıkları */}
                <View style={styles.headerRow}>
                    <View style={{ width: 80 }} />
                    {DAYS.map((day, index) => (
                        <Text key={index} style={styles.dayHeader}>{day}</Text>
                    ))}
                </View>

                {/* Hedef Satırları */}
                {goals.map((goal, index) => (
                    <View key={goal.id} style={[styles.row, index !== goals.length - 1 && styles.borderBottom]}>

                        {/* Sol Taraf: İkon ve İsim */}
                        <View style={styles.labelContainer}>
                            <MaterialCommunityIcons name={goal.icon as any} size={16} color={goal.color} style={{ marginRight: 4 }} />
                            <Text style={styles.label} numberOfLines={1}>{goal.title}</Text>
                        </View>

                        {/* Sağ Taraf: Checkboxlar */}
                        <View style={styles.daysContainer}>
                            {DAYS.map((_, dayIndex) => {
                                // 1. O sütunun tarihini bul
                                const dateStr = getDateString(dayIndex);
                                // 2. Goal içindeki completedDays dizisinde bu tarih var mı?
                                const isCompleted = goal.completedDays.includes(dateStr);

                                return (
                                    <TouchableOpacity
                                        key={dayIndex}
                                        style={styles.checkCircle}
                                        onPress={() => onToggle(goal.id, dayIndex)}
                                        activeOpacity={0.7}
                                    >
                                        {isCompleted ? (
                                            <MaterialCommunityIcons name="check-circle" size={24} color={goal.color} />
                                        ) : (
                                            <View style={styles.emptyCircle} />
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
    container: { paddingHorizontal: 20, marginBottom: 30 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
    card: { backgroundColor: '#fff', borderRadius: 16, padding: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, paddingLeft: 5 },
    dayHeader: { fontSize: 12, color: '#999', width: 24, textAlign: 'center' },
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
    borderBottom: { borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    labelContainer: { width: 80, flexDirection: 'row', alignItems: 'center' },
    label: { fontSize: 12, fontWeight: '600', color: '#444', flex: 1 },
    daysContainer: { flex: 1, flexDirection: 'row', justifyContent: 'space-between' },
    checkCircle: { width: 24, alignItems: 'center', height: 24, justifyContent: 'center' },
    emptyCircle: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#f0f0f0' },
});