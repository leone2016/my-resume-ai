import { Request, Response } from 'express';
import { GenerateDocxUseCase } from '../usecases/GenerateDocxUseCase';

export class DocxController {
    private generateDocxUseCase: GenerateDocxUseCase;

    constructor() {
        this.generateDocxUseCase = new GenerateDocxUseCase();
    }

    generate = async (req: Request, res: Response) => {
        try {
            const { latex } = req.body;

            if (!latex) {
                return res.status(400).json({ message: 'LaTeX content is required' });
            }

            const filePath = await this.generateDocxUseCase.execute(latex);

            // Stream the file to the client
            return res.download(filePath, 'resume.docx', (err) => {
                if (err) {
                    console.error('Error sending file:', err);
                    if (!res.headersSent) {
                        res.status(500).json({ message: 'Error downloading file' });
                    }
                }
                // Optional: Delete file after sending if you want to save space
                // import * as fs from 'fs';
                // fs.unlinkSync(filePath);
            });
        } catch (error: any) {
            console.error('Docx Controller Error:', error);
            return res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    }
}
