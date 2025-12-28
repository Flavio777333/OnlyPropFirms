import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface ComparisonContextType {
    selectedFirmIds: string[];
    addFirm: (firmId: string) => void;
    removeFirm: (firmId: string) => void;
    clearComparison: () => void;
    isComparisonFull: boolean;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

const MAX_COMPARISON_ITEMS = 4;

export const ComparisonProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [selectedFirmIds, setSelectedFirmIds] = useState<string[]>([]);

    // Load from local storage on mount
    useEffect(() => {
        const stored = localStorage.getItem('comparison_firms');
        if (stored) {
            try {
                setSelectedFirmIds(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse comparison state', e);
            }
        }
    }, []);

    // Save to local storage on change
    useEffect(() => {
        localStorage.setItem('comparison_firms', JSON.stringify(selectedFirmIds));
    }, [selectedFirmIds]);

    const addFirm = (firmId: string) => {
        if (selectedFirmIds.length < MAX_COMPARISON_ITEMS && !selectedFirmIds.includes(firmId)) {
            setSelectedFirmIds(prev => [...prev, firmId]);
        }
    };

    const removeFirm = (firmId: string) => {
        setSelectedFirmIds(prev => prev.filter(id => id !== firmId));
    };

    const clearComparison = () => {
        setSelectedFirmIds([]);
    };

    const isComparisonFull = selectedFirmIds.length >= MAX_COMPARISON_ITEMS;

    return (
        <ComparisonContext.Provider value={{ selectedFirmIds, addFirm, removeFirm, clearComparison, isComparisonFull }}>
            {children}
        </ComparisonContext.Provider>
    );
};

export const useComparison = () => {
    const context = useContext(ComparisonContext);
    if (!context) {
        throw new Error('useComparison must be used within a ComparisonProvider');
    }
    return context;
};
