/**
 * WeeklyRing.tsx
 * Halka: react-native-svg Circle + JS-driven strokeDashoffset animasyonu
 * Barlar: Animated.View height
 */

import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors, rs } from '../../../styles';

// ─── Sabitler ────────────────────────────────────────────────
const SIZE = rs(120);
const STROKE = rs(11);
const HALF = SIZE / 2;
const RADIUS = HALF - STROKE / 2;
const CIRCUMF = 2 * Math.PI * RADIUS;
const DURATION = 950;

// ─── Renk ────────────────────────────────────────────────────
const getColor = (pct: number): string => {
    const p = Math.max(0, Math.min(100, pct)) / 100;
    let r: number, g: number, b: number;
    if (p < 0.5) {
        const t = p / 0.5;
        r = Math.round(229 + (251 - 229) * t);
        g = Math.round(57 + (140 - 57) * t);
        b = Math.round(53 + (0 - 53) * t);
    } else {
        const t = (p - 0.5) / 0.5;
        r = Math.round(251 + (67 - 251) * t);
        g = Math.round(140 + (160 - 140) * t);
        b = Math.round(0 + (71 - 0) * t);
    }
    return `rgb(${r},${g},${b})`;
};

// ─── Gün barı ────────────────────────────────────────────────
export interface DayBar {
    label: string;
    total: number;
    completed: number;
    isToday: boolean;
}

const BAR_H = rs(44);

const DayBarItem = ({ bar, animate }: { bar: DayBar; animate: boolean }) => {
    const anim = useRef(new Animated.Value(0)).current;
    const ratio = bar.total > 0 ? bar.completed / bar.total : 0;
    const color = bar.isToday ? Colors.primary : getColor(ratio * 100);

    useEffect(() => {
        anim.setValue(0);
        if (!animate || ratio === 0) return;
        Animated.timing(anim, {
            toValue: ratio,
            duration: DURATION,
            delay: 150,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
        }).start();
    }, [animate, ratio]);

    const animH = anim.interpolate({ inputRange: [0, 1], outputRange: [0, BAR_H] });

    return (
        <View style={barSt.col}>
            <View style={[barSt.track, { height: BAR_H }]}>
                <Animated.View style={{ width: '100%', height: animH, backgroundColor: color, borderRadius: rs(4) }} />
            </View>
            <Text style={[barSt.label, bar.isToday && barSt.today]}>{bar.label}</Text>
        </View>
    );
};

const barSt = StyleSheet.create({
    col: { alignItems: 'center', gap: rs(4) },
    track: { width: rs(8), backgroundColor: Colors.divider, borderRadius: rs(4), justifyContent: 'flex-end', overflow: 'hidden' },
    label: { fontSize: rs(9), color: Colors.textLight, fontWeight: '500' },
    today: { color: Colors.primary, fontWeight: '700' },
});

// ─── Halka ───────────────────────────────────────────────────
const Ring = ({ percent, animate }: { percent: number; animate: boolean }) => {
    const animVal = useRef(new Animated.Value(0)).current;
    const color = getColor(percent);

    // strokeDashoffset'i JS'de tutup SVG'ye listener ile besle
    const offsetRef = useRef(CIRCUMF);
    const circleRef = useRef<any>(null);

    useEffect(() => {
        animVal.setValue(0);

        const listener = animVal.addListener(({ value }) => {
            const offset = CIRCUMF - (CIRCUMF * value) / 100;
            offsetRef.current = offset;
            // setNativeProps ile her frame'de SVG'ye yaz
            circleRef.current?.setNativeProps({ strokeDashoffset: offset });
        });

        if (animate && percent > 0) {
            Animated.timing(animVal, {
                toValue: percent,
                duration: DURATION,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false,
            }).start();
        } else {
            // animate=false ise hemen son değere atla
            circleRef.current?.setNativeProps({ strokeDashoffset: CIRCUMF - (CIRCUMF * percent) / 100 });
        }

        return () => animVal.removeListener(listener);
    }, [animate, percent]);

    return (
        <Svg width={SIZE} height={SIZE}>
            {/* Arka plan */}
            <Circle
                cx={HALF} cy={HALF} r={RADIUS}
                stroke={Colors.divider}
                strokeWidth={STROKE}
                fill="none"
            />
            {/* Ön halka — setNativeProps ile beslenir */}
            <Circle
                ref={circleRef}
                cx={HALF} cy={HALF} r={RADIUS}
                stroke={color}
                strokeWidth={STROKE}
                fill="none"
                strokeDasharray={CIRCUMF}
                strokeDashoffset={CIRCUMF}   // başlangıç: boş
                strokeLinecap="round"
                rotation="-90"
                origin={`${HALF}, ${HALF}`}
            />
        </Svg>
    );
};

// ─── Ana export ──────────────────────────────────────────────
export interface WeeklyRingProps {
    percent: number;
    dayBars: DayBar[];
    animate: boolean;
}

export const WeeklyRing = ({ percent, dayBars, animate }: WeeklyRingProps) => {
    const color = getColor(percent);

    return (
        <View style={wrapSt.wrapper}>
            {/* Sol — Halka */}
            <View style={wrapSt.ringWrap}>
                <Ring percent={percent} animate={animate} />
                <View style={wrapSt.center}>
                    <Text style={[wrapSt.pct, { color }]}>%{percent}</Text>
                    <Text style={wrapSt.sub}>bu hafta</Text>
                </View>
            </View>

            {/* Sağ — Gün barları */}
            <View style={wrapSt.bars}>
                {dayBars.map((bar, i) => (
                    <DayBarItem key={i} bar={bar} animate={animate} />
                ))}
            </View>
        </View>
    );
};

const wrapSt = StyleSheet.create({
    wrapper: { flexDirection: 'row', alignItems: 'center', paddingVertical: rs(4) },
    ringWrap: { width: SIZE, height: SIZE, justifyContent: 'center', alignItems: 'center' },
    center: { position: 'absolute', alignItems: 'center' },
    pct: { fontSize: rs(22), fontWeight: '800' },
    sub: { fontSize: rs(9), color: Colors.textLight, marginTop: rs(1) },
    bars: { flex: 1, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', paddingLeft: rs(16) },
});