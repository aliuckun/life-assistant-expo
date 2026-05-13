import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, rs } from '../../../styles';
import { Goal } from '../types/goal';

interface Props {
    goals: Goal[];
    onAddPress: () => void;
    onRemove: (id: string) => void;
    onArchive: (id: string) => void;
    onNotePress: (goal: Goal, date: string) => void;
}

const todayStr = (): string => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const CurrentGoals: React.FC<Props> = ({ goals, onAddPress, onRemove, onArchive, onNotePress }) => {

    const handleLongPress = (goal: Goal) => {
        Alert.alert(goal.title, 'Ne yapmak istiyorsunuz?', [
            { text: 'Vazgeç', style: 'cancel' },
            {
                text: '📦 Arşivle',
                onPress: () => Alert.alert('Arşivle', `"${goal.title}" arşive taşınsın mı?`, [
                    { text: 'Vazgeç', style: 'cancel' },
                    { text: 'Arşivle', onPress: () => onArchive(goal.id) },
                ]),
            },
            {
                text: '🗑️ Sil', style: 'destructive',
                onPress: () => Alert.alert('Hedefi Sil', `"${goal.title}" kalıcı olarak silinsin mi?`, [
                    { text: 'Vazgeç', style: 'cancel' },
                    { text: 'Sil', style: 'destructive', onPress: () => onRemove(goal.id) },
                ]),
            },
        ]);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Bu Haftanın Hedefleri</Text>
                    <Text style={styles.subtitle}>{goals.length} aktif hedef</Text>
                </View>
                <TouchableOpacity style={styles.addBtn} onPress={onAddPress}>
                    <MaterialCommunityIcons name="plus" size={rs(18)} color="#fff" />
                    <Text style={styles.addBtnText}>Ekle</Text>
                </TouchableOpacity>
            </View>

            {goals.length === 0 ? (
                <TouchableOpacity style={styles.emptyCard} onPress={onAddPress} activeOpacity={0.8}>
                    <View style={styles.emptyIconBg}>
                        <MaterialCommunityIcons name="flag-plus-outline" size={rs(28)} color={Colors.primary} />
                    </View>
                    <Text style={styles.emptyTitle}>İlk hedefini ekle</Text>
                    <Text style={styles.emptySub}>Haftalık hedefler belirleyerek ilerlemeyi takip et</Text>
                </TouchableOpacity>
            ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                    {goals.map(goal => {
                        const progress = goal.targetCount > 0 ? goal.currentCount / goal.targetCount : 0;
                        const pct = Math.min(Math.round(progress * 100), 100);
                        const today = todayStr();
                        const hasNote = !!goal.notes?.[today];
                        const isDone = pct >= 100;

                        return (
                            <TouchableOpacity
                                key={goal.id}
                                style={[styles.card, isDone && styles.cardDone]}
                                activeOpacity={0.9}
                                onLongPress={() => handleLongPress(goal)}
                            >
                                {/* Üst satır: ikon + not butonu */}
                                <View style={styles.cardTop}>
                                    <View style={[styles.iconBg, { backgroundColor: goal.color + '20' }]}>
                                        <MaterialCommunityIcons name={goal.icon as any} size={rs(20)} color={goal.color} />
                                    </View>
                                    <View style={styles.cardTopRight}>
                                        {isDone && (
                                            <View style={styles.doneBadge}>
                                                <MaterialCommunityIcons name="check" size={rs(10)} color="#fff" />
                                            </View>
                                        )}
                                        <TouchableOpacity
                                            style={[styles.noteBtn, hasNote && { backgroundColor: goal.color + '20' }]}
                                            onPress={() => onNotePress(goal, today)}
                                            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                                        >
                                            <MaterialCommunityIcons
                                                name={hasNote ? 'note-text' : 'note-plus-outline'}
                                                size={rs(14)}
                                                color={hasNote ? goal.color : '#bbb'}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Başlık + açıklama */}
                                <Text style={styles.cardTitle} numberOfLines={1}>{goal.title}</Text>
                                <Text style={styles.cardDesc} numberOfLines={2}>{goal.description}</Text>

                                {/* Not önizleme */}
                                {hasNote && (
                                    <Text style={styles.notePreview} numberOfLines={1}>
                                        💬 {goal.notes[today]}
                                    </Text>
                                )}

                                {/* Progress */}
                                <View style={styles.progressWrap}>
                                    <View style={styles.progressBg}>
                                        <View style={[styles.progressFill, {
                                            width: `${pct}%`,
                                            backgroundColor: isDone ? Colors.success : goal.color,
                                        }]} />
                                    </View>
                                    <Text style={[styles.progressPct, { color: isDone ? Colors.success : goal.color }]}>
                                        %{pct}
                                    </Text>
                                </View>

                                {/* Alt: gün sayısı */}
                                <Text style={styles.cardMeta}>
                                    {goal.currentCount}/{goal.targetCount} gün
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { marginBottom: rs(24) },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: rs(20), marginBottom: rs(14) },
    title: { fontSize: rs(18), fontWeight: '800', color: '#222', letterSpacing: -0.3 },
    subtitle: { fontSize: rs(12), color: Colors.textLight, marginTop: rs(2) },
    addBtn: { flexDirection: 'row', alignItems: 'center', gap: rs(4), backgroundColor: Colors.primary, paddingHorizontal: rs(14), paddingVertical: rs(8), borderRadius: rs(20) },
    addBtnText: { color: '#fff', fontSize: rs(13), fontWeight: '700' },

    scroll: { paddingHorizontal: rs(20), paddingBottom: rs(4) },

    // Boş durum
    emptyCard: { marginHorizontal: rs(20), backgroundColor: '#fff', borderRadius: rs(20), padding: rs(28), alignItems: 'center', gap: rs(8), borderWidth: 1.5, borderColor: Colors.divider, borderStyle: 'dashed' },
    emptyIconBg: { width: rs(60), height: rs(60), borderRadius: rs(18), backgroundColor: Colors.primary + '12', justifyContent: 'center', alignItems: 'center', marginBottom: rs(4) },
    emptyTitle: { fontSize: rs(15), fontWeight: '700', color: '#333' },
    emptySub: { fontSize: rs(12), color: Colors.textLight, textAlign: 'center', lineHeight: rs(18) },

    // Kart
    card: { width: rs(170), backgroundColor: '#fff', borderRadius: rs(20), padding: rs(16), marginRight: rs(12), shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 3 }, shadowRadius: 8, elevation: 3 },
    cardDone: { borderWidth: 1.5, borderColor: Colors.success + '40' },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: rs(12) },
    cardTopRight: { flexDirection: 'row', alignItems: 'center', gap: rs(4) },
    iconBg: { width: rs(40), height: rs(40), borderRadius: rs(13), justifyContent: 'center', alignItems: 'center' },
    doneBadge: { width: rs(18), height: rs(18), borderRadius: rs(6), backgroundColor: Colors.success, justifyContent: 'center', alignItems: 'center' },
    noteBtn: { padding: rs(5), borderRadius: rs(8) },
    cardTitle: { fontSize: rs(15), fontWeight: '700', color: '#222', marginBottom: rs(3) },
    cardDesc: { fontSize: rs(11), color: Colors.textLight, lineHeight: rs(16), marginBottom: rs(10) },
    notePreview: { fontSize: rs(10), color: '#888', fontStyle: 'italic', marginBottom: rs(8), lineHeight: rs(15) },
    progressWrap: { flexDirection: 'row', alignItems: 'center', gap: rs(6), marginBottom: rs(6) },
    progressBg: { flex: 1, height: rs(5), backgroundColor: '#f0f0f0', borderRadius: rs(3) },
    progressFill: { height: rs(5), borderRadius: rs(3) },
    progressPct: { fontSize: rs(11), fontWeight: '700', minWidth: rs(30), textAlign: 'right' },
    cardMeta: { fontSize: rs(10), color: Colors.textLight },
});