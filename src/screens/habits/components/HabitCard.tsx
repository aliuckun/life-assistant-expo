import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Habit, HabitStatus } from '../types/habit';
import { StreakBadge } from './StreakBadge';

interface Props {
    habit: Habit;
    status: HabitStatus;
    streak: number;
    isReadOnly: boolean;
    onIncrement: () => void;
    onDecrement: () => void;
    onLongPress: () => void;
}

const PERIOD_LABEL: Record<string, string> = {
    daily: 'bugün',
    weekly: 'bu hafta',
    monthly: 'bu ay',
};

// Yeşil → Sarı → Kırmızı
const interpolateColor = (count: number, limit: number): string => {
    if (limit === 0) return '#43A047';
    const ratio = Math.min(count / limit, 1);

    let r: number, g: number, b: number;

    if (ratio <= 0.5) {
        const t = ratio / 0.5;
        r = Math.round(67 + (255 - 67) * t);
        g = Math.round(160 + (193 - 160) * t);
        b = Math.round(71 + (7 - 71) * t);
    } else {
        const t = (ratio - 0.5) / 0.5;
        r = Math.round(255 + (229 - 255) * t);
        g = Math.round(193 + (57 - 193) * t);
        b = Math.round(7 + (53 - 7) * t);
    }

    return `rgb(${r},${g},${b})`;
};

export const HabitCard: React.FC<Props> = ({
    habit, status, streak, isReadOnly,
    onIncrement, onDecrement, onLongPress,
}) => {
    const { count, isCompleted, isOverLimit } = status;

    const accent = habit.type === 'bad'
        ? interpolateColor(count, habit.targetCount)
        : habit.color;

    const isSimpleDaily =
        habit.frequency === 'daily' &&
        habit.targetCount === 1 &&
        habit.type === 'good';

    const renderAction = () => {
        if (isReadOnly) {
            return (
                <View style={styles.readOnlyBadge}>
                    <Text style={[styles.readOnlyText, { color: accent }]}>
                        {count}/{habit.targetCount}
                    </Text>
                </View>
            );
        }

        if (isSimpleDaily) {
            return (
                <TouchableOpacity
                    style={[
                        styles.check,
                        isCompleted && { backgroundColor: habit.color, borderColor: habit.color },
                    ]}
                    onPress={isCompleted ? onDecrement : onIncrement}
                    activeOpacity={0.7}
                >
                    {isCompleted && (
                        <MaterialCommunityIcons name="check" size={18} color="#fff" />
                    )}
                </TouchableOpacity>
            );
        }

        return (
            <View style={styles.counter}>
                <TouchableOpacity
                    style={[styles.cBtn, count === 0 && styles.cBtnDisabled]}
                    onPress={onDecrement}
                    disabled={count === 0}
                    activeOpacity={0.7}
                >
                    <MaterialCommunityIcons
                        name="minus"
                        size={15}
                        color={count === 0 ? '#ddd' : '#888'}
                    />
                </TouchableOpacity>

                <Text style={[styles.cValue, { color: accent }]}>
                    {count}
                    <Text style={styles.cTarget}>/{habit.targetCount}</Text>
                </Text>

                <TouchableOpacity
                    style={[styles.cBtn, { backgroundColor: 'rgba(0,0,0,0.06)' }]}
                    onPress={onIncrement}
                    activeOpacity={0.7}
                >
                    <MaterialCommunityIcons name="plus" size={15} color={accent} />
                </TouchableOpacity>
            </View>
        );
    };

    const renderSubtitle = () => {
        if (habit.frequency !== 'daily') {
            const period = PERIOD_LABEL[habit.frequency];
            if (habit.type === 'bad') {
                return (
                    <Text style={[styles.sub, isOverLimit && styles.subDanger]}>
                        {isOverLimit
                            ? `⚠ ${period} limit aşıldı`
                            : `${period} limit: ${habit.targetCount}`}
                    </Text>
                );
            }
            return (
                <Text style={styles.sub}>
                    {isCompleted
                        ? `✓ ${period} hedef tamamlandı`
                        : `${period}: ${count}/${habit.targetCount}`}
                </Text>
            );
        }

        if (habit.type === 'bad') {
            return (
                <Text style={[styles.sub, isOverLimit && styles.subDanger]}>
                    {isOverLimit ? '⚠ Bugün limit aşıldı' : `Limit: ${habit.targetCount}/gün`}
                </Text>
            );
        }

        return <StreakBadge streak={streak} frequency={habit.frequency} />;
    };

    return (
        <TouchableOpacity
            style={[
                styles.card,
                isCompleted && styles.cardDone,
                isOverLimit && styles.cardOver,
            ]}
            onLongPress={onLongPress}
            activeOpacity={0.85}
            delayLongPress={400}
        >
            <View style={[styles.icon, { backgroundColor: `rgba(0,0,0,0.06)` }]}>
                <MaterialCommunityIcons
                    name={habit.icon as any}
                    size={24}
                    color={accent}
                />
            </View>

            <View style={styles.content}>
                <Text
                    style={[styles.title, isCompleted && styles.titleDone]}
                    numberOfLines={1}
                >
                    {habit.title}
                </Text>
                {renderSubtitle()}
            </View>

            {renderAction()}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 14,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardDone: { opacity: 0.6 },
    cardOver: {
        borderWidth: 1,
        borderColor: '#FFCDD2',
        backgroundColor: '#FFF8F8',
    },
    icon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    content: { flex: 1 },
    title: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 3 },
    titleDone: { color: '#bbb', textDecorationLine: 'line-through' },
    sub: { fontSize: 11, color: '#aaa' },
    subDanger: { color: '#E53935', fontWeight: '600' },
    readOnlyBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
    },
    readOnlyText: { fontSize: 13, fontWeight: 'bold' },
    check: {
        width: 34,
        height: 34,
        borderRadius: 17,
        borderWidth: 2,
        borderColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
    },
    counter: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    cBtn: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: '#f2f2f2',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cBtnDisabled: { backgroundColor: '#fafafa' },
    cValue: { fontSize: 14, fontWeight: 'bold', minWidth: 36, textAlign: 'center' },
    cTarget: { fontSize: 11, fontWeight: '400', color: '#ccc' },
});