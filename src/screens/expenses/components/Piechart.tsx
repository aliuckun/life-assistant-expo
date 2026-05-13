import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { Circle, Svg } from 'react-native-svg';
import { Colors, rs } from '../../../styles';

interface Slice {
    color: string;
    name: string;
    percent: number;
    amount?: number;
}

interface Props {
    slices: Slice[];
    totalLabel: string;
}

const SIZE = rs(220);
const HALF = SIZE / 2;
const STROKE = rs(36);
const RADIUS = HALF - STROKE / 2;
const CIRCUMF = 2 * Math.PI * RADIUS;
const GAP_DEG = 2;
const DURATION = 900;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const DonutSlice = ({
    percent, offset, color, onPress,
}: {
    percent: number;
    offset: number;
    color: string;
    onPress: () => void;
}) => {
    const anim = useRef(new Animated.Value(0)).current;
    const circRef = useRef<any>(null);
    const dashLen = (percent / 100) * CIRCUMF - (GAP_DEG / 360) * CIRCUMF;
    const rotation = offset - 90;

    useEffect(() => {
        anim.setValue(0);
        const listener = anim.addListener(({ value }) => {
            circRef.current?.setNativeProps({
                strokeDasharray: [dashLen * value, CIRCUMF - dashLen * value],
            });
        });
        Animated.timing(anim, {
            toValue: 1,
            duration: DURATION,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
        }).start();
        return () => anim.removeListener(listener);
    }, [percent]);

    return (
        <Circle
            ref={circRef}
            cx={HALF} cy={HALF} r={RADIUS}
            stroke={color}
            strokeWidth={STROKE}
            fill="none"
            strokeDasharray={[0, CIRCUMF]}
            strokeLinecap="butt"
            rotation={rotation}
            origin={`${HALF}, ${HALF}`}
            onPress={onPress}
        />
    );
};

export const PieChart: React.FC<Props> = ({ slices, totalLabel }) => {
    const [selected, setSelected] = useState<Slice | null>(null);

    if (slices.length === 0) return null;

    let otherPct = 0;
    const visible = slices.filter(s => {
        if (s.percent < 2) { otherPct += s.percent; return false; }
        return true;
    });
    if (otherPct > 0) visible.push({ color: '#bdbdbd', name: 'Diğer', percent: otherPct });

    let currentAngle = 0;
    const segments = visible.map(s => {
        const start = currentAngle;
        currentAngle += (s.percent / 100) * 360;
        return { ...s, start };
    });

    const fmt = (n: number) => n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const centerLabel = selected
        ? {
            top: selected.name,
            mid: selected.amount != null ? `₺${fmt(selected.amount)}` : '',
            bottom: `%${Math.round(selected.percent)}`,
            color: selected.color,
        }
        : { top: `₺${totalLabel}`, mid: '', bottom: 'toplam gider', color: '#333' };

    return (
        <View style={styles.wrapper}>
            <View style={{ width: SIZE, height: SIZE }}>
                <Svg width={SIZE} height={SIZE}>
                    <Circle
                        cx={HALF} cy={HALF} r={RADIUS}
                        stroke={Colors.divider}
                        strokeWidth={STROKE}
                        fill="none"
                    />
                    {segments.map((seg, i) => (
                        <DonutSlice
                            key={i}
                            percent={seg.percent}
                            offset={seg.start}
                            color={seg.color}
                            onPress={() => setSelected(selected?.name === seg.name ? null : seg)}
                        />
                    ))}
                </Svg>

                {/* Ortadaki metin */}
                <View style={[styles.center, { width: SIZE, height: SIZE }]}>
                    <Text style={[styles.centerTop, { color: centerLabel.color }]} numberOfLines={1} adjustsFontSizeToFit>
                        {centerLabel.top}
                    </Text>
                    {centerLabel.mid ? (
                        <Text style={[styles.centerMid, { color: centerLabel.color }]}>{centerLabel.mid}</Text>
                    ) : null}
                    <Text style={styles.centerBot}>{centerLabel.bottom}</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: { alignItems: 'center' },
    center: { position: 'absolute', justifyContent: 'center', alignItems: 'center', paddingHorizontal: rs(20) },
    centerTop: { fontSize: rs(13), fontWeight: '700', textAlign: 'center', color: '#333' },
    centerMid: { fontSize: rs(16), fontWeight: '800', marginTop: rs(2), textAlign: 'center' },
    centerBot: { fontSize: rs(10), color: '#aaa', marginTop: rs(2) },
});