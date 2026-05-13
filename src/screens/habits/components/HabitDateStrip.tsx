import React, { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, rs } from '../../../styles';

const DAYS_SHORT = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

const toDateStr = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

interface Props {
    selectedDateStr: string;
    onSelectDate: (dateStr: string) => void;
    dayCount?: number;
}

export const HabitDateStrip: React.FC<Props> = ({
    selectedDateStr, onSelectDate, dayCount = 14,
}) => {
    const scrollRef = useRef<ScrollView>(null);

    const dates = Array.from({ length: dayCount }, (_, i) => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - (dayCount - 1 - i));
        return d;
    });

    useEffect(() => {
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 100);
    }, []);

    const todayStr = toDateStr(new Date());

    return (
        <View style={styles.wrapper}>
            <ScrollView
                ref={scrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scroll}
            >
                {dates.map((date, index) => {
                    const dateStr = toDateStr(date);
                    const selected = dateStr === selectedDateStr;
                    const isToday = dateStr === todayStr;
                    const isPast = dateStr < todayStr;

                    return (
                        <TouchableOpacity
                            key={dateStr}
                            style={[
                                styles.card,
                                selected && styles.cardSelected,
                                isToday && !selected && styles.cardToday,
                            ]}
                            onPress={() => onSelectDate(dateStr)}
                            activeOpacity={0.75}
                        >
                            <Text style={[
                                styles.dayText,
                                selected && styles.textSelected,
                                isToday && !selected && styles.dayTextToday,
                                isPast && !selected && !isToday && styles.textPast,
                            ]}>
                                {isToday ? 'Bug' : DAYS_SHORT[date.getDay()]}
                            </Text>
                            <Text style={[
                                styles.dateNum,
                                selected && styles.textSelected,
                                isPast && !selected && !isToday && styles.textPast,
                            ]}>
                                {date.getDate()}
                            </Text>
                            {isToday && (
                                <View style={[styles.todayDot, selected && styles.todayDotSelected]} />
                            )}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: { marginBottom: rs(8) },
    scroll: { paddingHorizontal: rs(16), gap: rs(8), paddingVertical: rs(4) },

    card: {
        width: rs(52),
        paddingVertical: rs(9),
        borderRadius: rs(14),
        alignItems: 'center',
        backgroundColor: Colors.surface,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 3,
        elevation: 1,
        gap: rs(3),
    },
    cardSelected: {
        backgroundColor: Colors.primary,
        shadowOpacity: 0.15,
        elevation: 4,
    },
    cardToday: {
        borderWidth: 1.5,
        borderColor: Colors.primary,
    },

    dayText: { fontSize: rs(10), fontWeight: '700', color: Colors.textLight, letterSpacing: 0.2 },
    dayTextToday: { color: Colors.primary },
    dateNum: { fontSize: rs(17), fontWeight: '800', color: Colors.textSecondary },
    textSelected: { color: '#fff' },
    textPast: { color: Colors.textFaint },

    todayDot: { width: rs(4), height: rs(4), borderRadius: rs(2), backgroundColor: Colors.primary, marginTop: rs(1) },
    todayDotSelected: { backgroundColor: 'rgba(255,255,255,0.7)' },
});