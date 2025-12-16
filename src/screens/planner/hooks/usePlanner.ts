import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { Task } from '../types/task';

export const usePlanner = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        loadTasks();
    }, []);

    useEffect(() => {
        saveTasks(tasks);
    }, [tasks]);

    const saveTasks = async (currentTasks: Task[]) => {
        try {
            await AsyncStorage.setItem('@planner_tasks', JSON.stringify(currentTasks));
        } catch (e) {
            console.error("Kaydetme hatası", e);
        }
    };

    const loadTasks = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('@planner_tasks');
            if (jsonValue != null) setTasks(JSON.parse(jsonValue));
        } catch (e) {
            console.error("Yükleme hatası", e);
        }
    };

    const addTask = (task: Task) => {
        setTasks(prev => [...prev, task]);
    };

    const toggleTask = (id: string, onSuccess?: () => void) => {
        setTasks(prev => prev.map(task => {
            if (task.id === id) {
                const newState = !task.isCompleted;
                if (newState && onSuccess) onSuccess(); // Animasyon tetikleyici
                return { ...task, isCompleted: newState };
            }
            return task;
        }));
    };

    const deleteTask = (id: string) => {
        Alert.alert("Sil", "Bu görevi silmek istiyor musunuz?", [
            { text: "Vazgeç", style: "cancel" },
            { text: "Sil", style: "destructive", onPress: () => setTasks(prev => prev.filter(t => t.id !== id)) }
        ]);
    };

    // İstatistikler
    const currentDayTasks = tasks
        .filter(task => task.date === format(selectedDate, 'yyyy-MM-dd'))
        .sort((a, b) => {
            if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
            const priorityOrder = { 'Yüksek': 1, 'Orta': 2, 'Düşük': 3 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });

    const completedCount = currentDayTasks.filter(t => t.isCompleted).length;
    const totalCount = currentDayTasks.length;
    const progress = totalCount === 0 ? 0 : completedCount / totalCount;

    return {
        tasks: currentDayTasks, // Sadece o günün tasklarını dönüyoruz
        selectedDate,
        setSelectedDate,
        addTask,
        toggleTask,
        deleteTask,
        progress
    };
};