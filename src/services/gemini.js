import { storage } from './storage';

const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export const gemini = {
    async optimizeCV(jobDescription, resumeLatex, resumeName) {
        const apiKey = await storage.getApiKey();
        if (!apiKey) {
            throw new Error('API Key not found. Please configure it in settings.');
        }

        const prompt = `
Actúa como un asesor experto en sistemas ATS (Applicant Tracking System), 
especializado en la plataforma LinkedIn Recruiter y en optimizar hojas de vida 
para maximizar coincidencias con ofertas laborales.

REGLAS DE COMPORTAMIENTO:
1. Tu tarea es analizar una oferta laboral y un currículum en formato LaTeX.  
2. Debes identificar palabras clave, habilidades, competencias, herramientas y 
   responsabilidades mencionadas en la oferta.
3. Debes modificar el CV en LaTeX para incluir los keywords relevantes de manera 
   natural, coherente y profesional, sin alterar la estructura original y sin 
   inventar logros falsos.
4. El resultado debe mantener un formato LaTeX válido y compilable.
5. Siempre responde con:
   A) Un CV actualizado **en LaTeX completo y limpio**.
   B) Un resumen claro y conciso de los cambios realizados.
6. No generes PDF; solo retorna el LaTeX. El plug-in se encargará del PDF.
7. Si encuentras incoherencias, faltantes o inconsistencias entre la oferta y el CV,
   corrígelas de manera profesional.

DATOS PARA ANALIZAR:
---------------------
OFERTA LABORAL (Job Description):
${jobDescription}

CURRÍCULUM ORIGINAL (LaTeX):
${resumeLatex}

IDENTIFICADOR DEL RESUME:
${resumeName}

OBJETIVO DE LA RESPUESTA:
-------------------------
Tu respuesta debe incluir exclusivamente:

=== SECCIÓN 1: CV ACTUALIZADO EN LATEX ===
(Entrega el documento completo, listo para compilar. NO uses bloques de código markdown, solo el texto plano del latex si es posible, o asegúrate de que sea fácil de extraer)

=== SECCIÓN 2: RESUMEN DE ACTUALIZACIONES ===
Indica:
- Palabras clave añadidas
- Secciones modificadas
- Justificación breve de cada cambio
- Relevancia ATS

FIN DEL PROMPT.
`;

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
        // This assumes the model follows the prompt structure
        const latexMarker = "=== SECCIÓN 1: CV ACTUALIZADO EN LATEX ===";
        const summaryMarker = "=== SECCIÓN 2: RESUMEN DE ACTUALIZACIONES ===";

        const latexStartIndex = text.indexOf(latexMarker);
        const summaryStartIndex = text.indexOf(summaryMarker);

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
