import { addDays, format, isSameDay, isToday } from 'date-fns';
import { tr } from 'date-fns/locale';
import React, { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, rs } from '../../../styles';

interface Props {
    selectedDate: Date;
    onSelectDate: (date: Date) => void;
}

// DateStrip: bugünden 5 gün öncesi → bugün → yarın (7 gün)
const buildDates = () =>
    Array.from({ length: 14 }, (_, i) => addDays(new Date(), i - 5));

export const DateStrip = ({ selectedDate, onSelectDate }: Props) => {
    const scrollRef = useRef<ScrollView>(null);
    const dates = buildDates();

    // Açılışta bugünü ortaya getir (5. eleman)
    useEffect(() => {
        setTimeout(() => {
            scrollRef.current?.scrollTo({ x: rs(5) * (rs(64) + rs(10)), animated: false });
        }, 50);
    }, []);

    return (
        <View style={styles.container}>
            <ScrollView
                ref={scrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scroll}
            >
                {dates.map((date, i) => {
                    const isSelected = isSameDay(date, selectedDate);
                    const todayFlag = isToday(date);
                    const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

                    return (
                        <TouchableOpacity
                            key={i}
                            style={[
                                styles.card,
                                isSelected && styles.cardSelected,
                                todayFlag && !isSelected && styles.cardToday,
                            ]}
                            onPress={() => onSelectDate(date)}
                            activeOpacity={0.75}
                        >
                            <Text style={[
                                styles.dayText,
                                isSelected && styles.textSelected,
                                todayFlag && !isSelected && styles.dayTextToday,
                                isPast && !isSelected && styles.textPast,
                            ]}>
                                {format(date, 'EEE', { locale: tr }).toUpperCase()}
                            </Text>
                            <Text style={[
                                styles.dateNum,
                                isSelected && styles.textSelected,
                                isPast && !isSelected && styles.textPast,
                            ]}>
                                {format(date, 'd')}
                            </Text>
                            {todayFlag && (
                                <View style={[styles.todayDot, isSelected && styles.todayDotSelected]} />
                            )}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const CARD_W = rs(56);

const styles = StyleSheet.create({
    container: { marginTop: rs(6), marginBottom: rs(2) },
    scroll: { paddingHorizontal: rs(16), gap: rs(8), paddingVertical: rs(4) },

    card: {
        width: CARD_W,
        paddingVertical: rs(10),
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

    dayText: {
        fontSize: rs(10),
        fontWeight: '700',
        color: Colors.textLight,
        letterSpacing: 0.3,
    },
    dayTextToday: {
        color: Colors.primary,
    },
    dateNum: {
        fontSize: rs(18),
        fontWeight: '800',
        color: Colors.textSecondary,
    },
    textSelected: {
        color: '#fff',
    },
    textPast: {
        color: Colors.textFaint,
    },
    todayDot: {
        width: rs(4),
        height: rs(4),
        borderRadius: rs(2),
        backgroundColor: Colors.primary,
        marginTop: rs(1),
    },
    todayDotSelected: {
        backgroundColor: 'rgba(255,255,255,0.7)',
    },
});