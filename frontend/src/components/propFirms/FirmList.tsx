import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPropFirms, PropFirm } from '@/store/features/propFirms/propFirmSlice';
import { FirmCard } from './FirmCard';

const FirmList: React.FC = () => {
    const dispatch = useAppDispatch();
    const { firms, loading, error } = useAppSelector((state) => state.propFirms);
    const filters = useAppSelector((state) => state.filters);

    useEffect(() => {
        // In a real app, we might pass filters to the API here
        // For MVP Phase 0, we can fetch all and filter client-side or assume API handles it
        dispatch(fetchPropFirms());
    }, [dispatch]);

    // Client-side filtering for MVP (if API doesn't fully handle it yet, or for immediate feedback)
    const filteredFirms = firms.filter(firm => {
        if (filters.minFunding && firm.maxFunding < filters.minFunding) return false;
        // Platform check would go here if data model supported it
        return true;
    });

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading firms...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-500">Error: {error}</div>;
    }

    if (filteredFirms.length === 0) {
        return <div className="p-8 text-center text-gray-500">No firms match your criteria.</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFirms.map((firm: PropFirm) => (
                <FirmCard
                    key={firm.id}
                    propFirmId={firm.id}
                    propFirmName={firm.name}
                    logo={firm.logoUrl}
                    rating={firm.rating}
                    reviewCount={firm.reviewCount}
                    onViewDetails={() => console.log('View details:', firm.name)}
                />
            ))}
        </div>
    );
};

export default FirmList;
