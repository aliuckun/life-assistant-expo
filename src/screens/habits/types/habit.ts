export type HabitType = 'good' | 'bad';

// daily   → günde N kez   (diş fırçala: günde 2 kez)
// weekly  → haftada N kez (spor: haftada 3 kez)
// monthly → ayda N kez    (saç kes: ayda 2 kez)
export type Frequency = 'daily' | 'weekly' | 'monthly';

export interface Habit {
    id: string;
    title: string;
    type: HabitType;
    frequency: Frequency;
    icon: string;
    color: string;

    // good → hedeflenen tekrar sayısı
    // bad  → aşılmaması gereken limit
    targetCount: number;

    // Tüm kayıtlar burada: { 'YYYY-MM-DD': count }
    // daily:   o günkü sayaç
    // weekly:  o haftaki toplam dailyLog'dan hesaplanır
    // monthly: o ayki toplam dailyLog'dan hesaplanır
    dailyLog: Record<string, number>;

    reminderTime?: string; // 'HH:mm' formatı
    createdAt: string;     // 'YYYY-MM-DD'
}

export interface HabitStatus {
    count: number;
    isCompleted: boolean;
    isOverLimit: boolean;
}
