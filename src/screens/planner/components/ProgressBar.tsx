import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, rs } from '../../../styles';

interface Props {
    progress: number;
    completed: number;
    total: number;
}

export const ProgressBar = ({ progress, completed, total }: Props) => {
    const pct = Math.round(progress * 100);
    const isDone = pct === 100 && total > 0;
    const barColor = isDone ? Colors.success : Colors.primary;

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <Text style={styles.label}>
                    {isDone ? '🎉 Tüm görevler tamamlandı!' : 'Günlük İlerleme'}
                </Text>
                <Text style={[styles.pct, { color: barColor }]}>
                    {completed}/{total}
                </Text>
            </View>
            <View style={styles.bg}>
                <View style={[styles.fill, { width: `${pct}%`, backgroundColor: barColor }]} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: rs(20),
        paddingVertical: rs(10),
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: rs(6),
    },
    label: {
        fontSize: rs(13),
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    pct: {
        fontSize: rs(13),
        fontWeight: '700',
    },
    bg: {
        height: rs(6),
        backgroundColor: Colors.divider,
        borderRadius: rs(3),
    },
    fill: {
        height: rs(6),
        borderRadius: rs(3),
    },
});