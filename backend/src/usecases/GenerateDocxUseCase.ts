import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class GenerateDocxUseCase {
    private publicDir: string;
    private tempDir: string;

    constructor() {
        // Ensure public/docx directory exists
        this.publicDir = path.join(process.cwd(), 'public', 'docx');
        if (!fs.existsSync(this.publicDir)) {
            fs.mkdirSync(this.publicDir, { recursive: true });
        }

        // Ensure temp directory exists
        this.tempDir = path.join(process.cwd(), 'temp');
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, { recursive: true });
        }
    }

    async execute(latexContent: string): Promise<string> {
        const fileId = uuidv4();
        const tempTexPath = path.join(this.tempDir, `${fileId}.tex`);
        const outputDocxPath = path.join(this.publicDir, `${fileId}.docx`);

        try {
            // Write LaTeX content to temp file
            await fs.promises.writeFile(tempTexPath, latexContent);

            // Execute pandoc command
            // pandoc input.tex -o output.docx
            await execAsync(`pandoc "${tempTexPath}" --reference-doc=/app/template.docx -o "${outputDocxPath}"`);

            // Return the absolute file path
            return outputDocxPath;
        } finally {
            // Cleanup temp file
            if (fs.existsSync(tempTexPath)) {
                fs.unlinkSync(tempTexPath);
            }
        }
    }
}
