import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';
import { StoreData } from './types';

function App() {
  const [data, setData] = useState<StoreData[] | null>(null);

  const handleDataLoaded = (loadedData: StoreData[]) => {
    setData(loadedData);
  };

  const handleReset = () => {
    setData(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-10">
      <nav className="bg-white border-b border-yellow-400 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
           <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center text-white font-bold text-xl">H</div>
             <span className="font-bold text-xl tracking-tight text-gray-800">HAVANNA <span className="text-yellow-600 font-light">ANALYTICS</span></span>
           </div>
           <div className="text-xs text-gray-400">
             v1.0.0
           </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!data ? (
          <div className="animate-fade-in-up">
             <FileUpload onDataLoaded={handleDataLoaded} />
          </div>
        ) : (
          <Dashboard data={data} onReset={handleReset} />
        )}
      </main>
    </div>
  );
}

export default App;