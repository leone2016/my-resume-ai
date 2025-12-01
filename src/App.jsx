import React, { useState } from 'react';
import Settings from './components/Settings';
import MainPopup from './components/MainPopup';
import './index.css';

function App() {
  const [view, setView] = useState('main'); // 'main' | 'settings'

  return (
    <div className="w-[400px] min-h-[500px] bg-white text-gray-900">
      {view === 'settings' ? (
        <Settings onBack={() => setView('main')} />
      ) : (
        <MainPopup onOpenSettings={() => setView('settings')} />
      )}
    </div>
  );
}

export default App;
