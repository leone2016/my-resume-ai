import { storage } from './storage';

const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-latest:generateContent';

export const gemini = {
    async optimizeCV(jobDescription, resumeLatex, resumeName, promptTemplate) {
        const apiKey = await storage.getApiKey();
        if (!apiKey) {
            throw new Error('API Key not found. Please configure it in settings.');
        }

        // Use provided template or fallback (though caller should provide it)
        if (!promptTemplate) {
            throw new Error('Prompt template is required.');
        }

        const prompt = promptTemplate
            .replace('${jobDescription}', jobDescription)
            .replace('${resumeLatex}', resumeLatex)
            .replace('${resumeName}', resumeName);

        try {
            const response = await fetch(`${API_URL}?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Failed to communicate with Gemini');
            }

            const data = await response.json();
            const text = data.candidates[0].content.parts[0].text;
            return this.parseResponse(text);

        } catch (error) {
            console.error('Gemini API Error:', error);
            throw error;
        }
    },

    parseResponse(text) {
        // Simple parsing logic to separate LaTeX and Summary
        // Supports both Spanish (original) and English (new default) markers
        const markers = {
            latex: ["=== SECCIÓN 1: CV ACTUALIZADO EN LATEX ===", "=== SECTION 1: UPDATED CV IN LATEX ==="],
            summary: ["=== SECCIÓN 2: RESUMEN DE ACTUALIZACIONES ===", "=== SECTION 2: SUMMARY OF UPDATES ==="]
        };

        let latexMarker = markers.latex.find(m => text.includes(m));
        let summaryMarker = markers.summary.find(m => text.includes(m));

        // If markers not found, try to guess or fail gracefully
        if (!latexMarker || !summaryMarker) {
            // Fallback: try to find just "SECTION 1" or "SECCIÓN 1" if full marker fails
            // For now, let's stick to strict markers to avoid bad parsing
        }

        const latexStartIndex = latexMarker ? text.indexOf(latexMarker) : -1;
        const summaryStartIndex = summaryMarker ? text.indexOf(summaryMarker) : -1;

        let latex = "";
        let summary = "";

        if (latexStartIndex !== -1 && summaryStartIndex !== -1) {
            latex = text.substring(latexStartIndex + latexMarker.length, summaryStartIndex).trim();
            // Clean up potential markdown code blocks if the model added them
            latex = latex.replace(/^```latex\n/, '').replace(/^```\n/, '').replace(/\n```$/, '');

            summary = text.substring(summaryStartIndex + summaryMarker.length).trim();
        } else {
            // Fallback if structure is not exact
            summary = "Could not parse structured response. Raw response:\n" + text;
            latex = "";
        }

        return { latex, summary };
    }
};
