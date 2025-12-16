// src/screens/goals/components/CurrentGoals.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Goal } from '../types/goal'; // Yolu types dosyanın yerine göre ayarla

interface Props {
    goals: Goal[];
    onAddPress: () => void; // <--- YENİ EKLENDİ
    onRemove: (id: string) => void; // <--- YENİ PROP
}

export const CurrentGoals: React.FC<Props> = ({ goals, onAddPress, onRemove }) => {

    const handleLongPress = (id: string, title: string) => {
        Alert.alert(
            "Hedefi Sil",
            `"${title}" hedefini silmek istediğine emin misin?`,
            [
                { text: "Vazgeç", style: "cancel" },
                {
                    text: "Sil",
                    style: "destructive",
                    onPress: () => onRemove(id) // Onaylanırsa prop'u tetikle
                }
            ]
        );
    };
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Bu Haftanın Hedefleri</Text>
                <TouchableOpacity style={styles.addButton} onPress={onAddPress}>
                    <MaterialCommunityIcons name="plus" size={20} color="#fff" />
                    <Text style={styles.addButtonText}>Hedef Ekle</Text>
                </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {goals.map((goal) => {
                    const progress = goal.targetCount > 0 ? goal.currentCount / goal.targetCount : 0;

                    return (
                        <TouchableOpacity
                            key={goal.id}
                            style={styles.card}
                            activeOpacity={0.9}
                            // Karta basılı tutunca silme onayı açılır
                            onLongPress={() => handleLongPress(goal.id, goal.title)}
                        >
                            <View style={styles.cardHeader}>
                                <View style={[styles.iconContainer, { backgroundColor: goal.color + '20' }]}>
                                    <MaterialCommunityIcons name={goal.icon as any} size={24} color={goal.color} />
                                </View>
                                {/* Alternatif: Buraya küçük bir çöp kutusu ikonu da konabilir ama LongPress daha temizdir */}
                                <Text style={styles.frequency}>Haftalık</Text>
                            </View>

                            <Text style={styles.goalTitle}>{goal.title}</Text>
                            <Text style={styles.goalDesc}>{goal.description}</Text>

                            <View style={styles.progressContainer}>
                                <View style={styles.progressBarBg}>
                                    <View style={[styles.progressBarFill, { width: `${Math.min(progress * 100, 100)}%`, backgroundColor: goal.color }]} />
                                </View>
                                <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { marginVertical: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
    title: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    addButton: { flexDirection: 'row', backgroundColor: '#2962FF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, alignItems: 'center' },
    addButtonText: { color: '#fff', fontSize: 12, fontWeight: '600', marginLeft: 4 },
    scrollContent: { paddingHorizontal: 15 },
    card: { width: 160, backgroundColor: '#fff', borderRadius: 16, padding: 16, marginRight: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
    iconContainer: { padding: 8, borderRadius: 12 },
    frequency: { fontSize: 10, color: '#999' },
    goalTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
    goalDesc: { fontSize: 12, color: '#666', marginBottom: 12 },
    progressContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    progressBarBg: { flex: 1, height: 6, backgroundColor: '#f0f0f0', borderRadius: 3, marginRight: 8 },
    progressBarFill: { height: 6, borderRadius: 3 },
    progressText: { fontSize: 10, color: '#666', fontWeight: 'bold' },
});