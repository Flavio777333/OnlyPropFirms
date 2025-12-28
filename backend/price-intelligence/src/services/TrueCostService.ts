import { Pricing } from '../models/Pricing';

export interface ITrueCostCalculator {
    calculateTrueCost(pricing: Pricing): number;
}

/**
 * Service to calculate the "True Cost" of a prop firm challenge.
 * True Cost = Advertised Price + Activation Fee + (Monthly Data Fee * 1 month)
 * 
 * Future improvements: Can handle "reset fees" or "withdrawal fees" logic.
 */
export class TrueCostService implements ITrueCostCalculator {

    calculateTrueCost(pricing: Pricing): number {
        let cost = pricing.currentPrice;

        // Add hidden fees if present
        if (pricing.activationFee) {
            cost += pricing.activationFee;
        }

        if (pricing.evaluationFee) {
            cost += pricing.evaluationFee;
        }

        // Assume 1 month of data fees is mandatory/typical for comparison
        if (pricing.monthlyDataFee) {
            cost += pricing.monthlyDataFee;
        }

        return parseFloat(cost.toFixed(2));
    }
}
