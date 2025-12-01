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
    }
};
