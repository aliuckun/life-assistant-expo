import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ProgressBarProps {
    progress: number;
}

export const ProgressBar = ({ progress }: ProgressBarProps) => {
    return (
        <View style={styles.progressContainer}>
            <View style={styles.progressTextContainer}>
                <Text style={styles.progressLabel}>Günlük İlerleme</Text>
                <Text style={styles.progressPercent}>%{Math.round(progress * 100)}</Text>
            </View>
            <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    progressContainer: { paddingHorizontal: 20, marginTop: 10, marginBottom: 10 },
    progressTextContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    progressLabel: { color: '#666', fontWeight: '600' },
    progressPercent: { color: '#007AFF', fontWeight: 'bold' },
    progressBarBackground: { height: 8, backgroundColor: '#e0e0e0', borderRadius: 4 },
    progressBarFill: { height: '100%', backgroundColor: '#007AFF', borderRadius: 4 },
});