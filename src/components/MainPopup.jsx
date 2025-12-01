import React, { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { gemini } from '../services/gemini';
import { Settings as SettingsIcon, Loader2, Download, FileText } from 'lucide-react';

export default function MainPopup({ onOpenSettings }) {
    const [jobDescription, setJobDescription] = useState('');
    const [cvs, setCvs] = useState([]);
    const [selectedCvId, setSelectedCvId] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null); // { latex, summary }

    useEffect(() => {
        loadData();
        checkPendingJob();
    }, []);

    const loadData = async () => {
        const savedCvs = await storage.getCVs();
        setCvs(savedCvs);
        if (savedCvs.length > 0) {
            setSelectedCvId(savedCvs[0].id);
        }
    };

    const checkPendingJob = async () => {
        const pending = await storage.get('pendingJobDescription');
        if (pending) {
            setJobDescription(pending);
            // Clear it so it doesn't persist forever if unwanted
            // storage.set('pendingJobDescription', ''); 
        }
    };

    const handleOptimize = async () => {
        if (!jobDescription || !selectedCvId) return;

        const selectedCv = cvs.find(c => c.id === selectedCvId);
        if (!selectedCv) return;

        setLoading(true);
        setResult(null);

        try {
            const response = await gemini.optimizeCV(jobDescription, selectedCv.content, selectedCv.name);
            setResult(response);

            // Save history
            await storage.saveHistory({
                jobDescription: jobDescription.substring(0, 100) + '...',
                originalCvName: selectedCv.name,
                summary: response.summary,
                timestamp: Date.now()
            });

        } catch (error) {
            alert('Error optimizing CV: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadLatex = () => {
        if (!result?.latex) return;
        const blob = new Blob([result.latex], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'optimized_cv.tex';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Basic PDF generation placeholder
    // Real PDF generation from LaTeX in browser is hard. 
    // We will offer the .tex file primarily, and maybe a text file as fallback.
    const handleDownloadPDF = () => {
        alert("Direct PDF generation from LaTeX in the browser is currently limited. Please download the .tex file and compile it, or use an online LaTeX editor like Overleaf.");
    };

    return (
        <div className="p-4 w-full max-w-md mx-auto">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    My Resume AI
                </h1>
                <button onClick={onOpenSettings} className="p-2 hover:bg-gray-100 rounded-full">
                    <SettingsIcon size={20} />
                </button>
            </div>

            {!result ? (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Job Description</label>
                        <textarea
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            className="w-full p-2 border rounded h-32 text-sm"
                            placeholder="Paste job description here or select text on a page..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Select Resume</label>
                        <select
                            value={selectedCvId}
                            onChange={(e) => setSelectedCvId(e.target.value)}
                            className="w-full p-2 border rounded text-sm"
                        >
                            {cvs.map(cv => (
                                <option key={cv.id} value={cv.id}>{cv.name}</option>
                            ))}
                        </select>
                        {cvs.length === 0 && (
                            <p className="text-xs text-red-500 mt-1">Please add a resume in settings first.</p>
                        )}
                    </div>

                    <button
                        onClick={handleOptimize}
                        disabled={loading || !jobDescription || cvs.length === 0}
                        className="w-full py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center"
                    >
                        {loading ? <Loader2 className="animate-spin mr-2" /> : 'Optimize Resume'}
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded border border-green-200">
                        <h3 className="font-semibold text-green-800 mb-2">Optimization Complete!</h3>
                        <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-40 overflow-y-auto">
                            {result.summary}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleDownloadLatex}
                            className="flex-1 py-2 border border-gray-300 rounded hover:bg-gray-50 flex justify-center items-center text-sm"
                        >
                            <FileText size={16} className="mr-2" /> Download .tex
                        </button>
                        <button
                            onClick={handleDownloadPDF}
                            className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex justify-center items-center text-sm"
                        >
                            <Download size={16} className="mr-2" /> Download PDF
                        </button>
                    </div>

                    <button
                        onClick={() => setResult(null)}
                        className="w-full text-sm text-gray-500 hover:text-gray-700"
                    >
                        Start Over
                    </button>
                </div>
            )}
        </div>
    );
}
