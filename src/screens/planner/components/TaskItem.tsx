/**
 * TaskItem.tsx
 * Görsel güncelleme: sol öncelik çizgisi, kategori chip, tekrar ikonu, edit butonu.
 * Long press → sil, edit butonu → düzenle.
 */
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { rs } from '../../../styles';
import { Task } from '../types/task';

const PRIORITY_COLOR: Record<string, string> = {
    'Yüksek': '#E53935',
    'Orta': '#FB8C00',
    'Düşük': '#43A047',
};

const PRIORITY_BG: Record<string, string> = {
    'Yüksek': '#FFEBEE',
    'Orta': '#FFF3E0',
    'Düşük': '#E8F5E9',
};

const RECURRENCE_ICON: Record<string, string> = {
    daily: 'repeat',
    weekly: 'repeat',
    monthly: 'repeat',
};

interface Props {
    item: Task;
    onToggle: () => void;
    onLongPress: () => void;
    onEdit: () => void;
}

export const TaskItem = ({ item, onToggle, onLongPress, onEdit }: Props) => {
    const priColor = PRIORITY_COLOR[item.priority];
    const priBg = PRIORITY_BG[item.priority];
    const isRecurring = item.recurrence && item.recurrence !== 'none';

    return (
        <TouchableOpacity
            style={[styles.card, item.isCompleted && styles.cardDone]}
            onPress={onToggle}
            onLongPress={onLongPress}
            activeOpacity={0.85}
        >
            {/* Sol öncelik çizgisi */}
            <View style={[styles.priorityBar, { backgroundColor: priColor }]} />

            {/* Checkbox */}
            <TouchableOpacity
                style={[styles.checkbox, item.isCompleted && { backgroundColor: priColor, borderColor: priColor }]}
                onPress={onToggle}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
                {item.isCompleted && <Ionicons name="checkmark" size={14} color="#fff" />}
            </TouchableOpacity>

            {/* İçerik */}
            <View style={styles.content}>
                <View style={styles.titleRow}>
                    <Text
                        style={[styles.title, item.isCompleted && styles.titleDone]}
                        numberOfLines={1}
                    >
                        {item.title}
                    </Text>
                    {isRecurring && (
                        <MaterialCommunityIcons name="repeat" size={13} color="#aaa" style={{ marginLeft: 4 }} />
                    )}
                </View>

                <View style={styles.metaRow}>
                    {/* Kategori */}
                    <View style={styles.catChip}>
                        <Text style={styles.catChipText}>{item.category}</Text>
                    </View>

                    {/* Öncelik */}
                    <View style={[styles.priChip, { backgroundColor: priBg }]}>
                        <Text style={[styles.priChipText, { color: priColor }]}>{item.priority}</Text>
                    </View>

                    {/* Saat */}
                    {item.startTime !== '--:--' && (
                        <Text style={styles.timeText}>🕐 {item.startTime}</Text>
                    )}
                </View>
            </View>

            {/* Edit butonu */}
            <TouchableOpacity
                style={styles.editBtn}
                onPress={onEdit}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
                <MaterialCommunityIcons name="pencil-outline" size={17} color="#bbb" />
            </TouchableOpacity>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: rs(16),
        marginBottom: rs(10),
        paddingVertical: rs(12),
        paddingRight: rs(12),
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
        overflow: 'hidden',
    },
    cardDone: { opacity: 0.55 },

    priorityBar: {
        width: rs(4),
        alignSelf: 'stretch',
        borderRadius: rs(2),
        marginRight: rs(10),
        marginLeft: rs(4),
    },

    checkbox: {
        width: rs(22),
        height: rs(22),
        borderRadius: rs(6),
        borderWidth: 2,
        borderColor: '#d0d0d0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: rs(12),
    },

    content: { flex: 1 },

    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: rs(5),
    },
    title: {
        fontSize: rs(15),
        fontWeight: '600',
        color: '#222',
        flex: 1,
    },
    titleDone: {
        textDecorationLine: 'line-through',
        color: '#aaa',
    },

    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: rs(6),
    },
    catChip: {
        backgroundColor: '#EEF4FF',
        paddingHorizontal: rs(8),
        paddingVertical: rs(2),
        borderRadius: rs(6),
    },
    catChipText: { fontSize: rs(11), color: '#4A7AFF', fontWeight: '600' },

    priChip: {
        paddingHorizontal: rs(8),
        paddingVertical: rs(2),
        borderRadius: rs(6),
    },
    priChipText: { fontSize: rs(11), fontWeight: '700' },

    timeText: { fontSize: rs(11), color: '#aaa' },

    editBtn: {
        padding: rs(6),
        marginLeft: rs(4),
    },
});