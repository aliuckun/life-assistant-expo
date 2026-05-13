// src/screens/goals/types/goal.ts

export interface Goal {
    id: string;
    title: string;
    description: string;
    targetCount: number;
    currentCount: number;
    unit: string;
    color: string;
    icon: string;
    completedDays: string[];          // 'YYYY-MM-DD'
    notes: Record<string, string>;    // { 'YYYY-MM-DD': 'not metni' }
    isArchived: boolean;
    archivedAt?: string;              // 'YYYY-MM-DD'
}

export interface WeeklyStats {
    completionRate: number;
    goalsCompleted: number;
    activeGoals: number;
    dayStreak: number;
}

export interface HistoryGoalDetail {
    goalId: string;
    title: string;
    icon: string;
    color: string;
    completedDays: string[];   // o haftaya ait tamamlanan günler
    targetCount: number;       // o haftanın hedef gün sayısı
}

export interface HistoryItem {
    week: string;
    completedRate: number;
    label: string;
    color: string;
    startDate: string;         // 'YYYY-MM-DD' — haftanın Pazartesi'si
    endDate: string;           // 'YYYY-MM-DD' — haftanın Pazar'ı
    goals: HistoryGoalDetail[];
}