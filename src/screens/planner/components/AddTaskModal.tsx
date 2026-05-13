/**
 * AddTaskModal.tsx
 * Hem yeni görev ekleme hem de mevcut görevi düzenleme modunda çalışır.
 * editTask prop'u verilirse edit modu aktif olur.
 */
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import React, { useEffect, useState } from 'react';
import {
    Alert, Modal, ScrollView, StyleSheet,
    Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { RecurrenceType, Task } from '../types/task';

interface Props {
    visible: boolean;
    onClose: () => void;
    onSave: (task: Task) => void;
    onUpdate?: (task: Task) => void;
    onUpdateSeries?: (task: Task) => void;
    selectedDate: Date;
    editTask?: Task | null; // verilirse edit modu
}

const CATEGORIES = ['İş', 'Okul', 'Kişisel', 'Spor'];
const PRIORITIES = ['Yüksek', 'Orta', 'Düşük'];
const RECURRENCES: { key: RecurrenceType; label: string }[] = [
    { key: 'none', label: 'Tekrarsız' },
    { key: 'daily', label: 'Her Gün' },
    { key: 'weekly', label: 'Her Hafta' },
    { key: 'monthly', label: 'Her Ay' },
];

const PRIORITY_COLOR: Record<string, string> = {
    'Yüksek': '#E53935',
    'Orta': '#FB8C00',
    'Düşük': '#43A047',
};

export const AddTaskModal = ({
    visible, onClose, onSave, onUpdate, onUpdateSeries,
    selectedDate, editTask,
}: Props) => {
    const isEdit = !!editTask;

    const [title, setTitle] = useState('');
    const [category, setCategory] = useState(CATEGORIES[2]);
    const [priority, setPriority] = useState(PRIORITIES[1]);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [endTime, setEndTime] = useState<Date | null>(null);
    const [taskDate, setTaskDate] = useState<Date>(selectedDate);
    const [recurrence, setRecurrence] = useState<RecurrenceType>('none');
    const [recEnd, setRecEnd] = useState<Date | null>(null);

    const [showStart, setShowStart] = useState(false);
    const [showEnd, setShowEnd] = useState(false);
    const [showDate, setShowDate] = useState(false);
    const [showRecEnd, setShowRecEnd] = useState(false);

    // Modal açılışında formu doldur
    useEffect(() => {
        if (!visible) return;

        if (isEdit && editTask) {
            setTitle(editTask.title);
            setCategory(editTask.category);
            setPriority(editTask.priority);
            setTaskDate(parseISO(editTask.date));
            setRecurrence(editTask.recurrence ?? 'none');
            setRecEnd(editTask.recurrenceEnd ? parseISO(editTask.recurrenceEnd) : null);

            // Saatleri Date nesnesine çevir
            const toTimeDate = (str: string) => {
                if (!str || str === '--:--') return null;
                const [h, m] = str.split(':').map(Number);
                const d = new Date();
                d.setHours(h, m, 0, 0);
                return d;
            };
            setStartTime(toTimeDate(editTask.startTime));
            setEndTime(toTimeDate(editTask.endTime));
        } else {
            resetForm();
            setTaskDate(selectedDate);
        }
    }, [visible, editTask]);

    const resetForm = () => {
        setTitle('');
        setCategory(CATEGORIES[2]);
        setPriority(PRIORITIES[1]);
        setStartTime(null);
        setEndTime(null);
        setRecurrence('none');
        setRecEnd(null);
    };

    const buildTask = (): Task => ({
        id: isEdit ? editTask!.id : Date.now().toString(),
        title: title.trim(),
        category: category as Task['category'],
        priority: priority as Task['priority'],
        startTime: startTime ? format(startTime, 'HH:mm') : '--:--',
        endTime: endTime ? format(endTime, 'HH:mm') : '--:--',
        isCompleted: isEdit ? editTask!.isCompleted : false,
        date: format(taskDate, 'yyyy-MM-dd'),
        recurrence,
        recurrenceId: isEdit
            ? editTask!.recurrenceId
            : (recurrence !== 'none' ? `rec_${Date.now()}` : undefined),
        recurrenceEnd: recurrence !== 'none' && recEnd
            ? format(recEnd, 'yyyy-MM-dd')
            : undefined,
    });

    const handleSave = () => {
        if (!title.trim()) { Alert.alert('Uyarı', 'Başlık giriniz.'); return; }
        if (recurrence !== 'none' && !recEnd) { Alert.alert('Uyarı', 'Tekrar bitiş tarihi seçiniz.'); return; }

        const task = buildTask();

        if (isEdit && editTask) {
            // Tekrarlayan görevse kullanıcıya sor
            if (editTask.recurrence !== 'none' && editTask.recurrenceId) {
                Alert.alert('Görevi Düzenle', 'Ne kadarını güncellemek istiyorsunuz?', [
                    { text: 'Vazgeç', style: 'cancel' },
                    { text: 'Sadece Bu Günü', onPress: () => { onUpdate?.(task); close(); } },
                    { text: 'Bu ve Sonraki Tüm', onPress: () => { onUpdateSeries?.(task); close(); } },
                ]);
                return;
            }
            onUpdate?.(task);
        } else {
            onSave(task);
        }
        close();
    };

    const close = () => { resetForm(); onClose(); };

    const dateDisplay = format(taskDate, 'd MMMM yyyy', { locale: tr });
    const recEndDisplay = recEnd ? format(recEnd, 'd MMMM yyyy', { locale: tr }) : 'Seç';

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
                <Text style={styles.modalTitle}>
                    {isEdit ? '✏️ Görevi Düzenle' : '➕ Yeni Görev'}
                </Text>

                {/* Başlık */}
                <Text style={styles.label}>Başlık</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Örn: Almanca Çalış"
                    value={title}
                    onChangeText={setTitle}
                />

                {/* Tarih */}
                <Text style={styles.label}>Tarih</Text>
                <TouchableOpacity style={styles.selectBtn} onPress={() => setShowDate(true)}>
                    <Text style={styles.selectBtnText}>📅 {dateDisplay}</Text>
                </TouchableOpacity>

                {/* Kategori */}
                <Text style={styles.label}>Kategori</Text>
                <View style={styles.chipRow}>
                    {CATEGORIES.map(c => (
                        <TouchableOpacity
                            key={c}
                            style={[styles.chip, category === c && styles.chipActive]}
                            onPress={() => setCategory(c)}
                        >
                            <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{c}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Öncelik */}
                <Text style={styles.label}>Öncelik</Text>
                <View style={styles.chipRow}>
                    {PRIORITIES.map(p => (
                        <TouchableOpacity
                            key={p}
                            style={[
                                styles.chip,
                                priority === p && { backgroundColor: PRIORITY_COLOR[p], borderColor: PRIORITY_COLOR[p] },
                            ]}
                            onPress={() => setPriority(p)}
                        >
                            <Text style={[styles.chipText, priority === p && styles.chipTextActive]}>{p}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Saat */}
                <Text style={styles.label}>Saat</Text>
                <View style={styles.chipRow}>
                    <TouchableOpacity style={[styles.timeBtn, { flex: 1 }]} onPress={() => setShowStart(true)}>
                        <Text style={styles.timeBtnText}>
                            🕐 {startTime ? format(startTime, 'HH:mm') : 'Başlangıç'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.timeBtn, { flex: 1 }]} onPress={() => setShowEnd(true)}>
                        <Text style={styles.timeBtnText}>
                            🕐 {endTime ? format(endTime, 'HH:mm') : 'Bitiş'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Tekrar */}
                <Text style={styles.label}>Tekrar</Text>
                <View style={styles.chipRow}>
                    {RECURRENCES.map(r => (
                        <TouchableOpacity
                            key={r.key}
                            style={[styles.chip, recurrence === r.key && styles.chipActive]}
                            onPress={() => setRecurrence(r.key)}
                        >
                            <Text style={[styles.chipText, recurrence === r.key && styles.chipTextActive]}>
                                {r.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Tekrar bitiş tarihi — sadece tekrar seçiliyse */}
                {recurrence !== 'none' && (
                    <>
                        <Text style={styles.label}>Tekrar Bitiş Tarihi</Text>
                        <TouchableOpacity style={styles.selectBtn} onPress={() => setShowRecEnd(true)}>
                            <Text style={styles.selectBtnText}>🔁 {recEndDisplay}</Text>
                        </TouchableOpacity>
                    </>
                )}

                {/* Butonlar */}
                <View style={[styles.chipRow, { marginTop: 32, marginBottom: 40 }]}>
                    <TouchableOpacity style={[styles.actionBtn, styles.cancelBtn]} onPress={close}>
                        <Text style={styles.cancelBtnText}>İptal</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, styles.saveBtn]} onPress={handleSave}>
                        <Text style={styles.saveBtnText}>{isEdit ? 'Güncelle' : 'Kaydet'}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Pickers */}
            <DateTimePickerModal isVisible={showStart} mode="time"
                onConfirm={d => { setStartTime(d); setShowStart(false); }}
                onCancel={() => setShowStart(false)} />
            <DateTimePickerModal isVisible={showEnd} mode="time"
                onConfirm={d => { setEndTime(d); setShowEnd(false); }}
                onCancel={() => setShowEnd(false)} />
            <DateTimePickerModal isVisible={showDate} mode="date" date={taskDate}
                onConfirm={d => { setTaskDate(d); setShowDate(false); }}
                onCancel={() => setShowDate(false)} locale="tr" />
            <DateTimePickerModal isVisible={showRecEnd} mode="date"
                date={recEnd ?? taskDate}
                minimumDate={taskDate}
                onConfirm={d => { setRecEnd(d); setShowRecEnd(false); }}
                onCancel={() => setShowRecEnd(false)} locale="tr" />
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, paddingTop: 50 },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#222', marginBottom: 24, textAlign: 'center' },
    label: { fontSize: 13, fontWeight: '700', color: '#888', marginTop: 18, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
    input: { backgroundColor: '#f5f5f5', padding: 14, borderRadius: 12, fontSize: 15, color: '#333' },
    selectBtn: { backgroundColor: '#f5f5f5', padding: 14, borderRadius: 12, alignItems: 'center' },
    selectBtnText: { fontSize: 15, fontWeight: '500', color: '#333' },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#e0e0e0', backgroundColor: '#fff' },
    chipActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
    chipText: { fontSize: 13, color: '#666', fontWeight: '500' },
    chipTextActive: { color: '#fff', fontWeight: '600' },
    timeBtn: { backgroundColor: '#f5f5f5', padding: 14, borderRadius: 12, alignItems: 'center' },
    timeBtnText: { fontSize: 14, color: '#444' },
    actionBtn: { flex: 1, padding: 15, borderRadius: 14, alignItems: 'center' },
    cancelBtn: { backgroundColor: '#f0f0f0' },
    cancelBtnText: { color: '#666', fontWeight: '600', fontSize: 15 },
    saveBtn: { backgroundColor: '#007AFF' },
    saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});