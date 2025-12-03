import React, { useEffect, useState } from 'react';
import { X, Clock, FileText, ChevronRight } from 'lucide-react';
import { storage } from '../services/storage';

export default function Sidebar({ isOpen, onClose, onSelectHistory }) {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        if (isOpen) {
            loadHistory();
        }
    }, [isOpen]);

    const loadHistory = async () => {
        const data = await storage.getHistory();
        setHistory(data);
    };

    const formatDate = (isoString) => {
        if (!isoString) return '';
        return new Date(isoString).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getDomain = (url) => {
        try {
            return new URL(url).hostname.replace('www.', '');
        } catch {
            return '';
        }
    };

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Panel */}
            <div className={`fixed top-0 left-0 h-full w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h2 className="font-bold text-gray-800 flex items-center gap-2">
                            <Clock size={18} className="text-blue-600" />
                            History
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-1.5 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                        {history.length === 0 ? (
                            <div className="text-center py-10 text-gray-400 text-sm">
                                <Clock size={32} className="mx-auto mb-2 opacity-20" />
                                <p>No history yet</p>
                            </div>
                        ) : (
                            history.map((item) => (
                                <div
                                    key={item.id || Math.random()}
                                    onClick={() => onSelectHistory(item)}
                                    className="group p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 cursor-pointer transition-all shadow-sm hover:shadow-md"
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full w-fit mb-1">
                                                {item.originalCvName || 'Unknown CV'}
                                            </span>
                                            {item.url && (
                                                <span className="text-[10px] text-gray-500 font-medium truncate max-w-[150px]">
                                                    {getDomain(item.url)}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                                            {formatDate(item.timestamp || item.date)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                                        {item.jobDescription || 'No description'}
                                    </p>
                                    <div className="flex justify-end">
                                        <span className="text-[10px] text-gray-400 group-hover:text-blue-500 flex items-center transition-colors">
                                            View Result <ChevronRight size={12} className="ml-1" />
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
