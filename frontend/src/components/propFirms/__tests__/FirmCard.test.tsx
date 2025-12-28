import React from 'react'
import { render, screen } from '@testing-library/react'
import { FirmCard } from '../FirmCard'

describe('FirmCard', () => {
    it('renders firm name and rating', () => {
        render(
            <FirmCard
                propFirmId="test-firm"
                propFirmName="Test Firm"
                rating={4.8}
                reviewCount={100}
            />
        )
        expect(screen.getByText('Test Firm')).toBeInTheDocument()
        expect(screen.getByText(/4.8/)).toBeInTheDocument()
    })

    it('renders pricing information when provided', () => {
        render(
            <FirmCard
                propFirmId="test-firm"
                propFirmName="Test Firm"
                pricing={{
                    propFirmId: 'test-firm',
                    propFirmName: 'Test Firm',
                    accountSize: 50000,
                    accountSizeCurrency: 'USD',
                    currentPrice: 199,
                    priceCurrency: 'USD',
                    discountPercent: 30,
                    discountLabel: 'Special Offer',
                    lastUpdatedAt: new Date(),
                    lastUpdatedAtISO: new Date().toISOString(),
                    lastUpdatedAgo: '2h ago',
                    isNewDeal: true,
                    requiresManualReview: false,
                    sourceUrl: 'https://example.com'
                }}
            />
        )
        expect(screen.getByText('Test Firm')).toBeInTheDocument()
        expect(screen.getByText(/50,000/)).toBeInTheDocument()
        expect(screen.getByText(/199/)).toBeInTheDocument()
    })

    it('renders deal badges when pricing has discount', () => {
        render(
            <FirmCard
                propFirmId="test-firm"
                propFirmName="Test Firm"
                pricing={{
                    propFirmId: 'test-firm',
                    propFirmName: 'Test Firm',
                    accountSize: 50000,
                    accountSizeCurrency: 'USD',
                    currentPrice: 199,
                    priceCurrency: 'USD',
                    discountPercent: 30,
                    lastUpdatedAt: new Date(),
                    lastUpdatedAtISO: new Date().toISOString(),
                    lastUpdatedAgo: '2h ago',
                    isNewDeal: true,
                    requiresManualReview: false,
                    sourceUrl: 'https://example.com'
                }}
            />
        )
        expect(screen.getByText('-30% DISCOUNT')).toBeInTheDocument()
    })
})
