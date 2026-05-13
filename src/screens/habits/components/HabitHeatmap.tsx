/**
 * HabitHeatmap.tsx
 * 30 günlük ısı haritası — 5 satır x 6 sütun grid.
 * flexWrap yerine Dimensions ile sabit hücre genişliği hesaplanır.
 */
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Colors, rs } from '../../../styles';

type DayStatus = 'completed' | 'failed' | 'pending' | 'before_start';

interface DayData {
    date: string;
    status: DayStatus;
}

interface Props {
    data: DayData[];
    color: string;
    type: 'good' | 'bad';
}

const COLS = 6;
const ROWS = 5;
const TOTAL = COLS * ROWS; // 30
const CARD_H_PAD = rs(32);      // HeatmapCard'ın yatay padding'i (her iki taraf)
const GAP = rs(6);
const SCREEN_W = Dimensions.get('window').width;
// Modal pageSheet genişliği ≈ ekran genişliği
// Kart padding (20+20) + modal padding (20+20) çıkarılır
const AVAILABLE_W = SCREEN_W - rs(40) - CARD_H_PAD;
const CELL_SIZE = Math.floor((AVAILABLE_W - GAP * (COLS - 1)) / COLS);

const getCellColor = (status: DayStatus, color: string, type: 'good' | 'bad'): string => {
    switch (status) {
        case 'completed': return type === 'good' ? color : '#43A047';
        case 'failed': return type === 'good' ? '#FFCDD2' : '#E53935';
        case 'pending': return '#EFEFEF';
        case 'before_start': return '#EFEFEF';
        default: return '#EFEFEF';
    }
};

const getCellOpacity = (status: DayStatus): number =>
    status === 'before_start' ? 0 : 1;

export const HabitHeatmap = ({ data, color, type }: Props) => {
    // Son 30 günü al, eksikse başa boş doldur
    const cells = data.slice(-TOTAL);
    const padded = cells.length < TOTAL
        ? [...Array(TOTAL - cells.length).fill({ date: '', status: 'before_start' as DayStatus }), ...cells]
        : cells;

    // Satır satır render
    const rows: DayData[][] = [];
    for (let r = 0; r < ROWS; r++) {
        rows.push(padded.slice(r * COLS, r * COLS + COLS));
    }

    return (
        <View>
            <View style={styles.grid}>
                {rows.map((row, rowIdx) => (
                    <View key={rowIdx} style={styles.row}>
                        {row.map((day, colIdx) => {
                            // Padded dizide son eleman her zaman bugün
                            const isToday = rowIdx === ROWS - 1 && colIdx === COLS - 1;
                            return (
                                <View
                                    key={`${rowIdx}-${colIdx}`}
                                    style={[
                                        styles.cell,
                                        {
                                            backgroundColor: getCellColor(day.status, color, type),
                                            opacity: getCellOpacity(day.status),
                                        },
                                        isToday && styles.cellToday,
                                    ]}
                                />
                            );
                        })}
                    </View>
                ))}
            </View>

            {/* Açıklama */}
            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: type === 'good' ? color : '#43A047' }]} />
                    <Text style={styles.legendText}>Tamamlandı</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: type === 'good' ? '#FFCDD2' : '#E53935' }]} />
                    <Text style={styles.legendText}>{type === 'good' ? 'Tamamlanmadı' : 'Limit aşıldı'}</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#EFEFEF', borderWidth: 1, borderColor: '#ddd' }]} />
                    <Text style={styles.legendText}>Bekliyor / Öncesi</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    grid: {
        gap: GAP,
    },
    row: {
        flexDirection: 'row',
        gap: GAP,
    },
    cell: {
        width: CELL_SIZE,
        height: CELL_SIZE,
        borderRadius: rs(5),
    },
    cellToday: {
        borderWidth: 2,
        borderColor: Colors.primary,
    },
    legend: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: rs(12),
        marginTop: rs(12),
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: rs(5),
    },
    legendDot: {
        width: rs(10),
        height: rs(10),
        borderRadius: rs(3),
    },
    legendText: {
        fontSize: rs(10),
        color: Colors.textLight,
    },
});