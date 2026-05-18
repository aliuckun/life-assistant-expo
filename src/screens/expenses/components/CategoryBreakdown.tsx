import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, rs } from '../../../styles';
import { CategoryBreakdownItem } from '../types/expense';
import { PieChart } from './Piechart';

interface Props {
    data: CategoryBreakdownItem[];
    animTrigger?: number;
}

const fmt = (n: number) => n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const CategoryBreakdown: React.FC<Props> = ({ data, animTrigger = 0 }) => {
    if (data.length === 0) {
        return (
            <View style={styles.empty}>
                <Text style={styles.emptyText}>Bu dönemde henüz gider yok</Text>
            </View>
        );
    }

    const total = data.reduce((s, d) => s + d.amount, 0);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Kategori Dağılımı</Text>

            {/* Pasta grafik */}
            <View style={styles.pieWrap}>
                <PieChart
                    slices={data.map(d => ({ color: d.color, name: d.name, percent: d.percent, amount: d.amount }))}
                    totalLabel={fmt(total)}
                    animTrigger={animTrigger}
                />
            </View>

            {/* Liste */}
            <View style={styles.list}>
                {data.map(item => {
                    const hasBudget = item.budget != null && item.budget > 0;
                    const overBudget = hasBudget && item.amount > item.budget!;
                    const budgetPct = hasBudget ? Math.min((item.amount / item.budget!) * 100, 100) : 0;

                    return (
                        <View key={item.categoryId} style={styles.row}>
                            <View style={[styles.icon, { backgroundColor: item.color + '18' }]}>
                                <MaterialCommunityIcons name={item.icon as any} size={16} color={item.color} />
                            </View>
                            <View style={styles.info}>
                                <View style={styles.topRow}>
                                    <Text style={styles.name}>{item.name}</Text>
                                    <View style={styles.amountWrap}>
                                        <Text style={[styles.amount, overBudget && { color: Colors.danger }]}>
                                            ₺{fmt(item.amount)}
                                        </Text>
                                        {hasBudget && (
                                            <Text style={styles.budgetLabel}>/ ₺{fmt(item.budget!)}</Text>
                                        )}
                                    </View>
                                </View>

                                {/* Bütçe varsa bütçe bar'ı, yoksa normal yüzde bar */}
                                <View style={styles.barBg}>
                                    <View style={[styles.barFill, {
                                        width: hasBudget ? `${budgetPct}%` : `${Math.min(item.percent, 100)}%`,
                                        backgroundColor: overBudget ? Colors.danger : item.color,
                                    }]} />
                                </View>

                                <View style={styles.bottomRow}>
                                    <Text style={styles.percent}>%{Math.round(item.percent)}</Text>
                                    {overBudget && (
                                        <Text style={styles.overBudget}>
                                            ⚠️ ₺{fmt(item.amount - item.budget!)} aşım
                                        </Text>
                                    )}
                                </View>
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { backgroundColor: '#fff', borderRadius: rs(16), padding: rs(16), marginBottom: rs(16) },
    title: { fontSize: rs(15), fontWeight: '700', color: '#333', marginBottom: rs(16) },
    pieWrap: { alignItems: 'center', marginBottom: rs(24) },
    list: { gap: rs(14) },
    empty: { paddingVertical: rs(20), alignItems: 'center' },
    emptyText: { fontSize: rs(13), color: '#ccc' },
    row: { flexDirection: 'row', alignItems: 'flex-start' },
    icon: { width: rs(36), height: rs(36), borderRadius: rs(10), justifyContent: 'center', alignItems: 'center', marginRight: rs(12), marginTop: rs(2) },
    info: { flex: 1 },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: rs(6) },
    name: { fontSize: rs(13), fontWeight: '500', color: '#333' },
    amountWrap: { flexDirection: 'row', alignItems: 'baseline', gap: rs(3) },
    amount: { fontSize: rs(13), fontWeight: '600', color: '#333' },
    budgetLabel: { fontSize: rs(10), color: '#aaa' },
    barBg: { height: rs(5), backgroundColor: '#f0f0f0', borderRadius: rs(3), marginBottom: rs(3) },
    barFill: { height: rs(5), borderRadius: rs(3) },
    bottomRow: { flexDirection: 'row', justifyContent: 'space-between' },
    percent: { fontSize: rs(10), color: '#aaa' },
    overBudget: { fontSize: rs(10), color: Colors.danger, fontWeight: '600' },
});