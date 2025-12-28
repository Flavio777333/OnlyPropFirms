import React, { useEffect, useState } from 'react';
import { Pricing } from '../../types/pricing';
import { pricingService } from '../../services/pricingService';
import { useComparison } from '../../contexts/ComparisonContext';

interface ComparisonGroup {
    accountSize: number;
    firms: { [firmId: string]: Pricing };
    bestValueFirmId?: string;
}

export const ComparisonMatrix: React.FC = () => {
    const { selectedFirmIds } = useComparison();
    const [comparisonData, setComparisonData] = useState<ComparisonGroup[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            if (selectedFirmIds.length === 0) return;

            setLoading(true);
            try {
                // We'll add this method to pricingService next
                const data = await pricingService.compareFirms(selectedFirmIds);
                setComparisonData(data);
            } catch (err: any) {
                setError(err.message || 'Failed to load comparison');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedFirmIds]);

    if (selectedFirmIds.length === 0) {
        return <div className="text-center p-8">Select firms to compare.</div>;
    }

    if (loading) return <div>Loading comparison...</div>;
    if (error) return <div className="text-error">{error}</div>;

    return (
        <div className="comparison-matrix overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr>
                        <th className="p-4 text-left border-b">Metric</th>
                        {selectedFirmIds.map(id => (
                            <th key={id} className="p-4 text-center border-b font-bold capitalize">
                                {comparisonData[0]?.firms[id]?.propFirmName || id}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {comparisonData.map((group) => (
                        <React.Fragment key={group.accountSize}>
                            <tr className="bg-gray-100">
                                <td colSpan={selectedFirmIds.length + 1} className="p-2 font-bold text-center">
                                    {group.accountSize.toLocaleString()} Account
                                </td>
                            </tr>

                            {/* Advertised Price */}
                            <tr>
                                <td className="p-3 border-b border-r font-medium">Advertised Price</td>
                                {selectedFirmIds.map(id => {
                                    const firm = group.firms[id];
                                    return (
                                        <td key={id} className="p-3 border-b text-center">
                                            {firm ? (
                                                <>
                                                    {firm.currentPrice} {firm.priceCurrency}
                                                    {firm.discountPercent > 0 && <span className="text-green-600 text-sm ml-1">(-{firm.discountPercent}%)</span>}
                                                </>
                                            ) : '-'}
                                        </td>
                                    );
                                })}
                            </tr>

                            {/* True Cost */}
                            <tr>
                                <td className="p-3 border-b border-r font-medium">True Cost</td>
                                {selectedFirmIds.map(id => {
                                    const firm = group.firms[id];
                                    const isBest = group.bestValueFirmId === id;
                                    return (
                                        <td key={id} className={`p-3 border-b text-center ${isBest ? 'bg-green-50' : ''}`}>
                                            {firm?.trueCost ? (
                                                <span className={`font-bold ${isBest ? 'text-green-700' : 'text-gray-900'}`}>
                                                    {firm.trueCost} {firm.priceCurrency}
                                                </span>
                                            ) : '-'}
                                        </td>
                                    );
                                })}
                            </tr>

                            {/* Breakdown */}
                            <tr>
                                <td className="p-3 border-b border-r font-medium text-sm text-gray-500">Fees Breakdown</td>
                                {selectedFirmIds.map(id => {
                                    const firm = group.firms[id];
                                    if (!firm) return <td key={id} className="p-3 border-b"></td>;
                                    return (
                                        <td key={id} className="p-3 border-b text-center text-xs text-gray-500">
                                            Act: {firm.activationFee || 0} | Data: {firm.monthlyDataFee || 0}
                                        </td>
                                    );
                                })}
                            </tr>

                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
