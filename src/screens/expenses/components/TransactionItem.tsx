import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Category, Transaction } from '../types/expense';

interface Props {
    transaction: Transaction;
    category: Category;
    onLongPress: () => void;
}

const fmt = (amount: number): string =>
    amount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const TransactionItem: React.FC<Props> = ({ transaction, category, onLongPress }) => {
    const isIncome = transaction.type === 'income';

    return (
        <TouchableOpacity
            style={styles.row}
            onLongPress={onLongPress}
            delayLongPress={400}
            activeOpacity={0.7}
        >
            {/* İkon */}
            <View style={[styles.icon, { backgroundColor: category.color + '18' }]}>
                <MaterialCommunityIcons
                    name={category.icon as any}
                    size={20}
                    color={category.color}
                />
            </View>

            {/* Açıklama */}
            <View style={styles.content}>
                <Text style={styles.note} numberOfLines={1}>
                    {transaction.note || category.name}
                </Text>
                <Text style={styles.category}>{category.name}</Text>
            </View>

            {/* Tutar */}
            <Text style={[styles.amount, { color: isIncome ? '#43A047' : '#333' }]}>
                {isIncome ? '+' : '-'}₺{fmt(transaction.amount)}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    icon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    content: { flex: 1 },
    note: { fontSize: 14, fontWeight: '500', color: '#333' },
    category: { fontSize: 11, color: '#aaa', marginTop: 1 },
    amount: { fontSize: 14, fontWeight: '600' },
});
