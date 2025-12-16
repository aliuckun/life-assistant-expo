import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Task } from '../types/task';

interface TaskItemProps {
    item: Task;
    onToggle: () => void;
    onLongPress: () => void;
}

export const TaskItem = ({ item, onToggle, onLongPress }: TaskItemProps) => {
    return (
        <TouchableOpacity
            style={[styles.taskCard, item.isCompleted && styles.completedCard]}
            onPress={onToggle}
            onLongPress={onLongPress}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[styles.checkbox, item.isCompleted && styles.checkedCheckbox]}>
                    {item.isCompleted && <Ionicons name="checkmark" size={16} color="#fff" />}
                </View>
                <View style={{ marginLeft: 15, flex: 1 }}>
                    <Text style={[styles.taskTitle, item.isCompleted && styles.completedText]}>{item.title}</Text>
                    <View style={{ flexDirection: 'row', marginTop: 5 }}>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{item.category}</Text>
                        </View>
                        <View style={[styles.badge, { marginLeft: 5, backgroundColor: '#f0f0f0' }]}>
                            <Text style={[styles.badgeText, { color: '#666' }]}>{item.priority}</Text>
                        </View>
                    </View>
                </View>
                <View>
                    <Text style={styles.timeText}>{item.startTime}</Text>
                    <Text style={styles.timeText}>{item.endTime}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    taskCard: { backgroundColor: '#fff', padding: 15, borderRadius: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
    completedCard: { opacity: 0.6 },
    checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#007AFF', justifyContent: 'center', alignItems: 'center' },
    checkedCheckbox: { backgroundColor: '#007AFF' },
    taskTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
    completedText: { textDecorationLine: 'line-through', color: '#999' },
    badge: { backgroundColor: '#e3f2fd', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start' },
    badgeText: { fontSize: 10, color: '#007AFF', fontWeight: 'bold' },
    timeText: { fontSize: 12, color: '#999', textAlign: 'right' },
});