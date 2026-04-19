import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MonthSummary } from '../types/expense';

interface Props {
    data: MonthSummary[];
    selectedMonth: string;
    onSelect: (monthStr: string) => void;
}

const fmt = (amount: number): string => {
    if (amount >= 1000) return `₺${(amount / 1000).toFixed(1)}B`;
    return `₺${Math.round(amount)}`;
};

import { TouchableOpacity } from 'react-native';

export const PastMonths: React.FC<Props> = ({ data, selectedMonth, onSelect }) => {
    const maxExpense = Math.max(...data.map(d => d.expense), 1);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Son 6 Ay</Text>

            {/* Bar chart */}
            <View style={styles.chart}>
                {data.map(item => {
                    const isSelected = item.monthStr === selectedMonth;
                    const barH = Math.max((item.expense / maxExpense) * 80, 4);

                    return (
                        <TouchableOpacity
                            key={item.monthStr}
                            style={styles.col}
                            onPress={() => onSelect(item.monthStr)}
                            activeOpacity={0.7}
                        >
                            {/* Gider bar */}
                            <View style={styles.barContainer}>
                                <View
                                    style={[
                                        styles.bar,
                                        {
                                            height: barH,
                                            backgroundColor: isSelected ? '#007AFF' : '#E0E0E0',
                                        },
                                    ]}
                                />
                            </View>

                            {/* Tutar */}
                            <Text style={[styles.barAmount, isSelected && { color: '#007AFF' }]}>
                                {fmt(item.expense)}
                            </Text>

                            {/* Ay etiketi */}
                            <Text style={[styles.monthLabel, isSelected && { color: '#007AFF', fontWeight: '700' }]}>
                                {item.label.slice(0, 3)}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Seçili ay detayı */}
            {data.map(item => {
                if (item.monthStr !== selectedMonth) return null;
                return (
                    <View key={item.monthStr} style={styles.detail}>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Gelir</Text>
                            <Text style={[styles.detailValue, { color: '#43A047' }]}>
                                +₺{item.income.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                            </Text>
                        </View>
                        <View style={styles.detailDivider} />
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Gider</Text>
                            <Text style={[styles.detailValue, { color: '#E53935' }]}>
                                -₺{item.expense.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                            </Text>
                        </View>
                        <View style={styles.detailDivider} />
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Net</Text>
                            <Text style={[styles.detailValue, { color: item.net >= 0 ? '#43A047' : '#E53935' }]}>
                                {item.net >= 0 ? '+' : ''}₺{item.net.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                            </Text>
                        </View>
                    </View>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    title: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 16 },
    chart: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: 120,
        marginBottom: 8,
    },
    col: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    barContainer: {
        width: '60%',
        height: 80,
        justifyContent: 'flex-end',
    },
    bar: { width: '100%', borderRadius: 4 },
    barAmount: { fontSize: 9, color: '#aaa', marginTop: 4 },
    monthLabel: { fontSize: 10, color: '#999', marginTop: 2 },
    // Detay satırı
    detail: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 12,
        marginTop: 4,
    },
    detailItem: { flex: 1, alignItems: 'center' },
    detailDivider: { width: 1, backgroundColor: '#f0f0f0' },
    detailLabel: { fontSize: 11, color: '#aaa', marginBottom: 3 },
    detailValue: { fontSize: 13, fontWeight: '600' },
});
