import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, rs } from '../../../styles';
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
    onDetail: () => void;
}

const PERIOD_LABEL: Record<string, string> = {
    daily: 'bugün', weekly: 'bu hafta', monthly: 'bu ay',
};

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
    onIncrement, onDecrement, onLongPress, onDetail,
}) => {
    const { count, isCompleted, isOverLimit } = status;

    const accent = habit.type === 'bad'
        ? interpolateColor(count, habit.targetCount)
        : habit.color;

    const isSimpleDaily = habit.frequency === 'daily' && habit.targetCount === 1 && habit.type === 'good';

    const renderAction = () => {
        if (isReadOnly) {
            return (
                <View style={[styles.readOnlyBadge, { backgroundColor: accent + '15' }]}>
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
                        { borderColor: isCompleted ? accent : '#e0e0e0' },
                        isCompleted && { backgroundColor: accent },
                    ]}
                    onPress={isCompleted ? onDecrement : onIncrement}
                    activeOpacity={0.7}
                >
                    {isCompleted && <MaterialCommunityIcons name="check" size={rs(17)} color="#fff" />}
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
                    <MaterialCommunityIcons name="minus" size={rs(14)} color={count === 0 ? '#ddd' : '#888'} />
                </TouchableOpacity>
                <Text style={[styles.cValue, { color: accent }]}>
                    {count}<Text style={styles.cTarget}>/{habit.targetCount}</Text>
                </Text>
                <TouchableOpacity
                    style={[styles.cBtn, { backgroundColor: accent + '15' }]}
                    onPress={onIncrement}
                    activeOpacity={0.7}
                >
                    <MaterialCommunityIcons name="plus" size={rs(14)} color={accent} />
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
                        {isOverLimit ? `⚠ ${period} limit aşıldı` : `${period} limit: ${habit.targetCount}`}
                    </Text>
                );
            }
            return (
                <Text style={styles.sub}>
                    {isCompleted ? `✓ ${period} hedef tamamlandı` : `${period}: ${count}/${habit.targetCount}`}
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
            {/* Sol renkli çizgi */}
            <View style={[styles.accentBar, { backgroundColor: isOverLimit ? Colors.danger : accent }]} />

            {/* İkon */}
            <View style={[styles.iconBg, { backgroundColor: accent + '15' }]}>
                <MaterialCommunityIcons name={habit.icon as any} size={rs(22)} color={accent} />
            </View>

            {/* İçerik */}
            <View style={styles.content}>
                <Text style={[styles.title, isCompleted && styles.titleDone]} numberOfLines={1}>
                    {habit.title}
                </Text>
                {renderSubtitle()}
            </View>

            {/* Aksiyon */}
            {renderAction()}

            {/* Detay butonu */}
            <TouchableOpacity
                style={styles.detailBtn}
                onPress={onDetail}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
                <MaterialCommunityIcons name="chart-bar" size={rs(15)} color="#ccc" />
            </TouchableOpacity>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: rs(16),
        marginBottom: rs(10),
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 2,
        paddingVertical: rs(12),
        paddingRight: rs(10),
    },
    cardDone: { opacity: 0.55 },
    cardOver: { backgroundColor: '#FFF5F5' },

    accentBar: {
        width: rs(3),
        alignSelf: 'stretch',
        borderRadius: rs(2),
        marginRight: rs(12),
        marginLeft: rs(4),
    },

    iconBg: {
        width: rs(44),
        height: rs(44),
        borderRadius: rs(13),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: rs(12),
    },

    content: { flex: 1 },
    title: { fontSize: rs(14), fontWeight: '600', color: '#333', marginBottom: rs(3) },
    titleDone: { color: '#bbb', textDecorationLine: 'line-through' },
    sub: { fontSize: rs(11), color: '#aaa' },
    subDanger: { color: Colors.danger, fontWeight: '600' },

    readOnlyBadge: { paddingHorizontal: rs(10), paddingVertical: rs(5), borderRadius: rs(10) },
    readOnlyText: { fontSize: rs(13), fontWeight: '700' },

    check: {
        width: rs(36),
        height: rs(36),
        borderRadius: rs(18),
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },

    counter: { flexDirection: 'row', alignItems: 'center', gap: rs(5) },
    cBtn: { width: rs(28), height: rs(28), borderRadius: rs(8), backgroundColor: '#f2f2f2', justifyContent: 'center', alignItems: 'center' },
    cBtnDisabled: { backgroundColor: '#fafafa' },
    cValue: { fontSize: rs(13), fontWeight: '800', minWidth: rs(36), textAlign: 'center' },
    cTarget: { fontSize: rs(10), fontWeight: '400', color: '#ccc' },

    detailBtn: { marginLeft: rs(6), padding: rs(4) },
});