import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ImagePlus, Settings2, Play } from 'lucide-react';
import { PhotoItem, AppScreen, SwipeAction } from './types';
import { PhotoCard } from './components/PhotoCard';
import { SummaryView } from './components/SummaryView';

const App: React.FC = () => {
  const [screen, setScreen] = useState<AppScreen>('onboarding');
  const [allPhotos, setAllPhotos] = useState<PhotoItem[]>([]);
  const [activeBatch, setActiveBatch] = useState<PhotoItem[]>([]);
  const [processedPhotos, setProcessedPhotos] = useState<PhotoItem[]>([]);
  const [batchSize, setBatchSize] = useState<number>(10);
  
  // Clean up object URLs when component unmounts to prevent memory leaks
  useEffect(() => {
    return () => {
      allPhotos.forEach(p => URL.revokeObjectURL(p.url));
    };
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      // Use explicit casting to handle TypeScript inference issues with Array.from(FileList)
      const newPhotos: PhotoItem[] = Array.from(event.target.files).map((file: any) => ({
        id: uuidv4(),
        file: file as File,
        url: URL.createObjectURL(file as File),
        status: 'pending'
      }));
      
      // Combine with existing if user adds more, or just replace
      setAllPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  const startSession = () => {
    if (allPhotos.length === 0) return;

    // Shuffle photos randomly
    const shuffled = [...allPhotos].sort(() => 0.5 - Math.random());
    
    // Take the batch size
    const batch = shuffled.slice(0, batchSize);
    
    setActiveBatch(batch);
    setProcessedPhotos([]); // Reset processed for this session
    setScreen('swiping');
  };

  const handleSwipe = useCallback((id: string, action: SwipeAction) => {
    if (!action) return;

    // Find the photo and update its status
    const photo = activeBatch.find(p => p.id === id);
    if (!photo) return;

    const updatedPhoto = { ...photo, status: action };
    
    setProcessedPhotos(prev => [...prev, updatedPhoto]);
    
    // Remove from active batch visually
    setActiveBatch(prev => prev.filter(p => p.id !== id));
  }, [activeBatch]);

  // Check if batch is done
  useEffect(() => {
    if (screen === 'swiping' && activeBatch.length === 0 && processedPhotos.length > 0) {
      // Small delay to allow animation to finish
      setTimeout(() => {
        setScreen('summary');
      }, 300);
    }
  }, [activeBatch, screen, processedPhotos]);

  const restart = () => {
    // Revoke URLs of processed photos if we were truly removing them, 
    // but since we might want to keep "kept" ones in a real app, we handle logic here.
    // For this demo, we just go back to start.
    setScreen('onboarding');
    setAllPhotos([]); // Clear for a fresh start or keep? User wants to clean "my phone", implies fresh start usually.
    // Ideally we remove the processed ones from 'allPhotos' if we were maintaining a global state.
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-black text-white overflow-hidden font-sans">
      
      {/* HEADER */}
      <header className="px-6 py-4 flex justify-between items-center z-50">
        <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
          PhotoZen
        </h1>
        {screen === 'swiping' && (
          <div className="text-sm font-medium text-gray-400">
            {activeBatch.length} remaining
          </div>
        )}
      </header>

      <main className="flex-1 relative w-full h-full flex flex-col">
        
        {/* ONBOARDING SCREEN */}
        {screen === 'onboarding' && (
          <div className="flex flex-col items-center justify-center h-full p-6 space-y-8 animate-in fade-in duration-500">
            <div className="text-center space-y-2 max-w-xs">
              <h2 className="text-3xl font-bold">Declutter Your Camera Roll</h2>
              <p className="text-gray-400 text-sm">Upload photos, set a limit, and swipe to clean up your memories.</p>
            </div>

            <div className="w-full max-w-sm bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-xl space-y-6">
              
              {/* File Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">1. Select Photos</label>
                <div className="relative group cursor-pointer">
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    onChange={handleFileUpload} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="h-24 border-2 border-dashed border-gray-600 rounded-xl flex flex-col items-center justify-center group-hover:border-purple-500 transition-colors bg-gray-900/50">
                    <ImagePlus className="mb-2 text-gray-400 group-hover:text-purple-400" />
                    <span className="text-xs text-gray-500">{allPhotos.length > 0 ? `${allPhotos.length} photos loaded` : 'Tap to load photos'}</span>
                  </div>
                </div>
              </div>

              {/* Batch Settings */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Settings2 size={16} /> 2. Batch Size
                </label>
                <input 
                  type="number" 
                  min="1" 
                  max={allPhotos.length || 100}
                  value={batchSize}
                  onChange={(e) => setBatchSize(parseInt(e.target.value) || 5)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500">How many photos to review in this session.</p>
              </div>

              {/* Start Button */}
              <button 
                onClick={startSession}
                disabled={allPhotos.length === 0}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all transform active:scale-95 ${
                  allPhotos.length > 0 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-900/20' 
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Play size={20} className="fill-current" />
                Start Session
              </button>
            </div>
            
            {/* Gesture Guide */}
            <div className="grid grid-cols-3 gap-4 text-center text-xs text-gray-500 w-full max-w-sm mt-8 opacity-60">
               <div>
                  <span className="block text-xl mb-1">⬅️</span>
                  Left to Keep
               </div>
               <div>
                  <span className="block text-xl mb-1">⬆️</span>
                  Up to Delete
               </div>
               <div>
                  <span className="block text-xl mb-1">⬇️</span>
                  Down to Fav
               </div>
            </div>
          </div>
        )}

        {/* SWIPING SCREEN */}
        {screen === 'swiping' && (
          <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden">
             {/* Instructions overlay (fades out visually but keeps text present for reference? No, cleaner UI is better) */}
             <div className="absolute top-4 inset-x-0 flex justify-center gap-4 z-0 pointer-events-none opacity-30">
                <div className="flex flex-col items-center">
                  <span className="text-2xl">⬆️</span>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-red-400">Delete</span>
                </div>
             </div>
             <div className="absolute left-4 inset-y-0 flex items-center z-0 pointer-events-none opacity-30">
                <div className="flex flex-col items-center -rotate-90">
                  <span className="text-2xl">⬅️</span>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-green-400 mt-1">Keep</span>
                </div>
             </div>
             <div className="absolute bottom-4 inset-x-0 flex justify-center z-0 pointer-events-none opacity-30">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-yellow-400 mb-1">Favorite</span>
                  <span className="text-2xl">⬇️</span>
                </div>
             </div>


            {/* The Deck */}
            <div className="relative w-full h-full flex items-center justify-center">
              {activeBatch.map((photo, index) => (
                <PhotoCard 
                  key={photo.id} 
                  photo={photo} 
                  isFront={index === 0}
                  onSwipe={handleSwipe}
                />
              ))}
            </div>
          </div>
        )}

        {/* SUMMARY SCREEN */}
        {screen === 'summary' && (
          <SummaryView processedPhotos={processedPhotos} onRestart={restart} />
        )}

      </main>
    </div>
  );
};

export default App;