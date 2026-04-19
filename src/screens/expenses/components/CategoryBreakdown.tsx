import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface CategoryItem {
    categoryId: string;
    name: string;
    icon: string;
    color: string;
    amount: number;
    percent: number;
}

interface Props {
    data: CategoryItem[];
}

const fmt = (amount: number): string =>
    amount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const CategoryBreakdown: React.FC<Props> = ({ data }) => {
    if (data.length === 0) {
        return (
            <View style={styles.empty}>
                <Text style={styles.emptyText}>Bu ay henüz gider yok</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Kategori Dağılımı</Text>
            {data.map(item => (
                <View key={item.categoryId} style={styles.row}>
                    {/* İkon + isim */}
                    <View style={[styles.icon, { backgroundColor: item.color + '18' }]}>
                        <MaterialCommunityIcons name={item.icon as any} size={16} color={item.color} />
                    </View>
                    <View style={styles.info}>
                        <View style={styles.topRow}>
                            <Text style={styles.name}>{item.name}</Text>
                            <Text style={styles.amount}>₺{fmt(item.amount)}</Text>
                        </View>
                        {/* Yatay bar */}
                        <View style={styles.barBg}>
                            <View
                                style={[
                                    styles.barFill,
                                    {
                                        width: `${Math.min(item.percent, 100)}%`,
                                        backgroundColor: item.color,
                                    },
                                ]}
                            />
                        </View>
                        <Text style={styles.percent}>%{Math.round(item.percent)}</Text>
                    </View>
                </View>
            ))}
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
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 14,
    },
    icon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        marginTop: 2,
    },
    info: { flex: 1 },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    name: { fontSize: 13, fontWeight: '500', color: '#333' },
    amount: { fontSize: 13, fontWeight: '600', color: '#333' },
    barBg: {
        height: 6,
        backgroundColor: '#f0f0f0',
        borderRadius: 3,
        marginBottom: 3,
    },
    barFill: { height: 6, borderRadius: 3 },
    percent: { fontSize: 10, color: '#aaa' },
    empty: { paddingVertical: 20, alignItems: 'center' },
    emptyText: { fontSize: 13, color: '#ccc' },
});
