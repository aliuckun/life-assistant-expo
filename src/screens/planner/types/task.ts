export interface Task {
    id: string;
    title: string;
    category: 'İş' | 'Okul' | 'Kişisel' | 'Spor';
    priority: 'Yüksek' | 'Orta' | 'Düşük';
    startTime: string;
    endTime: string;
    isCompleted: boolean;
    date: string;
}