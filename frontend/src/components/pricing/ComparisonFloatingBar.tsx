import React from 'react';
import { useComparison } from '../../contexts/ComparisonContext';

export const ComparisonFloatingBar: React.FC = () => {
    const { selectedFirmIds, clearComparison } = useComparison();

    if (selectedFirmIds.length === 0) return null;

    const handleCompareClick = () => {
        // Simple alert for now, Next step is valid page navigation or modal
        window.location.href = `/compare?ids=${selectedFirmIds.join(',')}`;
    };

    return (
        <div className="comparison-bar" style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#333',
            color: 'white',
            padding: '1rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '2rem',
            boxShadow: '0 -4px 10px rgba(0,0,0,0.2)',
            zIndex: 1000
        }}>
            <div>
                <strong>{selectedFirmIds.length}</strong> firms selected
            </div>

            <button className="btn btn--small btn--outline" onClick={clearComparison} style={{ color: 'white', borderColor: 'white' }}>
                Clear
            </button>

            <button className="btn btn--primary" onClick={handleCompareClick}>
                Compare Now
            </button>
        </div>
    );
};
