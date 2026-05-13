import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, rs } from '../../../styles';
import { MonthSummary } from '../types/expense';

interface Props {
    data: MonthSummary[];
    selectedMonth: string;
    onSelect: (monthStr: string) => void;
}

const fmt = (n: number): string => {
    if (n >= 1000) return `₺${(n / 1000).toFixed(1)}B`;
    return `₺${Math.round(n)}`;
};

const fmtFull = (n: number) =>
    n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const PastMonths: React.FC<Props> = ({ data, selectedMonth, onSelect }) => {
    const maxExpense = Math.max(...data.map(d => d.expense), 1);
    const selected = data.find(d => d.monthStr === selectedMonth);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Son 6 Ay</Text>

            {/* Bar chart */}
            <View style={styles.chart}>
                {data.map(item => {
                    const isSel = item.monthStr === selectedMonth;
                    const barH = Math.max((item.expense / maxExpense) * rs(72), rs(4));
                    const hasData = item.expense > 0 || item.income > 0;

                    return (
                        <TouchableOpacity
                            key={item.monthStr}
                            style={styles.col}
                            onPress={() => onSelect(item.monthStr)}
                            activeOpacity={0.75}
                        >
                            <Text style={[styles.barAmt, isSel && { color: Colors.primary, fontWeight: '700' }]}>
                                {hasData ? fmt(item.expense) : ''}
                            </Text>
                            <View style={styles.barTrack}>
                                <View style={[
                                    styles.barFill,
                                    { height: barH, backgroundColor: isSel ? Colors.primary : '#D0D0D0' },
                                ]} />
                            </View>
                            <Text style={[styles.monthLabel, isSel && { color: Colors.primary, fontWeight: '700' }]}>
                                {item.label.slice(0, 3)}
                            </Text>
                            {isSel && <View style={styles.selectedDot} />}
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Seçili ay detayı */}
            {selected && (
                <View style={styles.detail}>
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Gelir</Text>
                        <Text style={[styles.detailValue, { color: Colors.success }]}>
                            +₺{fmtFull(selected.income)}
                        </Text>
                    </View>
                    <View style={styles.detailDivider} />
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Gider</Text>
                        <Text style={[styles.detailValue, { color: Colors.danger }]}>
                            -₺{fmtFull(selected.expense)}
                        </Text>
                    </View>
                    <View style={styles.detailDivider} />
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Net</Text>
                        <Text style={[styles.detailValue, {
                            color: selected.net >= 0 ? Colors.success : Colors.danger
                        }]}>
                            {selected.net >= 0 ? '+' : ''}₺{fmtFull(selected.net)}
                        </Text>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.surface,
        borderRadius: rs(16),
        padding: rs(16),
        marginBottom: rs(16),
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowOffset: { width: 0, height: 1 },
        elevation: 2,
    },
    title: {
        fontSize: rs(15),
        fontWeight: '700',
        color: '#333',
        marginBottom: rs(14),
    },
    chart: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: rs(110),
        marginBottom: rs(4),
    },
    col: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: rs(3),
    },
    barAmt: {
        fontSize: rs(9),
        color: Colors.textLight,
        marginBottom: rs(2),
    },
    barTrack: {
        width: rs(22),
        height: rs(72),
        justifyContent: 'flex-end',
        borderRadius: rs(5),
        backgroundColor: '#F5F5F5',
        overflow: 'hidden',
    },
    barFill: {
        width: '100%',
        borderRadius: rs(5),
    },
    monthLabel: {
        fontSize: rs(10),
        color: Colors.textLight,
        fontWeight: '500',
    },
    selectedDot: {
        width: rs(4),
        height: rs(4),
        borderRadius: rs(2),
        backgroundColor: Colors.primary,
    },

    // Seçili ay detayı
    detail: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: Colors.divider,
        paddingTop: rs(12),
        marginTop: rs(8),
    },
    detailItem: { flex: 1, alignItems: 'center', gap: rs(3) },
    detailDivider: { width: 1, backgroundColor: Colors.divider, marginVertical: rs(2) },
    detailLabel: { fontSize: rs(11), color: Colors.textLight, fontWeight: '500' },
    detailValue: { fontSize: rs(13), fontWeight: '700' },
});