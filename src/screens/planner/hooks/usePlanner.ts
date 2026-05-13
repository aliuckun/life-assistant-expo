import AsyncStorage from '@react-native-async-storage/async-storage';
import { addDays, addMonths, addWeeks, format, parseISO } from 'date-fns';
import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { Task } from '../types/task';

const STORAGE_KEY = '@planner_tasks';

// Tekrarlayan görevleri üretir — başlangıç tarihinden itibaren 60 güne kadar
const generateRecurringTasks = (base: Task): Task[] => {
    if (base.recurrence === 'none' || !base.recurrenceEnd) return [base];

    const tasks: Task[] = [base];
    const endDate = parseISO(base.recurrenceEnd);
    let current = parseISO(base.date);

    for (let i = 0; i < 365; i++) {
        if (base.recurrence === 'daily') current = addDays(current, 1);
        if (base.recurrence === 'weekly') current = addWeeks(current, 1);
        if (base.recurrence === 'monthly') current = addMonths(current, 1);

        if (current > endDate) break;

        tasks.push({
            ...base,
            id: `${base.recurrenceId}_${format(current, 'yyyy-MM-dd')}`,
            date: format(current, 'yyyy-MM-dd'),
            isCompleted: false,
        });
    }

    return tasks;
};

export const usePlanner = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const isLoaded = useRef(false);

    useEffect(() => { loadTasks(); }, []);

    useEffect(() => {
        if (!isLoaded.current) return;
        saveTasks(tasks);
    }, [tasks]);

    const saveTasks = async (t: Task[]) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(t));
        } catch (e) { console.error('Kaydetme hatası', e); }
    };

    const loadTasks = async () => {
        try {
            const json = await AsyncStorage.getItem(STORAGE_KEY);
            if (json) {
                const all: Task[] = JSON.parse(json);

                // DateStrip'te görünen en eski tarih: bugünden 5 gün önce
                // (DateStrip yarından başlayarak 7 gün gösteriyor: 5 gün önce → yarın)
                // Tekrarlayan görevleri silmemek için recurrence'ı olmayanları temizle
                const cutoff = new Date();
                cutoff.setDate(cutoff.getDate() - 7); // 7 gün öncesi
                const cutoffStr = format(cutoff, 'yyyy-MM-dd');

                const cleaned = all.filter(t => {
                    // Tekrarlayan seriler: sadece bu tarihin gelecek örneklerini koru
                    // Geçmiş örnekler silinebilir
                    return t.date >= cutoffStr;
                });

                setTasks(cleaned);

                // Temizlenen veriyi kaydet
                if (cleaned.length !== all.length) {
                    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
                }
            }
        } catch (e) { console.error('Yükleme hatası', e); }
        finally { isLoaded.current = true; }
    };

    const addTask = (task: Task) => {
        const newTasks = generateRecurringTasks(task);
        setTasks(prev => [...prev, ...newTasks]);
    };

    // Sadece bu görevi güncelle (tekrarlayan serideki tek örnek)
    const updateTask = (updated: Task) => {
        setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
    };

    // Tekrarlayan serinin tüm gelecek örneklerini de güncelle
    const updateTaskSeries = (updated: Task) => {
        setTasks(prev => prev.map(t => {
            if (t.recurrenceId !== updated.recurrenceId) return t;
            if (t.date < updated.date) return t; // geçmiş örneklere dokunma
            return {
                ...t,
                title: updated.title,
                category: updated.category,
                priority: updated.priority,
                startTime: updated.startTime,
                endTime: updated.endTime,
                recurrenceEnd: updated.recurrenceEnd,
            };
        }));
    };

    const toggleTask = (id: string, onSuccess?: () => void) => {
        setTasks(prev => prev.map(t => {
            if (t.id !== id) return t;
            const newState = !t.isCompleted;
            if (newState && onSuccess) onSuccess();
            return { ...t, isCompleted: newState };
        }));
    };

    const deleteTask = (task: Task) => {
        // Tekrarlayan görevde seçenek sun
        if (task.recurrence !== 'none' && task.recurrenceId) {
            Alert.alert('Görevi Sil', 'Neyi silmek istiyorsunuz?', [
                { text: 'Vazgeç', style: 'cancel' },
                {
                    text: 'Sadece Bu Günü',
                    onPress: () => setTasks(prev => prev.filter(t => t.id !== task.id)),
                },
                {
                    text: 'Bu ve Sonraki Tüm',
                    style: 'destructive',
                    onPress: () => setTasks(prev =>
                        prev.filter(t => !(t.recurrenceId === task.recurrenceId && t.date >= task.date))
                    ),
                },
            ]);
        } else {
            Alert.alert('Görevi Sil', 'Bu görevi silmek istiyor musunuz?', [
                { text: 'Vazgeç', style: 'cancel' },
                { text: 'Sil', style: 'destructive', onPress: () => setTasks(prev => prev.filter(t => t.id !== task.id)) },
            ]);
        }
    };

    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');

    const currentDayTasks = tasks
        .filter(t => t.date === selectedDateStr)
        .sort((a, b) => {
            if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
            const order: Record<string, number> = { 'Yüksek': 1, 'Orta': 2, 'Düşük': 3 };
            return order[a.priority] - order[b.priority];
        });

    const completedCount = currentDayTasks.filter(t => t.isCompleted).length;
    const progress = currentDayTasks.length === 0 ? 0 : completedCount / currentDayTasks.length;

    return {
        tasks: currentDayTasks,
        selectedDate,
        setSelectedDate,
        addTask,
        updateTask,
        updateTaskSeries,
        toggleTask,
        deleteTask,
        progress,
    };
};