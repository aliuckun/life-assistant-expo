// src/screens/goals/types.ts

export interface Goal {
    id: string;
    title: string;
    description: string;
    targetCount: number; // Örn: 20 sayfa
    currentCount: number;
    unit: string; // Örn: 'sayfa', 'dk'
    color: string;
    icon: string; // MaterialCommunityIcons adı
    completedDays: string[]; // 'YYYY-MM-DD' formatında tamamlanan günler
}

export interface WeeklyStats {
    completionRate: number;
    goalsCompleted: number;
    activeGoals: number;
    dayStreak: number;
}

export interface HistoryItem {
    week: string;        // Örn: "11 Aralık Haftası"
    completedRate: number; // Örn: 85
    label: string;       // Örn: "7 gün önce"
    color: string;       // Başarıya göre renk
}