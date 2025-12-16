// src/screens/goals/components/PreviousWeeks.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { HistoryItem } from '../types/goal'; // Yolu kontrol et

interface Props {
    history: HistoryItem[];
}

export const PreviousWeeks: React.FC<Props> = ({ history }) => {

    // Eğer geçmiş veri yoksa veya hepsi 0 ise boş göstermeyelim, opsiyonel mesaj:
    if (history.length === 0) return null;

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Geçmiş Haftalar</Text>
            <View style={styles.list}>
                {history.map((item, index) => (
                    <View key={index} style={styles.card}>
                        <View>
                            <Text style={styles.weekText}>{item.week}</Text>
                            <Text style={styles.subText}>{item.label}</Text>
                        </View>
                        <View style={styles.rightSide}>
                            <View style={[styles.badge, { backgroundColor: item.color + '30' }]}>
                                <Text style={[styles.badgeText, { color: '#333' }]}>%{item.completedRate} Tamamlandı</Text>
                            </View>
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
    list: { gap: 10 },
    card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.03, elevation: 1 },
    weekText: { fontSize: 14, fontWeight: 'bold', color: '#333' },
    subText: { fontSize: 12, color: '#999', marginTop: 2 },
    rightSide: { alignItems: 'flex-end' },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    badgeText: { fontSize: 10, fontWeight: 'bold' },
});