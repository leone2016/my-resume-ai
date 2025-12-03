import React, { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { Trash2, Plus, Save, ArrowLeft } from 'lucide-react';

export default function Settings({ onBack }) {
    const [apiKey, setApiKey] = useState('');
    const [cvs, setCvs] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCv, setCurrentCv] = useState({ name: '', content: '' });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        const key = await storage.getApiKey();
        setApiKey(key || '');
        const savedCvs = await storage.getCVs();
        setCvs(savedCvs);
    };

    const handleSaveApiKey = async () => {
        await storage.setApiKey(apiKey);
        alert('API Key saved!');
    };

    const handleSaveCv = async () => {
        if (!currentCv.name || !currentCv.content) {
            alert('Please fill in both name and content');
            return;
        }
        await storage.saveCV(currentCv);
        setIsEditing(false);
        setCurrentCv({ name: '', content: '' });
        loadSettings();
    };

    const handleDeleteCv = async (id) => {
        if (confirm('Are you sure you want to delete this CV?')) {
            await storage.deleteCV(id);
            loadSettings();
        }
    };

    return (
        <div className="p-4  min-h-[400px] w-full max-w-md mx-auto">
            <div className="flex items-center mb-4">
                <button onClick={onBack} className="mr-2 p-1 hover:bg-gray-100 rounded">
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-xl font-bold">Settings</h2>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium mb-1">Gemini API Key</label>
                <div className="flex gap-2">
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="flex-1 p-2 border rounded text-sm"
                        placeholder="Enter your Gemini API Key"
                    />
                    <button
                        onClick={handleSaveApiKey}
                        className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                    >
                        <Save size={18} />
                    </button>
                </div>
            </div>

            <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">My Resumes (LaTeX)</h3>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                    >
                        <Plus size={16} className="mr-1" /> Add New
                    </button>
                </div>

                {isEditing && (
                    <div className="mb-4 p-3 border rounded bg-gray-50">
                        <input
                            type="text"
                            value={currentCv.name}
                            onChange={(e) => setCurrentCv({ ...currentCv, name: e.target.value })}
                            className="w-full p-2 mb-2 border rounded text-sm"
                            placeholder="Resume Name (e.g., Backend Dev)"
                        />
                        <textarea
                            value={currentCv.content}
                            onChange={(e) => setCurrentCv({ ...currentCv, content: e.target.value })}
                            className="w-full p-2 mb-2 border rounded text-sm font-mono h-32"
                            placeholder="Paste LaTeX content here..."
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-200 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveCv}
                                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    {cvs.map((cv) => (
                        <div key={cv.id} className="flex justify-between items-center p-2 border rounded hover:bg-gray-50">
                            <span className="font-medium">{cv.name}</span>
                            <button
                                onClick={() => handleDeleteCv(cv.id)}
                                className="text-red-500 hover:text-red-700 p-1"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                    {cvs.length === 0 && !isEditing && (
                        <p className="text-gray-500 text-sm text-center py-4">No resumes saved yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
