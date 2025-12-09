import React from 'react';
import { PhotoItem } from '../types';
import { Trash2, Heart, RefreshCw, CheckCircle } from 'lucide-react';

interface SummaryViewProps {
  processedPhotos: PhotoItem[];
  onRestart: () => void;
}

export const SummaryView: React.FC<SummaryViewProps> = ({ processedPhotos, onRestart }) => {
  const toDelete = processedPhotos.filter(p => p.status === 'deleted');
  const kept = processedPhotos.filter(p => p.status === 'kept');
  const favorites = processedPhotos.filter(p => p.status === 'favorite');

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto p-6 overflow-y-auto">
      <h2 className="text-3xl font-bold mb-6 mt-4 text-center">Session Complete</h2>

      {/* Delete Section */}
      <div className="bg-red-900/20 border border-red-900/50 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-3 text-red-400">
          <Trash2 size={24} />
          <h3 className="text-xl font-semibold">Marked for Deletion ({toDelete.length})</h3>
        </div>
        <p className="text-sm text-gray-400 mb-4">
          Due to browser security on iOS, this web app cannot physically delete files. 
          Please manually remove these items from your Photos app.
        </p>
        <div className="grid grid-cols-4 gap-2">
          {toDelete.map(photo => (
            <div key={photo.id} className="aspect-square relative rounded-md overflow-hidden bg-gray-800">
              <img src={photo.url} className="w-full h-full object-cover opacity-70" alt="To delete" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Trash2 size={16} className="text-red-500" />
              </div>
            </div>
          ))}
        </div>
        {toDelete.length === 0 && <p className="text-gray-500 italic">No photos marked for deletion.</p>}
      </div>

      {/* Favorites Section */}
      <div className="bg-yellow-900/20 border border-yellow-900/50 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-3 text-yellow-400">
          <Heart size={24} className="fill-yellow-400" />
          <h3 className="text-xl font-semibold">Favorites ({favorites.length})</h3>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {favorites.map(photo => (
            <div key={photo.id} className="aspect-square rounded-md overflow-hidden bg-gray-800">
              <img src={photo.url} className="w-full h-full object-cover" alt="Favorite" />
            </div>
          ))}
        </div>
        {favorites.length === 0 && <p className="text-gray-500 italic">No favorites selected.</p>}
      </div>

       {/* Kept Section */}
       <div className="bg-green-900/20 border border-green-900/50 rounded-xl p-4 mb-8">
        <div className="flex items-center gap-2 mb-3 text-green-400">
          <CheckCircle size={24} />
          <h3 className="text-xl font-semibold">Kept ({kept.length})</h3>
        </div>
        <p className="text-sm text-gray-500">Photos you swiped left to keep.</p>
      </div>

      <button
        onClick={onRestart}
        className="w-full py-4 bg-white text-black rounded-full font-bold text-lg flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors mb-10"
      >
        <RefreshCw size={20} />
        Start New Batch
      </button>
    </div>
  );
};