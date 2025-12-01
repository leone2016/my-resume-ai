import { execFile } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execFileAsync = promisify(execFile);

export class PdfService {
    async generatePdf(latexContent: string, outputDir: string, filename: string): Promise<string> {
        const texFile = path.join(outputDir, `${filename}.tex`);

        // Sanitize LaTeX for Tectonic (XeTeX)
        // Remove pdflatex specific commands that cause errors in Tectonic
        const sanitizedLatex = latexContent
            .replace(/\\input{glyphtounicode}/g, '% \\input{glyphtounicode}')
            .replace(/\\pdfgentounicode=1/g, '% \\pdfgentounicode=1');

        // Write LaTeX content to file
        await fs.promises.writeFile(texFile, sanitizedLatex);

        // Determine Tectonic binary path
        let tectonicPath = '/usr/local/bin/tectonic';
        const localTectonicPath = path.join(process.cwd(), 'tectonic/bin/tectonic');

        if (fs.existsSync(localTectonicPath)) {
            tectonicPath = localTectonicPath;
        }

        try {
            // Execute tectonic
            // We set HOME to /tmp to avoid read-only errors if running as non-root (though in Docker usually root)
            // and to ensure cache is written to a writable location.
            await execFileAsync(tectonicPath, [texFile, '--outdir', outputDir], {
                env: { ...process.env, HOME: '/tmp' }
            });

            return path.join(outputDir, `${filename}.pdf`);
        } catch (error) {
            console.error('Tectonic execution failed:', error);
            throw new Error('Failed to generate PDF');
        }
    }
}
