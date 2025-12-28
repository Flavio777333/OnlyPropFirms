import React from 'react';
import { Pricing, getDealBadges, DealBadge } from '../../types/pricing';
import { useComparison } from '../../contexts/ComparisonContext';

interface FirmCardProps {
    propFirmId: string;
    propFirmName: string;
    logo?: string;
    rating?: number;
    reviewCount?: number;

    // NEW: Pricing information
    pricing?: Pricing;

    // Handlers
    onViewDetails?: () => void;
    onGetFunded?: () => void;
}

/**
 * Component: FirmCard with Deal Badges
 * Shows a single Prop Firm card with optional pricing info and deal badges
 */
export const FirmCard: React.FC<FirmCardProps> = ({
    propFirmId,
    propFirmName,
    logo,
    rating,
    reviewCount,
    pricing,
    onViewDetails,
    onGetFunded
}) => {
    const badges = pricing ? getDealBadges(pricing) : [];

    // Comparison Context
    const { addFirm, removeFirm, selectedFirmIds, isComparisonFull } = useComparison();
    const isSelected = selectedFirmIds.includes(propFirmId);

    const toggleComparison = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click
        if (isSelected) {
            removeFirm(propFirmId);
        } else {
            addFirm(propFirmId);
        }
    };

    return (
        <article className={`firm-card ${isSelected ? 'firm-card--selected' : ''}`} data-firm-id={propFirmId}>
            {/* Badge Section */}
            {badges.length > 0 && (
                <div className="firm-card__badges">
                    {badges.map((badge, idx) => (
                        <span
                            key={idx}
                            className={`badge badge--${badge.variant}`}
                            title={badge.tooltip}
                        >
                            {badge.label}
                        </span>
                    ))}
                </div>
            )}

            {/* Header */}
            <header className="firm-card__header">
                {/* Comparison Checkbox */}
                <div className="compare-toggle" style={{ float: 'right', marginLeft: '10px' }}>
                    <label title="Compare up to 4 firms" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '0.8rem' }}>
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => { }} // Dummy to silence React warning, handled by onClick
                            onClick={toggleComparison}
                            disabled={!isSelected && isComparisonFull}
                            style={{ marginRight: '5px' }}
                        />
                        <span>Compare</span>
                    </label>
                </div>

                {logo && <img src={logo} alt={propFirmName} />}
                <h3>{propFirmName}</h3>
            </header>

            {/* Metrics */}
            <div className="firm-card__metrics">
                {rating && <span className="rating">★ {rating.toFixed(1)}</span>}
                {reviewCount && <span className="reviews">({reviewCount} reviews)</span>}
            </div>

            {/* Pricing (Phase 0+) */}
            {pricing && (
                <div className="firm-card__pricing">
                    <div className="price-row">
                        <span className="label">Account Size:</span>
                        <span className="value">
                            {pricing.accountSize.toLocaleString()} {pricing.accountSizeCurrency}
                        </span>
                    </div>
                    <div className="price-row">
                        <span className="label">Advertised:</span>
                        <span className="value">
                            {pricing.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 0 })} {pricing.priceCurrency}
                            {pricing.discountPercent > 0 && (
                                <span className="discount"> (-{pricing.discountPercent}%)</span>
                            )}
                        </span>
                    </div>
                    {/* Phase 2: True Cost Display */}
                    {pricing.trueCost && pricing.trueCost > pricing.currentPrice && (
                        <div className="price-row highlight" style={{ backgroundColor: '#fff3cd', padding: '2px 5px', borderRadius: '4px' }}>
                            <span className="label" style={{ fontWeight: 'bold' }}>True Cost:</span>
                            <span className="value true-cost"
                                title={`Includes: Activation ($${pricing.activationFee || 0}) + Data ($${pricing.monthlyDataFee || 0})`}
                                style={{ fontWeight: 'bold', color: '#d9534f' }}>
                                {pricing.trueCost.toLocaleString(undefined, { minimumFractionDigits: 0 })} {pricing.priceCurrency}
                            </span>
                        </div>
                    )}
                    <div className="price-row meta">
                        <span className="label">Last Updated:</span>
                        <span className="value">{pricing.lastUpdatedAgo}</span>
                    </div>
                </div>
            )}

            {/* Actions */}
            <footer className="firm-card__footer">
                <button
                    className="btn btn--secondary"
                    onClick={onViewDetails}
                >
                    View Details
                </button>
                <a
                    href={pricing?.affiliateLink || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn--primary"
                    onClick={onGetFunded}
                >
                    Get Funded
                </a>
            </footer>
        </article>
    );
};
