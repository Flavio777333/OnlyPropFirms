import React from 'react'
import { render, screen } from '@testing-library/react'
import FirmCard from '../FirmCard'
import { PropFirm } from '@/store/features/propFirms/propFirmSlice'

const mockFirm: PropFirm = {
    id: 'test-firm',
    name: 'Test Firm',
    profitSplit: '90/10',
    minFunding: 25000,
    maxFunding: 300000,
    evaluationFee: 150.00,
    rating: 4.8,
    reviewCount: 100,
    isFeatured: true,
    affiliateLink: 'https://example.com'
}

describe('FirmCard', () => {
    it('renders firm name and rating', () => {
        render(<FirmCard firm={mockFirm} />)
        expect(screen.getByText('Test Firm')).toBeInTheDocument()
        expect(screen.getByText(/4.8/)).toBeInTheDocument()
    })

    it('renders profit split', () => {
        render(<FirmCard firm={mockFirm} />)
        expect(screen.getByText('90/10')).toBeInTheDocument()
    })

    it('renders featured badge when isFeatured is true', () => {
        render(<FirmCard firm={mockFirm} />)
        expect(screen.getByText('Featured')).toBeInTheDocument()
    })
})
