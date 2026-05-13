/**
 * ArchivedGoals.tsx
 * Arşivlenmiş hedefler listesi.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert, StyleSheet, Text,
    TouchableOpacity, View,
} from 'react-native';
import { Colors, rs } from '../../../styles';
import { Goal } from '../types/goal';

const MONTHS_TR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

const formatDate = (dateStr?: string): string => {
    if (!dateStr) return '';
    const [, m, d] = dateStr.split('-').map(Number);
    return `${d} ${MONTHS_TR[m - 1]}`;
};

interface Props {
    goals: Goal[];
    onUnarchive: (id: string) => void;
    onRemove: (id: string) => void;
}

export const ArchivedGoals = ({ goals, onUnarchive, onRemove }: Props) => {
    const [expanded, setExpanded] = useState(false);

    if (goals.length === 0) return null;

    return (
        <View style={styles.container}>
            {/* Section başlığı — tıklanınca açılır/kapanır */}
            <TouchableOpacity style={styles.header} onPress={() => setExpanded(e => !e)} activeOpacity={0.7}>
                <View style={styles.headerLeft}>
                    <MaterialCommunityIcons name="archive-outline" size={rs(18)} color={Colors.textLight} />
                    <Text style={styles.headerTitle}>Arşiv</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{goals.length}</Text>
                    </View>
                </View>
                <MaterialCommunityIcons
                    name={expanded ? 'chevron-up' : 'chevron-down'}
                    size={rs(20)}
                    color={Colors.textLight}
                />
            </TouchableOpacity>

            {expanded && (
                <View style={styles.list}>
                    {goals.map(goal => (
                        <View key={goal.id} style={styles.card}>
                            {/* Sol renk çizgisi */}
                            <View style={[styles.colorBar, { backgroundColor: goal.color }]} />

                            <View style={[styles.iconBg, { backgroundColor: goal.color + '18' }]}>
                                <MaterialCommunityIcons name={goal.icon as any} size={rs(18)} color={goal.color} />
                            </View>

                            <View style={styles.info}>
                                <Text style={styles.goalTitle} numberOfLines={1}>{goal.title}</Text>
                                {goal.archivedAt && (
                                    <Text style={styles.archivedDate}>
                                        {formatDate(goal.archivedAt)}'de arşivlendi
                                    </Text>
                                )}
                            </View>

                            {/* Geri al butonu */}
                            <TouchableOpacity
                                style={styles.actionBtn}
                                onPress={() => onUnarchive(goal.id)}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                                <MaterialCommunityIcons name="restore" size={rs(18)} color={Colors.primary} />
                            </TouchableOpacity>

                            {/* Sil butonu */}
                            <TouchableOpacity
                                style={styles.actionBtn}
                                onPress={() =>
                                    Alert.alert(
                                        'Hedefi Sil',
                                        `"${goal.title}" kalıcı olarak silinsin mi?`,
                                        [
                                            { text: 'Vazgeç', style: 'cancel' },
                                            { text: 'Sil', style: 'destructive', onPress: () => onRemove(goal.id) },
                                        ]
                                    )
                                }
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                                <MaterialCommunityIcons name="trash-can-outline" size={rs(18)} color={Colors.danger} />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: rs(20),
        marginBottom: rs(30),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: rs(12),
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: rs(8),
    },
    headerTitle: {
        fontSize: rs(15),
        fontWeight: '600',
        color: Colors.textLight,
    },
    badge: {
        backgroundColor: Colors.divider,
        paddingHorizontal: rs(8),
        paddingVertical: rs(2),
        borderRadius: rs(10),
    },
    badgeText: {
        fontSize: rs(11),
        color: Colors.textLight,
        fontWeight: '600',
    },
    list: { gap: rs(8) },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: rs(14),
        overflow: 'hidden',
        gap: rs(10),
        paddingRight: rs(10),
        paddingVertical: rs(10),
        shadowColor: '#000',
        shadowOpacity: 0.03,
        elevation: 1,
    },
    colorBar: {
        width: rs(4),
        alignSelf: 'stretch',
    },
    iconBg: {
        width: rs(36), height: rs(36),
        borderRadius: rs(10),
        justifyContent: 'center',
        alignItems: 'center',
    },
    info: { flex: 1 },
    goalTitle: {
        fontSize: rs(14),
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    archivedDate: {
        fontSize: rs(11),
        color: Colors.textLight,
        marginTop: rs(2),
    },
    actionBtn: { padding: rs(4) },
});