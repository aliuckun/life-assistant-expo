import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
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
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Frequency, Habit, HabitType } from '../types/habit';

interface Props {
    visible: boolean;
    onClose: () => void;
    onAdd: (data: Omit<Habit, 'id' | 'dailyLog' | 'createdAt'>) => void;
}

const COLORS = ['#1E88E5', '#43A047', '#8E24AA', '#FF6D00', '#E53935', '#00ACC1', '#F4511E', '#6D4C41'];
const ICONS = ['water', 'run', 'dumbbell', 'book-open-variant', 'tooth', 'sleep', 'food-apple', 'cigarette-off', 'beer-off', 'phone-off', 'meditation', 'bike'];

const FREQ_OPTIONS: { value: Frequency; label: string; goodDesc: string; badDesc: string }[] = [
    { value: 'daily',   label: 'Günlük',    goodDesc: 'Günde kaç kez?',    badDesc: 'Günlük maksimum limit' },
    { value: 'weekly',  label: 'Haftalık',  goodDesc: 'Haftada kaç kez?',  badDesc: 'Haftalık maksimum limit' },
    { value: 'monthly', label: 'Aylık',     goodDesc: 'Ayda kaç kez?',     badDesc: 'Aylık maksimum limit' },
];

export const AddHabitModal: React.FC<Props> = ({ visible, onClose, onAdd }) => {
    const [title, setTitle] = useState('');
    const [type, setType] = useState<HabitType>('good');
    const [frequency, setFrequency] = useState<Frequency>('daily');
    const [targetCount, setTargetCount] = useState('1');
    const [color, setColor] = useState(COLORS[0]);
    const [icon, setIcon] = useState(ICONS[0]);

    // Saat seçici
    const [reminderTime, setReminderTime] = useState<Date | null>(null);
    const [isTimePickerVisible, setTimePickerVisible] = useState(false);

    const selectedFreq = FREQ_OPTIONS.find(f => f.value === frequency)!;
    const countLabel = type === 'good' ? selectedFreq.goodDesc : selectedFreq.badDesc;

    const handleSave = () => {
        if (!title.trim()) {
            Alert.alert('Eksik Bilgi', 'Lütfen bir başlık girin.');
            return;
        }
        const count = parseInt(targetCount);
        if (!count || count < 1) {
            Alert.alert('Geçersiz Sayı', 'Lütfen geçerli bir sayı girin.');
            return;
        }

        onAdd({
            title: title.trim(),
            type,
            frequency,
            icon,
            color,
            targetCount: count,
            reminderTime: reminderTime ? format(reminderTime, 'HH:mm') : undefined,
        });

        reset();
        onClose();
    };

    const reset = () => {
        setTitle('');
        setType('good');
        setFrequency('daily');
        setTargetCount('1');
        setColor(COLORS[0]);
        setIcon(ICONS[0]);
        setReminderTime(null);
    };

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.overlay}
            >
                <View style={styles.sheet}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Yeni Alışkanlık</Text>
                        <TouchableOpacity onPress={onClose}>
                            <MaterialCommunityIcons name="close" size={22} color="#888" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                        {/* Tür: İyi / Kötü */}
                        <Text style={styles.label}>Tür</Text>
                        <View style={styles.typeRow}>
                            {(['good', 'bad'] as HabitType[]).map(t => (
                                <TouchableOpacity
                                    key={t}
                                    style={[
                                        styles.typeBtn,
                                        type === t && {
                                            backgroundColor: t === 'good' ? '#43A047' : '#E53935',
                                            borderColor: t === 'good' ? '#43A047' : '#E53935',
                                        }
                                    ]}
                                    onPress={() => setType(t)}
                                >
                                    <Text style={[styles.typeBtnIcon]}>
                                        {t === 'good' ? '✅' : '🚫'}
                                    </Text>
                                    <Text style={[styles.typeBtnLabel, type === t && styles.typeBtnLabelActive]}>
                                        {t === 'good' ? 'Kazanma' : 'Kaybetme'}
                                    </Text>
                                    <Text style={[styles.typeBtnSub, type === t && styles.typeBtnSubActive]}>
                                        {t === 'good' ? 'Yapmaya çalış' : 'Limiti aşma'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Başlık */}
                        <Text style={styles.label}>Başlık *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder={type === 'good' ? 'Örn: Diş fırçala, Su iç' : 'Örn: Sigara, Sosyal medya'}
                            value={title}
                            onChangeText={setTitle}
                        />

                        {/* Sıklık + Hedef sayısı */}
                        <Text style={styles.label}>Sıklık ve hedef</Text>
                        {FREQ_OPTIONS.map(opt => (
                            <TouchableOpacity
                                key={opt.value}
                                style={[
                                    styles.freqCard,
                                    frequency === opt.value && {
                                        borderColor: color,
                                        backgroundColor: color + '0D',
                                    }
                                ]}
                                onPress={() => setFrequency(opt.value)}
                                activeOpacity={0.8}
                            >
                                {/* Seçim göstergesi */}
                                <View style={styles.freqRow}>
                                    <View style={[
                                        styles.radioOuter,
                                        frequency === opt.value && { borderColor: color }
                                    ]}>
                                        {frequency === opt.value && (
                                            <View style={[styles.radioInner, { backgroundColor: color }]} />
                                        )}
                                    </View>
                                    <Text style={[
                                        styles.freqLabel,
                                        frequency === opt.value && { color, fontWeight: '700' }
                                    ]}>
                                        {opt.label}
                                    </Text>
                                </View>

                                {/* Her seçeneğin altında sayı girişi */}
                                <View style={styles.countRow}>
                                    <Text style={styles.countLabel}>
                                        {type === 'good' ? opt.goodDesc : opt.badDesc}
                                    </Text>
                                    <View style={[
                                        styles.countInputWrap,
                                        frequency === opt.value && { borderColor: color }
                                    ]}>
                                        <TouchableOpacity
                                            onPress={() => {
                                                if (frequency !== opt.value) return;
                                                const v = Math.max(1, parseInt(targetCount || '1') - 1);
                                                setTargetCount(String(v));
                                            }}
                                            style={styles.countBtn}
                                        >
                                            <MaterialCommunityIcons
                                                name="minus"
                                                size={16}
                                                color={frequency === opt.value ? color : '#ccc'}
                                            />
                                        </TouchableOpacity>
                                        <TextInput
                                            style={[
                                                styles.countInput,
                                                frequency !== opt.value && styles.countInputDisabled
                                            ]}
                                            value={frequency === opt.value ? targetCount : '—'}
                                            onChangeText={v => {
                                                if (frequency !== opt.value) return;
                                                setTargetCount(v.replace(/[^0-9]/g, ''));
                                            }}
                                            keyboardType="numeric"
                                            editable={frequency === opt.value}
                                            selectTextOnFocus
                                        />
                                        <TouchableOpacity
                                            onPress={() => {
                                                if (frequency !== opt.value) return;
                                                const v = parseInt(targetCount || '1') + 1;
                                                setTargetCount(String(v));
                                            }}
                                            style={styles.countBtn}
                                        >
                                            <MaterialCommunityIcons
                                                name="plus"
                                                size={16}
                                                color={frequency === opt.value ? color : '#ccc'}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}

                        {/* Renk */}
                        <Text style={styles.label}>Renk</Text>
                        <View style={styles.colorRow}>
                            {COLORS.map(c => (
                                <TouchableOpacity
                                    key={c}
                                    onPress={() => setColor(c)}
                                    style={[
                                        styles.colorDot,
                                        { backgroundColor: c },
                                        color === c && styles.colorDotSelected,
                                    ]}
                                />
                            ))}
                        </View>

                        {/* İkon */}
                        <Text style={styles.label}>İkon</Text>
                        <View style={styles.iconRow}>
                            {ICONS.map(ic => (
                                <TouchableOpacity
                                    key={ic}
                                    onPress={() => setIcon(ic)}
                                    style={[
                                        styles.iconBox,
                                        icon === ic && { backgroundColor: color + '18', borderColor: color }
                                    ]}
                                >
                                    <MaterialCommunityIcons
                                        name={ic as any}
                                        size={22}
                                        color={icon === ic ? color : '#aaa'}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Hatırlatıcı — DateTimePicker ile */}
                        <Text style={styles.label}>Hatırlatıcı (opsiyonel)</Text>
                        <View style={styles.reminderRow}>
                            <TouchableOpacity
                                style={[
                                    styles.reminderBtn,
                                    reminderTime && { borderColor: color, backgroundColor: color + '0D' }
                                ]}
                                onPress={() => setTimePickerVisible(true)}
                            >
                                <MaterialCommunityIcons
                                    name="clock-outline"
                                    size={20}
                                    color={reminderTime ? color : '#aaa'}
                                />
                                <Text style={[
                                    styles.reminderBtnText,
                                    reminderTime && { color }
                                ]}>
                                    {reminderTime ? format(reminderTime, 'HH:mm') : 'Saat seç'}
                                </Text>
                            </TouchableOpacity>

                            {reminderTime && (
                                <TouchableOpacity
                                    style={styles.reminderClear}
                                    onPress={() => setReminderTime(null)}
                                >
                                    <MaterialCommunityIcons name="close-circle" size={20} color="#ccc" />
                                </TouchableOpacity>
                            )}
                        </View>
                        <Text style={styles.hint}>
                            * Bildirimler için: npx expo install expo-notifications
                        </Text>

                        {/* Kaydet butonu */}
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

            {/* Saat seçici */}
            <DateTimePickerModal
                isVisible={isTimePickerVisible}
                mode="time"
                onConfirm={(date) => {
                    setReminderTime(date);
                    setTimePickerVisible(false);
                }}
                onCancel={() => setTimePickerVisible(false)}
                locale="tr_TR"
                is24Hour
            />
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        maxHeight: '94%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#222' },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#777',
        marginTop: 18,
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F5F7FA',
        padding: 13,
        borderRadius: 12,
        fontSize: 15,
        color: '#333',
        borderWidth: 1,
        borderColor: '#eee',
    },
    // Tür
    typeRow: { flexDirection: 'row', gap: 10 },
    typeBtn: {
        flex: 1,
        padding: 12,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: '#eee',
        alignItems: 'center',
        gap: 2,
    },
    typeBtnIcon: { fontSize: 20 },
    typeBtnLabel: { fontSize: 14, fontWeight: '600', color: '#555' },
    typeBtnLabelActive: { color: '#fff' },
    typeBtnSub: { fontSize: 11, color: '#bbb' },
    typeBtnSubActive: { color: 'rgba(255,255,255,0.75)' },
    // Frekans kartı
    freqCard: {
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#eee',
        padding: 14,
        marginBottom: 8,
        backgroundColor: '#FAFAFA',
    },
    freqRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
    radioOuter: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 2,
        borderColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioInner: { width: 8, height: 8, borderRadius: 4 },
    freqLabel: { fontSize: 15, fontWeight: '600', color: '#555' },
    // Sayı girişi
    countRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    countLabel: { fontSize: 13, color: '#999', flex: 1 },
    countInputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#ddd',
        borderRadius: 10,
        overflow: 'hidden',
    },
    countBtn: { paddingHorizontal: 10, paddingVertical: 6 },
    countInput: {
        width: 44,
        textAlign: 'center',
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333',
        paddingVertical: 6,
    },
    countInputDisabled: { color: '#ccc' },
    // Renk
    colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    colorDot: { width: 36, height: 36, borderRadius: 18 },
    colorDotSelected: {
        borderWidth: 3,
        borderColor: '#fff',
        shadowColor: '#000',
        shadowOpacity: 0.25,
        elevation: 4,
    },
    // İkon
    iconRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#F5F7FA',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    // Hatırlatıcı
    reminderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    reminderBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 13,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#eee',
        backgroundColor: '#FAFAFA',
    },
    reminderBtnText: { fontSize: 15, color: '#aaa', fontWeight: '500' },
    reminderClear: { padding: 4 },
    hint: { fontSize: 11, color: '#ccc', marginTop: 6 },
    // Kaydet
    saveBtn: {
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 24,
    },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
