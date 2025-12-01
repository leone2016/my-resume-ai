import { PdfService } from '../services/PdfService';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';

export class GeneratePdfUseCase {
    private pdfService: PdfService;
    private publicDir: string;

    constructor() {
        this.pdfService = new PdfService();
        // Ensure public/pdfs directory exists
        this.publicDir = path.join(process.cwd(), 'public', 'pdfs');
        if (!fs.existsSync(this.publicDir)) {
            fs.mkdirSync(this.publicDir, { recursive: true });
        }
    }

    async execute(latexContent: string): Promise<string> {
        const fileId = uuidv4();

        // Generate PDF in the public directory
        await this.pdfService.generatePdf(latexContent, this.publicDir, fileId);

        // Return the relative URL path
        return `/pdfs/${fileId}.pdf`;
    }
}
