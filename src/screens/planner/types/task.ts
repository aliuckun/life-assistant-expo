export type TaskCategory = 'İş' | 'Okul' | 'Kişisel' | 'Spor' | 'Borsa';
export type TaskPriority = 'Yüksek' | 'Orta' | 'Düşük';
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly';

export interface Task {
    id: string;
    title: string;
    category: TaskCategory;
    priority: TaskPriority;
    startTime: string;
    endTime: string;
    isCompleted: boolean;
    date: string; // 'YYYY-MM-DD'

    // Tekrarlayan görev alanları
    recurrence: RecurrenceType;
    recurrenceId?: string;   // aynı seriden gelen görevleri gruplar
    recurrenceEnd?: string;  // 'YYYY-MM-DD' — tekrarın biteceği tarih
}