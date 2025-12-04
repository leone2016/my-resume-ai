import { v4 as uuidv4 } from 'uuid';

const isExtension = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;

export const storage = {
    async get(key) {
        if (isExtension) {
            return new Promise((resolve) => {
                chrome.storage.local.get([key], (result) => {
                    resolve(result[key]);
                });
            });
        } else {
            const val = localStorage.getItem(key);
            try {
                return Promise.resolve(JSON.parse(val));
            } catch (e) {
                return Promise.resolve(val);
            }
        }
    },

    async set(key, value) {
        if (isExtension) {
            return new Promise((resolve) => {
                chrome.storage.local.set({ [key]: value }, resolve);
            });
        } else {
            localStorage.setItem(key, JSON.stringify(value));
            return Promise.resolve();
        }
    },

    async getApiKey() {
        return this.get('geminiApiKey');
    },

    async setApiKey(key) {
        return this.set('geminiApiKey', key);
    },

    async getCVs() {
        const cvs = await this.get('savedCVs');
        return cvs || [];
    },

    async saveCV(cv) {
        const cvs = await this.getCVs();
        const newCV = { ...cv, id: cv.id || uuidv4(), updatedAt: new Date().toISOString() };
        const index = cvs.findIndex(c => c.id === newCV.id);

        if (index >= 0) {
            cvs[index] = newCV;
        } else {
            cvs.push(newCV);
        }

        await this.set('savedCVs', cvs);
        return newCV;
    },

    async deleteCV(id) {
        const cvs = await this.getCVs();
        const filtered = cvs.filter(c => c.id !== id);
        await this.set('savedCVs', filtered);
    },

    async getHistory() {
        const history = await this.get('optimizationHistory');
        return history || [];
    },

    async saveHistory(item) {
        const history = await this.getHistory();
        const newItem = { ...item, id: uuidv4(), date: new Date().toISOString() };
        history.unshift(newItem); // Add to beginning
        // Limit history to last 50 items to save space
        if (history.length > 50) history.pop();
        await this.set('optimizationHistory', history);
        return newItem;
    },

    async getPrompts() {
        const prompts = await this.get('savedPrompts');
        if (!prompts || prompts.length === 0) {
            // Initialize with default English prompt
            const defaultPrompt = {
                id: 'default-english',
                name: 'Default (English)',
                content: `Act as an expert ATS (Applicant Tracking System) consultant, 
specialized in LinkedIn Recruiter and optimizing resumes to maximize matches with job offers.

BEHAVIOR RULES:
1. Your task is to analyze a job offer and a resume in LaTeX format.
2. You must identify keywords, skills, competencies, tools, and responsibilities mentioned in the offer.
3. You must modify the LaTeX CV to include relevant keywords naturally, coherently, and professionally, without altering the original structure or inventing false achievements.
4. The result must maintain valid and compilable LaTeX format.
5. Always respond with:
   A) An updated CV **in full and clean LaTeX**.
   B) A clear and concise summary of the changes made.
6. Do not generate PDF; only return the LaTeX.
7. If you find inconsistencies, missing information, or contradictions between the offer and the CV, correct them professionally.

RESPONSE OBJECTIVE:
-------------------------
Your response must exclusively include:

=== SECTION 1: UPDATED CV IN LATEX ===
(Provide the complete document, ready to compile. DO NOT use markdown code blocks, just the plain latex text if possible, or ensure it is easy to extract)

=== SECTION 2: SUMMARY OF UPDATES ===
Indicate:
- Keywords added
- Sections modified
- Brief justification for each change
- ATS Relevance
`  + `
DATA TO ANALYZE:
---------------------
JOB OFFER (Job Description):
\${jobDescription}

ORIGINAL RESUME (LaTeX):
\${resumeLatex}

RESUME IDENTIFIER:
\${resumeName}


END OF PROMPT.`
            };
            await this.set('savedPrompts', [defaultPrompt]);
            return [defaultPrompt];
        }
        return prompts;
    },

    async savePrompt(prompt) {
        const prompts = await this.getPrompts();
        const newPrompt = { ...prompt, id: prompt.id || uuidv4(), updatedAt: new Date().toISOString() };
        const index = prompts.findIndex(p => p.id === newPrompt.id);

        if (index >= 0) {
            prompts[index] = newPrompt;
        } else {
            prompts.push(newPrompt);
        }

        await this.set('savedPrompts', prompts);
        return newPrompt;
    },

    async deletePrompt(id) {
        const prompts = await this.getPrompts();
        const filtered = prompts.filter(p => p.id !== id);
        await this.set('savedPrompts', filtered);
    },

    async getSelectedPromptId() {
        return await this.get('selectedPromptId');
    },

    async setSelectedPromptId(id) {
        return await this.set('selectedPromptId', id);
    }
};
