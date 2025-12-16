import { format } from 'date-fns';
import React, { useState } from 'react';
import { Alert, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Task } from '../types/task';

interface AddTaskModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (task: Task) => void;
    selectedDate: Date;
}

const CATEGORIES = ['İş', 'Okul', 'Kişisel', 'Spor'];
const PRIORITIES = ['Yüksek', 'Orta', 'Düşük'];

export const AddTaskModal = ({ visible, onClose, onSave, selectedDate }: AddTaskModalProps) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState(CATEGORIES[2]);
    const [priority, setPriority] = useState(PRIORITIES[1]);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [endTime, setEndTime] = useState<Date | null>(null);
    const [isStartVisible, setStartVisible] = useState(false);
    const [isEndVisible, setEndVisible] = useState(false);

    const handleSave = () => {
        if (!title.trim()) {
            Alert.alert("Uyarı", "Başlık giriniz.");
            return;
        }
        const newTask: Task = {
            id: Date.now().toString(),
            title,
            category: category as any,
            priority: priority as any,
            startTime: startTime ? format(startTime, 'HH:mm') : '--:--',
            endTime: endTime ? format(endTime, 'HH:mm') : '--:--',
            isCompleted: false,
            date: format(selectedDate, 'yyyy-MM-dd'),
        };
        onSave(newTask);
        resetForm();
        onClose();
    };

    const resetForm = () => {
        setTitle('');
        setStartTime(null);
        setEndTime(null);
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <View style={styles.container}>
                <Text style={styles.title}>Yeni Görev Ekle</Text>

                <Text style={styles.label}>Başlık</Text>
                <TextInput style={styles.input} placeholder="Örn: Almanca Çalış" value={title} onChangeText={setTitle} />

                <Text style={styles.label}>Kategori</Text>
                <View style={styles.row}>
                    {CATEGORIES.map(c => (
                        <TouchableOpacity key={c} style={[styles.tag, category === c && styles.selectedTag]} onPress={() => setCategory(c)}>
                            <Text style={[styles.tagText, category === c && styles.selectedTagText]}>{c}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.label}>Öncelik</Text>
                <View style={styles.row}>
                    {PRIORITIES.map(p => (
                        <TouchableOpacity key={p} style={[styles.tag, priority === p && styles.selectedTag]} onPress={() => setPriority(p as any)}>
                            <Text style={[styles.tagText, priority === p && styles.selectedTagText]}>{p}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={[styles.row, { marginTop: 20 }]}>
                    <TouchableOpacity style={styles.timeBtn} onPress={() => setStartVisible(true)}>
                        <Text>Başlangıç: {startTime ? format(startTime, 'HH:mm') : 'Seç'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.timeBtn} onPress={() => setEndVisible(true)}>
                        <Text>Bitiş: {endTime ? format(endTime, 'HH:mm') : 'Seç'}</Text>
                    </TouchableOpacity>
                </View>

                <View style={[styles.row, { marginTop: 40 }]}>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#ccc' }]} onPress={onClose}>
                        <Text style={styles.btnText}>İptal</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#007AFF' }]} onPress={handleSave}>
                        <Text style={styles.btnText}>Kaydet</Text>
                    </TouchableOpacity>
                </View>

                <DateTimePickerModal isVisible={isStartVisible} mode="time" onConfirm={(d) => { setStartTime(d); setStartVisible(false) }} onCancel={() => setStartVisible(false)} />
                <DateTimePickerModal isVisible={isEndVisible} mode="time" onConfirm={(d) => { setEndTime(d); setEndVisible(false) }} onCancel={() => setEndVisible(false)} />
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, paddingTop: 50 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    label: { fontSize: 16, fontWeight: '600', marginBottom: 10, marginTop: 10 },
    input: { backgroundColor: '#f0f0f0', padding: 15, borderRadius: 12 },
    row: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
    tag: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#ddd' },
    selectedTag: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
    tagText: { color: '#666' },
    selectedTagText: { color: '#fff' },
    timeBtn: { flex: 1, backgroundColor: '#f0f0f0', padding: 15, borderRadius: 12, alignItems: 'center' },
    actionBtn: { flex: 1, padding: 15, borderRadius: 12, alignItems: 'center' },
    btnText: { color: '#fff', fontWeight: 'bold' }
});