import { addDays, format, isSameDay } from 'date-fns';
import { tr } from 'date-fns/locale';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DateStripProps {
    selectedDate: Date;
    onSelectDate: (date: Date) => void;
}

export const DateStrip = ({ selectedDate, onSelectDate }: DateStripProps) => {
    const dates = Array.from({ length: 7 }, (_, i) => {
        const tomorrow = addDays(new Date(), 1); // Referans noktası: Yarın
        return addDays(tomorrow, -(6 - i));           // i=0 ise Yarın, i=1 ise Bugün, i=2 ise Dün...
    });

    return (
        <View style={styles.container}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 15 }}>
                {dates.map((date, index) => {
                    const isSelected = isSameDay(date, selectedDate);
                    return (
                        <TouchableOpacity
                            key={index}
                            style={[styles.dateCard, isSelected && styles.selectedDateCard]}
                            onPress={() => onSelectDate(date)}
                        >
                            <Text style={[styles.dayText, isSelected && styles.selectedText]}>
                                {format(date, 'EEE', { locale: tr })}
                            </Text>
                            <Text style={[styles.dateText, isSelected && styles.selectedText]}>
                                {format(date, 'd')}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { height: 100, marginTop: 10 },
    dateCard: { width: 60, height: 80, backgroundColor: '#fff', borderRadius: 12, marginRight: 10, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
    selectedDateCard: { backgroundColor: '#007AFF' },
    dayText: { fontSize: 14, color: '#999', marginBottom: 5 },
    dateText: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    selectedText: { color: '#fff' },
});