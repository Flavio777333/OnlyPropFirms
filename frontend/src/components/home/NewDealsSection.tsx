import React, { useEffect, useState } from 'react';
import { Pricing } from '../../types/pricing';
import { pricingService } from '../../services/pricingService';
import { FirmCard } from '../propFirms/FirmCard';

/**
 * Component: New Deals Section (Homepage)
 * Displays the top 3-5 recent deal changes
 */
export const NewDealsSection: React.FC = () => {
    const [deals, setDeals] = useState<Pricing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadNewDeals = async () => {
            try {
                setLoading(true);
                const newDeals = await pricingService.getNewDeals();
                setDeals(newDeals.slice(0, 5)); // Top 5
                setError(null);
            } catch (err) {
                setError('Failed to load new deals');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadNewDeals();
    }, []);

    if (loading) return <div className="section section--deals">Loading deals...</div>;
    if (error) return <div className="section section--deals error">{error}</div>;
    if (deals.length === 0) return null; // Don't show if no deals

    return (
        <section className="section section--deals">
            <div className="section__header">
                <h2>🔥 Fresh Deals This Week</h2>
                <p>Price changes detected in the last 24 hours</p>
            </div>

            <div className="deals-grid">
                {deals.map(deal => (
                    <FirmCard
                        key={deal.propFirmId}
                        propFirmId={deal.propFirmId}
                        propFirmName={deal.propFirmName}
                        pricing={deal}
                        onGetFunded={() => {
                            // Log affiliate click (Phase 0.5)
                            console.log('Affiliate click:', deal.propFirmId);
                        }}
                    />
                ))}
            </div>
        </section>
    );
};
