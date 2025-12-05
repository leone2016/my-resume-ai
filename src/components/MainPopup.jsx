import React, { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { gemini } from '../services/gemini';
import { Settings as SettingsIcon, Loader2, Download, FileText, Menu } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Sidebar from './Sidebar';

export default function MainPopup({ onOpenSettings, onClose }) {
    const [jobDescription, setJobDescription] = useState('');
    const [cvs, setCvs] = useState([]);
    const [selectedCvId, setSelectedCvId] = useState('');
    const [prompts, setPrompts] = useState([]);
    const [selectedPromptId, setSelectedPromptId] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null); // { latex, summary }
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

        const savedPrompts = await storage.getPrompts();
        setPrompts(savedPrompts);

        const savedSelectedPromptId = await storage.getSelectedPromptId();
        if (savedSelectedPromptId && savedPrompts.find(p => p.id === savedSelectedPromptId)) {
            setSelectedPromptId(savedSelectedPromptId);
        } else if (savedPrompts.length > 0) {
            setSelectedPromptId(savedPrompts[0].id);
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
            // Get current tab URL
            let currentUrl = '';
            if (typeof chrome !== 'undefined' && chrome.tabs) {
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                currentUrl = tab?.url || '';
            }

            const selectedPrompt = prompts.find(p => p.id === selectedPromptId);
            const promptContent = selectedPrompt ? selectedPrompt.content : null;

            const response = await gemini.optimizeCV(jobDescription, selectedCv.content, selectedCv.name, promptContent);
            setResult(response);

            // Save history
            await storage.saveHistory({
                jobDescription: jobDescription, // Save full description
                originalCvName: selectedCv.name,
                summary: response.summary,
                latex: response.latex, // Save latex for restoration
                timestamp: Date.now(),
                url: currentUrl // Save the URL
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
    const [pdfLoading, setPdfLoading] = useState(false);

    const handleDownloadPDF = async () => {
        if (!result?.latex) return;

        setPdfLoading(true);
        try {
            // Local Docker Backend Endpoint
            const API_URL = 'http://localhost:1991/generate-pdf';

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ latex: result.latex }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate PDF');
            }

            const data = await response.json();

            if (data.url) {
                window.open(data.url, '_blank');
            } else {
                throw new Error('No URL returned');
            }

        } catch (error) {
            console.error('Error downloading PDF:', error);
            alert('Error generating PDF. Please try again or download the .tex file.');
        } finally {
            setPdfLoading(false);
        }
    };

    const handleSelectHistory = (item) => {
        debugger;
        setJobDescription(item.jobDescription || '');
        // If the item has a result (latex/summary), show it
         setResult({
            latex: item.latex || '', // Might be empty for old items
            url: item.url || '',
            summary: item.summary
          });
        setIsSidebarOpen(false);
    };

    return (
        <div className="p-6 w-full max-w-md mx-auto bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 mt-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold  accent-blue-600 flex items-center gap-3">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-1 text-gray-500 transition-colors duration-200"
                        title="History"
                    >
                        <Menu size={24} />
                    </button>
                    My Resume AI
                </h1>
                <div className="flex gap-2">
                    <button
                        onClick={onOpenSettings}
                        className="p-2 text-gray-500  transition-colors duration-200"
                        title="Settings"
                    >
                        <SettingsIcon size={20} />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors duration-200"
                        title="Close"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
            </div>

            {!result ? (
                <div className="space-y-5">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Select Prompt</label>
                        <div className="relative">
                            <select
                                value={selectedPromptId}
                                onChange={async (e) => {
                                    const newId = e.target.value;
                                    setSelectedPromptId(newId);
                                    await storage.setSelectedPromptId(newId);
                                }}
                                className="w-full p-3 border border-gray-200 rounded-lg text-sm appearance-none bg-gray-50 hover:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all cursor-pointer"
                            >
                                {prompts.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Job Description</label>
                        <textarea
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-lg h-32 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none bg-gray-50 hover:bg-white"
                            placeholder="Paste job description here..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Select Resume</label>
                        <div className="relative">
                            <select
                                value={selectedCvId}
                                onChange={(e) => setSelectedCvId(e.target.value)}
                                className="w-full p-3 border border-gray-200 rounded-lg text-sm appearance-none bg-gray-50 hover:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all cursor-pointer"
                            >
                                {cvs.map(cv => (
                                    <option key={cv.id} value={cv.id}>{cv.name}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                            </div>
                        </div>
                        {cvs.length === 0 && (
                            <p className="text-xs text-red-500 mt-1 font-medium">Please add a resume in settings first.</p>
                        )}
                    </div>

                    <button
                        onClick={handleOptimize}
                        disabled={loading || !jobDescription || cvs.length === 0}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex justify-center items-center"
                    >
                        {loading ? <Loader2 className="animate-spin mr-2" /> : 'Optimize Resume'}
                    </button>
                </div>
            ) : (

                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                        {`${jobDescription} ` || 'No description'} 
                    </p>
                    {result.url !== '' && <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 line-clamp-2 mb-2">
                        url job offer
                    </a>}
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200 shadow-sm">
                        <h3 className="font-semibold text-green-800 mb-2 flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                            Optimization Complete!
                        </h3>
                        <div className="text-sm text-gray-700 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                            <ReactMarkdown >
                                {result.summary}
                            </ReactMarkdown>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleDownloadLatex}
                            className="flex-1 py-2.5 border border-gray-200 bg-white text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 font-medium transition-all flex justify-center items-center text-sm shadow-sm"
                        >
                            <FileText size={16} className="mr-2 text-gray-500" /> Download .tex
                        </button>
                        <button
                            onClick={handleDownloadPDF}
                            disabled={pdfLoading}
                            className="flex-1 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium transition-all flex justify-center items-center text-sm shadow-md disabled:opacity-70"
                        >
                            {pdfLoading ? <Loader2 className="animate-spin mr-2" size={16} /> : <Download size={16} className="mr-2" />}
                            {pdfLoading ? 'Generating...' : 'Download PDF'}
                        </button>
                    </div>

                    <button
                        onClick={() => setResult(null)}
                        className="w-full py-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
                    >
                        Start Over
                    </button>
                </div>
            )}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onSelectHistory={handleSelectHistory}
            />
        </div>
    );
}
