import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import React, { useRef, useState } from 'react';
import {
    FlatList, SafeAreaView, StatusBar,
    StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { Colors, rs } from '../../styles';
import { AddTaskModal } from './components/AddTaskModal';
import { DateStrip } from './components/DateStrip';
import { ProgressBar } from './components/ProgressBar';
import { TaskItem } from './components/TaskItem';
import { usePlanner } from './hooks/usePlanner';
import { Task } from './types/task';

export default function PlannerScreen() {
    const {
        tasks, selectedDate, setSelectedDate,
        addTask, updateTask, updateTaskSeries,
        toggleTask, deleteTask, progress,
    } = usePlanner();

    const [modalVisible, setModalVisible] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const confettiRef = useRef<LottieView>(null);

    const handleTaskToggle = (id: string) => {
        toggleTask(id, () => {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 1400);
        });
    };

    const handleEdit = (task: Task) => {
        setEditingTask(task);
        setModalVisible(true);
    };

    const handleClose = () => {
        setModalVisible(false);
        setEditingTask(null);
    };

    const completedCount = tasks.filter(t => t.isCompleted).length;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

            {/* Konfeti */}
            {showConfetti && (
                <View style={styles.lottie} pointerEvents="none">
                    <LottieView
                        ref={confettiRef}
                        source={require('../../assets/confetti.json')}
                        autoPlay loop={false}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                    />
                </View>
            )}

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Planlayıcı</Text>
                    <Text style={styles.headerSub}>
                        {tasks.length === 0
                            ? 'Bugün için plan yok'
                            : `${completedCount}/${tasks.length} tamamlandı`}
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => { setEditingTask(null); setModalVisible(true); }}
                >
                    <Ionicons name="add" size={rs(24)} color="#fff" />
                </TouchableOpacity>
            </View>

            <DateStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} />

            <ProgressBar
                progress={progress}
                completed={completedCount}
                total={tasks.length}
            />

            <FlatList
                data={tasks}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <MaterialCommunityIcons name="calendar-check-outline" size={rs(56)} color="#e0e0e0" />
                        <Text style={styles.emptyTitle}>Görev yok</Text>
                        <Text style={styles.emptySub}>
                            Sağ üstteki + ile yeni görev ekle
                        </Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <TaskItem
                        item={item}
                        onToggle={() => handleTaskToggle(item.id)}
                        onLongPress={() => deleteTask(item)}
                        onEdit={() => handleEdit(item)}
                    />
                )}
            />

            <AddTaskModal
                visible={modalVisible}
                onClose={handleClose}
                onSave={addTask}
                onUpdate={updateTask}
                onUpdateSeries={updateTaskSeries}
                selectedDate={selectedDate}
                editTask={editingTask}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    lottie: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 999, elevation: 999,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: rs(20),
        paddingTop: rs(14),
        paddingBottom: rs(8),
    },
    headerTitle: {
        fontSize: rs(26),
        fontWeight: '800',
        color: '#222',
        letterSpacing: -0.5,
    },
    headerSub: {
        fontSize: rs(12),
        color: Colors.textLight,
        marginTop: rs(2),
    },
    addBtn: {
        width: rs(44),
        height: rs(44),
        borderRadius: rs(22),
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Colors.primary,
        shadowOpacity: 0.35,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
        elevation: 5,
    },
    list: {
        paddingHorizontal: rs(16),
        paddingBottom: rs(100),
        paddingTop: rs(4),
    },
    empty: {
        alignItems: 'center',
        marginTop: rs(60),
        gap: rs(10),
    },
    emptyTitle: {
        fontSize: rs(17),
        fontWeight: '700',
        color: Colors.textFaint,
    },
    emptySub: {
        fontSize: rs(13),
        color: Colors.textLight,
        textAlign: 'center',
        lineHeight: rs(20),
    },
});