import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setMinFunding, setPlatform, resetFilters } from '@/store/features/filters/filterSlice';

const FilterSidebar: React.FC = () => {
    const dispatch = useAppDispatch();
    const filters = useAppSelector((state) => state.filters);

    const handleMinFundingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value ? Number(e.target.value) : null;
        dispatch(setMinFunding(value));
    };

    const handlePlatformChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value || null;
        dispatch(setPlatform(value));
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border dark:border-gray-700 h-fit">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Filters</h2>
                <button
                    onClick={() => dispatch(resetFilters())}
                    className="text-sm text-blue-600 hover:text-blue-800"
                >
                    Reset
                </button>
            </div>

            <div className="space-y-4">
                {/* Min Funding Filter */}
                <div>
                    <label className="block text-sm font-medium mb-1">Min Funding</label>
                    <select
                        value={filters.minFunding || ''}
                        onChange={handleMinFundingChange}
                        className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-600"
                    >
                        <option value="">Any</option>
                        <option value="10000">$10,000</option>
                        <option value="25000">$25,000</option>
                        <option value="50000">$50,000</option>
                        <option value="100000">$100,000</option>
                        <option value="200000">$200,000</option>
                    </select>
                </div>

                {/* Platform Filter */}
                <div>
                    <label className="block text-sm font-medium mb-1">Platform</label>
                    <select
                        value={filters.platform || ''}
                        onChange={handlePlatformChange}
                        className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-600"
                    >
                        <option value="">Any</option>
                        <option value="MetaTrader 4">MetaTrader 4</option>
                        <option value="MetaTrader 5">MetaTrader 5</option>
                        <option value="cTrader">cTrader</option>
                        <option value="Tradovate">Tradovate</option>
                        <option value="Rithmic">Rithmic</option>
                    </select>
                </div>

                {/* Additional placeholder for Profit Split (Phase 1) */}
                <div className="opacity-50">
                    <label className="block text-sm font-medium mb-1">Profit Split (Coming Soon)</label>
                    <select disabled className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed">
                        <option>Any</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default FilterSidebar;
