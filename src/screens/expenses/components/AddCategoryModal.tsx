import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Category } from '../types/expense';

interface Props {
    visible: boolean;
    onClose: () => void;
    onAdd: (data: Omit<Category, 'id'>) => void;
}

const COLORS = [
    '#1E88E5', '#43A047', '#8E24AA', '#FF6D00',
    '#E53935', '#00ACC1', '#F4511E', '#6D4C41',
    '#039BE5', '#00897B', '#7CB342', '#FFB300',
];

const ICONS = [
    'cart', 'home', 'car', 'silverware-fork-knife',
    'tshirt-crew', 'medical-bag', 'school', 'airplane',
    'gamepad-variant', 'music', 'dog', 'gift',
    'lightning-bolt', 'phone', 'wifi', 'movie-open',
    'dumbbell', 'bus', 'fuel', 'coffee',
];

export const AddCategoryModal: React.FC<Props> = ({ visible, onClose, onAdd }) => {
    const [name, setName] = useState('');
    const [color, setColor] = useState(COLORS[0]);
    const [icon, setIcon] = useState(ICONS[0]);

    const handleSave = () => {
        if (!name.trim()) {
            Alert.alert('Eksik Bilgi', 'Lütfen kategori adı girin.');
            return;
        }
        onAdd({ name: name.trim(), color, icon });
        setName('');
        setColor(COLORS[0]);
        setIcon(ICONS[0]);
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.overlay}
            >
                <View style={styles.sheet}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Yeni Kategori</Text>
                        <TouchableOpacity onPress={onClose}>
                            <MaterialCommunityIcons name="close" size={22} color="#888" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                        <Text style={styles.label}>Kategori Adı *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Örn: Market, Fatura, Kira"
                            value={name}
                            onChangeText={setName}
                            autoFocus
                        />

                        <Text style={styles.label}>Renk</Text>
                        <View style={styles.colorRow}>
                            {COLORS.map(c => (
                                <TouchableOpacity
                                    key={c}
                                    style={[styles.colorDot, { backgroundColor: c }, color === c && styles.colorDotSelected]}
                                    onPress={() => setColor(c)}
                                />
                            ))}
                        </View>

                        <Text style={styles.label}>İkon</Text>
                        <View style={styles.iconRow}>
                            {ICONS.map(ic => (
                                <TouchableOpacity
                                    key={ic}
                                    style={[styles.iconBox, icon === ic && { backgroundColor: color + '18', borderColor: color }]}
                                    onPress={() => setIcon(ic)}
                                >
                                    <MaterialCommunityIcons
                                        name={ic as any}
                                        size={22}
                                        color={icon === ic ? color : '#aaa'}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity
                            style={[styles.saveBtn, { backgroundColor: color }]}
                            onPress={handleSave}
                        >
                            <Text style={styles.saveBtnText}>Kaydet</Text>
                        </TouchableOpacity>
                        <View style={{ height: 40 }} />
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
    sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '85%' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#222' },
    label: { fontSize: 13, fontWeight: '600', color: '#777', marginTop: 16, marginBottom: 8 },
    input: { backgroundColor: '#F5F7FA', padding: 13, borderRadius: 12, fontSize: 15, color: '#333', borderWidth: 1, borderColor: '#eee' },
    colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    colorDot: { width: 36, height: 36, borderRadius: 18 },
    colorDotSelected: { borderWidth: 3, borderColor: '#fff', shadowColor: '#000', shadowOpacity: 0.25, elevation: 4 },
    iconRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    iconBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#F5F7FA', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
    saveBtn: { padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 24 },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
