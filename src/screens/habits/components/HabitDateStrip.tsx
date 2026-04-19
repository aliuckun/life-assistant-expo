import React, { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const DAYS_SHORT = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

// Date → 'YYYY-MM-DD' local time
const toDateStr = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

interface Props {
    selectedDateStr: string;         // 'YYYY-MM-DD'
    onSelectDate: (dateStr: string) => void;
    dayCount?: number;
}

export const HabitDateStrip: React.FC<Props> = ({
    selectedDateStr,
    onSelectDate,
    dayCount = 14,
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

                    return (
                        <TouchableOpacity
                            key={dateStr}
                            style={[styles.card, selected && styles.cardSelected]}
                            onPress={() => onSelectDate(dateStr)}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.dayText, selected && styles.textSelected]}>
                                {isToday ? 'Bugün' : DAYS_SHORT[date.getDay()]}
                            </Text>
                            <Text style={[styles.dateText, selected && styles.textSelected]}>
                                {date.getDate()}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: { height: 84, marginBottom: 8 },
    scroll: { paddingHorizontal: 16, alignItems: 'center', gap: 8 },
    card: {
        width: 56,
        height: 68,
        backgroundColor: '#fff',
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    cardSelected: { backgroundColor: '#007AFF' },
    dayText: { fontSize: 11, color: '#aaa', marginBottom: 4, fontWeight: '500' },
    dateText: { fontSize: 19, fontWeight: 'bold', color: '#333' },
    textSelected: { color: '#fff' },
});