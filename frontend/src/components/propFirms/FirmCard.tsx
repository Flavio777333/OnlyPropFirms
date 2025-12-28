import React from 'react';
import { Pricing, getDealBadges, DealBadge } from '../../types/pricing';

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

    return (
        <article className="firm-card" data-firm-id={propFirmId}>
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
                        <span className="label">Evaluation Fee:</span>
                        <span className="value">
                            {pricing.currentPrice} {pricing.priceCurrency}
                            {pricing.discountPercent > 0 && (
                                <span className="discount"> (-{pricing.discountPercent}%)</span>
                            )}
                        </span>
                    </div>
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
