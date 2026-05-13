import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, rs } from '../../../styles';
import { Category, Transaction } from '../types/expense';

interface Props {
    transaction: Transaction;
    category: Category;
    onLongPress: () => void;
}

const fmt = (n: number) =>
    n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const TransactionItem: React.FC<Props> = ({ transaction, category, onLongPress }) => {
    const isIncome = transaction.type === 'income';
    const amountColor = isIncome ? Colors.success : Colors.danger;

    return (
        <TouchableOpacity
            style={styles.row}
            onLongPress={onLongPress}
            delayLongPress={400}
            activeOpacity={0.7}
        >
            {/* İkon */}
            <View style={[styles.iconBg, { backgroundColor: category.color + '18' }]}>
                <MaterialCommunityIcons name={category.icon as any} size={rs(20)} color={category.color} />
            </View>

            {/* İçerik */}
            <View style={styles.content}>
                <Text style={styles.note} numberOfLines={1}>
                    {transaction.note || category.name}
                </Text>
                <Text style={styles.categoryName}>{category.name}</Text>
            </View>

            {/* Tutar — gelir yeşil, gider kırmızı */}
            <View style={styles.amountWrap}>
                <Text style={[styles.amount, { color: amountColor }]}>
                    {isIncome ? '+' : '-'}₺{fmt(transaction.amount)}
                </Text>
                <View style={[styles.typeDot, { backgroundColor: amountColor + '20' }]}>
                    <MaterialCommunityIcons
                        name={isIncome ? 'arrow-down' : 'arrow-up'}
                        size={rs(10)}
                        color={amountColor}
                    />
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: rs(11),
        gap: rs(12),
    },
    iconBg: {
        width: rs(42),
        height: rs(42),
        borderRadius: rs(13),
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
    },
    content: { flex: 1 },
    note: { fontSize: rs(14), fontWeight: '600', color: '#222' },
    categoryName: { fontSize: rs(11), color: Colors.textLight, marginTop: rs(2) },

    amountWrap: { alignItems: 'flex-end', gap: rs(4) },
    amount: { fontSize: rs(14), fontWeight: '700' },
    typeDot: { width: rs(18), height: rs(18), borderRadius: rs(9), justifyContent: 'center', alignItems: 'center', alignSelf: 'flex-end' },
});