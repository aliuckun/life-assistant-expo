/**
 * Skeleton.tsx — Shimmer animasyonlu placeholder bileşeni.
 * Kullanım: <Skeleton width={200} height={16} borderRadius={8} />
 */
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';

interface Props {
    width: number | string;
    height: number;
    borderRadius?: number;
    style?: ViewStyle;
}

export const Skeleton = ({ width, height, borderRadius = 8, style }: Props) => {
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(anim, { toValue: 1, duration: 900, useNativeDriver: true }),
                Animated.timing(anim, { toValue: 0, duration: 900, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.7] });

    return (
        <Animated.View
            style={[
                styles.bone,
                { width: width as any, height, borderRadius, opacity },
                style,
            ]}
        />
    );
};

// Hazır skeleton grupları
export const SkeletonHome = () => (
    <View style={styles.container}>
        {/* Karşılama */}
        <View style={styles.section}>
            <Skeleton width={120} height={13} borderRadius={6} />
            <Skeleton width={200} height={28} borderRadius={8} style={{ marginTop: 8 }} />
            <Skeleton width={260} height={13} borderRadius={6} style={{ marginTop: 8 }} />
        </View>

        {/* Haftalık özet kartı */}
        <View style={[styles.card, { marginBottom: 16 }]}>
            <View style={styles.row}>
                <Skeleton width={110} height={14} borderRadius={6} />
                <Skeleton width={80} height={12} borderRadius={6} />
            </View>
            <View style={[styles.row, { marginTop: 16, alignItems: 'center' }]}>
                <Skeleton width={120} height={120} borderRadius={60} />
                <View style={{ flex: 1, marginLeft: 16, gap: 8 }}>
                    {[40, 32, 44, 36, 28, 40, 32].map((h, i) => (
                        <Skeleton key={i} width={8} height={h} borderRadius={4} style={{ alignSelf: 'flex-end' }} />
                    ))}
                </View>
            </View>
        </View>

        {/* İkili panel */}
        <View style={[styles.card, { flexDirection: 'row', gap: 12, marginBottom: 16 }]}>
            <View style={{ flex: 1, gap: 8 }}>
                <Skeleton width={60} height={13} borderRadius={6} />
                <Skeleton width="100%" height={4} borderRadius={2} />
                <Skeleton width="90%" height={13} borderRadius={6} />
                <Skeleton width="70%" height={13} borderRadius={6} />
                <Skeleton width="80%" height={13} borderRadius={6} />
            </View>
            <View style={{ width: 1, backgroundColor: '#f0f0f0' }} />
            <View style={{ flex: 1, gap: 8 }}>
                <Skeleton width={60} height={13} borderRadius={6} />
                <Skeleton width="100%" height={4} borderRadius={2} style={{ opacity: 0 }} />
                <Skeleton width="90%" height={13} borderRadius={6} />
                <Skeleton width="70%" height={13} borderRadius={6} />
            </View>
        </View>

        {/* Stat kartları */}
        <View style={styles.row}>
            {[0, 1, 2].map(i => (
                <View key={i} style={[styles.card, { flex: 1 }]}>
                    <Skeleton width={32} height={32} borderRadius={10} style={{ alignSelf: 'center' }} />
                    <Skeleton width={40} height={20} borderRadius={6} style={{ alignSelf: 'center', marginTop: 8 }} />
                    <Skeleton width={56} height={11} borderRadius={5} style={{ alignSelf: 'center', marginTop: 4 }} />
                </View>
            ))}
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: { padding: 20, paddingTop: 16 },
    section: { marginBottom: 20, gap: 4 },
    card: { backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 0, gap: 4 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
    bone: { backgroundColor: '#E8ECF0' },
});