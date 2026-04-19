import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { Frequency } from '../types/habit';

interface Props {
    streak: number;
    frequency?: Frequency;
}

const UNIT: Record<Frequency, string> = {
    daily: 'gün',
    weekly: 'hafta',
    monthly: 'ay',
};

export const StreakBadge: React.FC<Props> = ({ streak, frequency = 'daily' }) => {
    if (streak === 0) return null;

    const unit = UNIT[frequency];

    return (
        <Text style={styles.text}>
            🔥 {streak} {unit} seri
        </Text>
    );
};

const styles = StyleSheet.create({
    text: {
        fontSize: 11,
        color: '#FF6D00',
        fontWeight: '600',
    },
});
