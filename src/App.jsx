import React, { useState } from 'react';
import Settings from './components/Settings';
import MainPopup from './components/MainPopup';
import './index.css';

function App(props) {
  const [view, setView] = useState('main'); // 'main' | 'settings'

  return (
    <div className="w-[400px] min-h-[500px] bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 font-sans antialiased flex flex-col">
      {view === 'settings' ? (
        <Settings onBack={() => setView('main')} />
      ) : (
        <MainPopup onOpenSettings={() => setView('settings')} onClose={props.onClose} />
      )}
    </div>
  );
}

export default App;
