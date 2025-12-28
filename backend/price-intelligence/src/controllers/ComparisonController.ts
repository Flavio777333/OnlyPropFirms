import { Request, Response } from 'express';
import { ComparisonService } from '../services/ComparisonService';

export class ComparisonController {
    constructor(private comparisonService: ComparisonService) { }

    compareFirms = async (req: Request, res: Response) => {
        try {
            const firmIdsParam = req.query.ids as string;
            if (!firmIdsParam) {
                return res.status(400).json({ error: 'Missing "ids" query parameter (comma-separated firm IDs)' });
            }

            const firmIds = firmIdsParam.split(',').map(id => id.trim());

            // Optional account size filter
            const accountSizeParam = req.query.accountSize ? parseInt(req.query.accountSize as string) : undefined;

            const results = await this.comparisonService.compareFirms(firmIds, accountSizeParam);

            res.json({ data: results });
        } catch (error) {
            console.error('[ComparisonController] Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}
