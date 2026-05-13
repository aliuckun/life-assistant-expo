/**
 * GoalNoteModal.tsx
 * Seçili güne not ekleme/düzenleme modalı.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    KeyboardAvoidingView, Modal, Platform,
    StyleSheet, Text, TextInput,
    TouchableOpacity, View,
} from 'react-native';
import { Colors, rs } from '../../../styles';
import { Goal } from '../types/goal';

const MONTHS_TR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

interface Props {
    visible: boolean;
    onClose: () => void;
    onSave: (note: string) => void;
    goal: Goal | null;
    date: string; // 'YYYY-MM-DD'
    existingNote?: string;
}

export const GoalNoteModal = ({ visible, onClose, onSave, goal, date, existingNote }: Props) => {
    const [note, setNote] = useState('');

    useEffect(() => {
        if (visible) setNote(existingNote ?? '');
    }, [visible, existingNote]);

    if (!goal) return null;

    const [y, m, d] = date.split('-').map(Number);
    const dateLabel = `${d} ${MONTHS_TR[m - 1]} ${y}`;

    const handleSave = () => {
        onSave(note);
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" transparent={false}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* Handle */}
                <View style={styles.handle} />

                {/* Başlık */}
                <View style={styles.header}>
                    <View style={[styles.iconBg, { backgroundColor: goal.color + '22' }]}>
                        <MaterialCommunityIcons name={goal.icon as any} size={rs(22)} color={goal.color} />
                    </View>
                    <View style={styles.headerText}>
                        <Text style={styles.title}>{goal.title}</Text>
                        <Text style={styles.dateLabel}>{dateLabel}</Text>
                    </View>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <MaterialCommunityIcons name="close" size={rs(22)} color={Colors.textLight} />
                    </TouchableOpacity>
                </View>

                {/* Not alanı */}
                <View style={styles.inputWrap}>
                    <TextInput
                        style={styles.input}
                        placeholder="Bugün için bir not ekle..."
                        placeholderTextColor={Colors.textFaint}
                        value={note}
                        onChangeText={setNote}
                        multiline
                        autoFocus
                        maxLength={500}
                    />
                    <Text style={styles.charCount}>{note.length}/500</Text>
                </View>

                {/* Butonlar */}
                <View style={styles.btnRow}>
                    {existingNote ? (
                        <TouchableOpacity
                            style={[styles.btn, styles.deleteBtn]}
                            onPress={() => { onSave(''); onClose(); }}
                        >
                            <MaterialCommunityIcons name="trash-can-outline" size={rs(16)} color={Colors.danger} />
                            <Text style={[styles.btnText, { color: Colors.danger }]}>Notu Sil</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={onClose}>
                            <Text style={[styles.btnText, { color: Colors.textLight }]}>İptal</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={[styles.btn, styles.saveBtn, { backgroundColor: goal.color }]}
                        onPress={handleSave}
                    >
                        <Text style={[styles.btnText, { color: '#fff' }]}>Kaydet</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    handle: {
        width: rs(36), height: rs(4),
        backgroundColor: '#ddd',
        borderRadius: rs(2),
        alignSelf: 'center',
        marginTop: rs(12),
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: rs(20),
        gap: rs(12),
        backgroundColor: Colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.divider,
    },
    iconBg: {
        width: rs(42), height: rs(42),
        borderRadius: rs(12),
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerText: { flex: 1 },
    title: { fontSize: rs(16), fontWeight: '700', color: Colors.textPrimary },
    dateLabel: { fontSize: rs(12), color: Colors.textLight, marginTop: rs(2) },
    closeBtn: { padding: rs(4) },

    inputWrap: {
        flex: 1,
        margin: rs(20),
        backgroundColor: Colors.surface,
        borderRadius: rs(16),
        padding: rs(16),
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowOffset: { width: 0, height: 1 },
        elevation: 2,
    },
    input: {
        flex: 1,
        fontSize: rs(15),
        color: Colors.textPrimary,
        lineHeight: rs(22),
        textAlignVertical: 'top',
    },
    charCount: {
        fontSize: rs(11),
        color: Colors.textFaint,
        textAlign: 'right',
        marginTop: rs(8),
    },

    btnRow: {
        flexDirection: 'row',
        gap: rs(10),
        paddingHorizontal: rs(20),
        paddingBottom: rs(40),
    },
    btn: {
        flex: 1,
        paddingVertical: rs(14),
        borderRadius: rs(14),
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: rs(6),
    },
    cancelBtn: { backgroundColor: '#f0f0f0' },
    deleteBtn: { backgroundColor: '#FFEBEE' },
    saveBtn: {},
    btnText: { fontSize: rs(15), fontWeight: '600' },
});