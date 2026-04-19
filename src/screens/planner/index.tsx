import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import React, { useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AddTaskModal } from './components/AddTaskModal';
import { DateStrip } from './components/DateStrip';
import { ProgressBar } from './components/ProgressBar';
import { TaskItem } from './components/TaskItem';
import { usePlanner } from './hooks/usePlanner';

export default function PlannerScreen() {
    const {
        tasks, selectedDate, setSelectedDate,
        addTask, toggleTask, deleteTask, progress
    } = usePlanner();

    const [modalVisible, setModalVisible] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const confettiRef = useRef<LottieView>(null); // ref artık LottieView'a bağlı

    const handleTaskToggle = (id: string) => {
        toggleTask(id, () => {
            setShowConfetti(true);
            setTimeout(() => {
                setShowConfetti(false);
            }, 1400);
        });
    };

    return (
        <View style={styles.container}>

            {showConfetti && (
                <View style={styles.lottieContainer} pointerEvents="none">
                    <LottieView
                        ref={confettiRef}
                        source={require('../../assets/confetti.json')}
                        autoPlay={true}
                        loop={false}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                    />
                </View>
            )}

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Planlayıcı</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
                    <Ionicons name="add" size={30} color="#fff" />
                </TouchableOpacity>
            </View>

            <DateStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} />

            <ProgressBar progress={progress} />

            <FlatList
                data={tasks}
                keyExtractor={item => item.id}
                contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="calendar-outline" size={50} color="#ccc" />
                        <Text style={{ color: '#999', marginTop: 10 }}>Bugün için plan yok.</Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <TaskItem
                        item={item}
                        onToggle={() => handleTaskToggle(item.id)}
                        onLongPress={() => deleteTask(item.id)}
                    />
                )}
            />

            <AddTaskModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSave={addTask}
                selectedDate={selectedDate}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa', paddingTop: 50 },
    lottieContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999, elevation: 999 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 10 },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#333' },
    addButton: { backgroundColor: '#007AFF', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    emptyContainer: { alignItems: 'center', marginTop: 50 },
});
