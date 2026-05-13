export type TransactionType = 'income' | 'expense';

export interface Category {
    id: string;
    name: string;
    icon: string;
    color: string;
    budget?: number; // aylık bütçe limiti (opsiyonel)
}

export interface Transaction {
    id: string;
    type: TransactionType;
    amount: number;
    categoryId: string;
    note: string;
    date: string;      // 'YYYY-MM-DD'
    createdAt: number;
}

export interface MonthSummary {
    monthStr: string;
    label: string;
    income: number;
    expense: number;
    net: number;
}

export interface CategoryBreakdownItem {
    categoryId: string;
    name: string;
    icon: string;
    color: string;
    amount: number;
    percent: number;
    budget?: number;
}