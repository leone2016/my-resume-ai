import { Request, Response } from 'express';
import { GeneratePdfUseCase } from '../usecases/GeneratePdfUseCase';

export class PdfController {
    private generatePdfUseCase: GeneratePdfUseCase;

    constructor() {
        this.generatePdfUseCase = new GeneratePdfUseCase();
    }

    generate = async (req: Request, res: Response) => {
        try {
            const { latex } = req.body;

            if (!latex) {
                return res.status(400).json({ message: 'LaTeX content is required' });
            }

            const relativeUrl = await this.generatePdfUseCase.execute(latex);

            // Construct full URL
            // Assuming the server is accessed via the same host header, or hardcoded for localhost
            const protocol = req.protocol;
            const host = req.get('host');
            const fullUrl = `${protocol}://${host}${relativeUrl}`;

            return res.status(200).json({ url: fullUrl });
        } catch (error: any) {
            console.error('Controller Error:', error);
            return res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    }
}
