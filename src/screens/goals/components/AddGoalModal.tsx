// src/screens/goals/components/AddGoalModal.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert // <--- Alert eklendi
    ,

    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Goal } from '../types/goal';

interface Props {
    visible: boolean;
    onClose: () => void;
    onAdd: (goal: Omit<Goal, 'id' | 'currentCount' | 'completedDays'>) => void;
}

const COLORS = ['#1E88E5', '#43A047', '#8E24AA', '#FF6D00', '#E53935', '#00ACC1'];
const ICONS = ['dumbbell', 'book-open-variant', 'xml', 'water', 'sleep', 'run', 'meditation', 'food-apple'];

export const AddGoalModal: React.FC<Props> = ({ visible, onClose, onAdd }) => {
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [target, setTarget] = useState('');
    const [unit, setUnit] = useState('');
    const [selectedColor, setSelectedColor] = useState(COLORS[0]);
    const [selectedIcon, setSelectedIcon] = useState(ICONS[0]);

    const handleSave = () => {
        console.log("Kaydet butonuna basıldı..."); // Debug için log

        // 1. Validasyon Kontrolü
        if (!title.trim() || !target.trim() || !unit.trim()) {
            Alert.alert("Eksik Bilgi", "Lütfen Başlık, Hedef Sayısı ve Birim alanlarını doldurunuz.");
            return;
        }

        // 2. Veriyi Hazırla
        const newGoalData = {
            title: title.trim(),
            description: desc.trim(),
            targetCount: parseInt(target) || 1, // Eğer sayı çevrilemezse 1 yap
            unit: unit.trim(),
            color: selectedColor,
            icon: selectedIcon,
        };

        console.log("Gönderilecek Veri:", newGoalData);

        // 3. Fonksiyonu Çalıştır
        onAdd(newGoalData);

        // 4. Formu Temizle
        setTitle('');
        setDesc('');
        setTarget('');
        setUnit('');

        // 5. Modalı Kapat
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Yeni Hedef Ekle</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <MaterialCommunityIcons name="close" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                        <Text style={styles.label}>Hedef Başlığı *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Örn: Su İçmek"
                            value={title}
                            onChangeText={setTitle}
                        />

                        <Text style={styles.label}>Açıklama</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Örn: Günde 2 litre su"
                            value={desc}
                            onChangeText={setDesc}
                        />

                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: 10 }}>
                                <Text style={styles.label}>Hedef Sayısı *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="20"
                                    keyboardType="numeric"
                                    value={target}
                                    onChangeText={setTarget}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.label}>Birim *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="bardak/sf"
                                    value={unit}
                                    onChangeText={setUnit}
                                />
                            </View>
                        </View>

                        <Text style={styles.label}>Renk Seç</Text>
                        <View style={styles.selectionRow}>
                            {COLORS.map(color => (
                                <TouchableOpacity
                                    key={color}
                                    onPress={() => setSelectedColor(color)}
                                    style={[
                                        styles.colorCircle,
                                        { backgroundColor: color },
                                        selectedColor === color && styles.selectedRing
                                    ]}
                                />
                            ))}
                        </View>

                        <Text style={styles.label}>İkon Seç</Text>
                        <View style={styles.selectionRow}>
                            {ICONS.map(icon => (
                                <TouchableOpacity
                                    key={icon}
                                    onPress={() => setSelectedIcon(icon)}
                                    style={[
                                        styles.iconBox,
                                        selectedIcon === icon && { backgroundColor: '#E3F2FD', borderColor: '#2962FF' }
                                    ]}
                                >
                                    <MaterialCommunityIcons
                                        name={icon as any}
                                        size={24}
                                        color={selectedIcon === icon ? '#2962FF' : '#666'}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                            <Text style={styles.saveButtonText}>Hedefi Kaydet</Text>
                        </TouchableOpacity>

                        {/* Alt boşluk (klavye için güvenli alan) */}
                        <View style={{ height: 40 }} />
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    container: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, height: '85%' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    closeButton: { padding: 5 },
    title: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    label: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 8, marginTop: 12 },
    input: { backgroundColor: '#F5F7FA', padding: 12, borderRadius: 12, fontSize: 16, color: '#333', borderWidth: 1, borderColor: '#eee' },
    row: { flexDirection: 'row' },
    selectionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    colorCircle: { width: 40, height: 40, borderRadius: 20 },
    selectedRing: { borderWidth: 3, borderColor: '#fff', shadowColor: '#000', shadowOpacity: 0.3, elevation: 3 },
    iconBox: { width: 50, height: 50, borderRadius: 12, backgroundColor: '#F5F7FA', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
    saveButton: { backgroundColor: '#2962FF', padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 30 },
    saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});