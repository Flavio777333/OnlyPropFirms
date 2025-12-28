'use client';

import React from 'react';
import { ComparisonMatrix } from '../../components/pricing/ComparisonMatrix';
import { useComparison } from '../../contexts/ComparisonContext';

export default function ComparePage() {
    const { selectedFirmIds } = useComparison();

    return (
        <main className="container mx-auto p-4 min-h-screen">
            <h1 className="text-3xl font-bold mb-6">Firm Comparison</h1>

            {selectedFirmIds.length === 0 ? (
                <div className="text-center py-20">
                    <h2 className="text-xl mb-4">No firms selected</h2>
                    <p className="mb-4">Go back to the list and select firms to compare.</p>
                    <a href="/" className="btn btn--primary">Browse Firms</a>
                </div>
            ) : (
                <ComparisonMatrix />
            )}
        </main>
    );
}
