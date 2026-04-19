export type TransactionType = 'income' | 'expense';

export interface Category {
    id: string;
    name: string;
    icon: string;
    color: string;
}

export interface Transaction {
    id: string;
    type: TransactionType;
    amount: number;
    categoryId: string;
    note: string;
    date: string;      // 'YYYY-MM-DD'
    createdAt: number; // timestamp — sıralama için
}

export interface MonthSummary {
    monthStr: string;  // 'YYYY-MM'
    label: string;     // 'Nisan 2025'
    income: number;
    expense: number;
    net: number;
}
