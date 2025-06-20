// This file exports utility functions that provide common functionality used throughout the application.

export const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

export const generateId = (): string => {
    return Math.random().toString(36).substr(2, 9);
};

// Add more utility functions as needed