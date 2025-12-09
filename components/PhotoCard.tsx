import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, useAnimation } from 'framer-motion';
import { Trash2, Heart, Save } from 'lucide-react';
import { PhotoItem, SwipeAction } from '../types';

interface PhotoCardProps {
  photo: PhotoItem;
  isFront: boolean;
  onSwipe: (id: string, action: SwipeAction) => void;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({ photo, isFront, onSwipe }) => {
  const controls = useAnimation();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [exitX, setExitX] = useState(0);
  const [exitY, setExitY] = useState(0);

  // Rotation based on X movement
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  
  // Opacity indicators for user feedback
  // Left (Keep) -> Green tint/icon
  const keepOpacity = useTransform(x, [-150, -50], [1, 0]);
  // Up (Delete) -> Red tint/icon
  const deleteOpacity = useTransform(y, [-150, -50], [1, 0]);
  // Down (Favorite) -> Yellow/Blue tint/icon
  const favOpacity = useTransform(y, [50, 150], [0, 1]);

  const handleDragEnd = async (_: any, info: PanInfo) => {
    const threshold = 100;
    const { x: dragX, y: dragY } = info.offset;

    // Prioritize vertical swipes if Y movement is dominant
    const isVertical = Math.abs(dragY) > Math.abs(dragX);

    if (isVertical) {
      if (dragY < -threshold) {
        // Swipe Up: Delete
        setExitY(-1000);
        await controls.start({ y: -1000, transition: { duration: 0.2 } });
        onSwipe(photo.id, 'delete');
        return;
      } else if (dragY > threshold) {
        // Swipe Down: Favorite
        setExitY(1000);
        await controls.start({ y: 1000, transition: { duration: 0.2 } });
        onSwipe(photo.id, 'favorite');
        return;
      }
    } else {
      if (dragX < -threshold) {
        // Swipe Left: Keep/Save
        setExitX(-1000);
        await controls.start({ x: -1000, transition: { duration: 0.2 } });
        onSwipe(photo.id, 'keep');
        return;
      }
      // Note: No right swipe action defined in requirements, bounces back
    }

    // Reset if threshold not met
    controls.start({ x: 0, y: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
  };

  // Prevent interactions if not the front card
  if (!isFront) {
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none scale-95 opacity-50 z-0">
        <div className="relative w-full h-full max-w-md max-h-[80vh] bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
           <img 
            src={photo.url} 
            alt="Next photo" 
            className="w-full h-full object-contain pointer-events-none select-none"
          />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      animate={controls}
      style={{ x, y, rotate, touchAction: 'none' }}
      className="absolute inset-0 flex items-center justify-center z-10 cursor-grab active:cursor-grabbing"
    >
      <div className="relative w-full h-full max-w-md max-h-[80vh] bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800 mx-4">
        <img 
          src={photo.url} 
          alt="User photo" 
          className="w-full h-full object-contain pointer-events-none select-none"
        />

        {/* Overlays for Feedback */}
        
        {/* DELETE OVERLAY (UP) */}
        <motion.div style={{ opacity: deleteOpacity }} className="absolute inset-0 bg-red-500/30 flex items-center justify-center pointer-events-none">
          <div className="bg-red-600 rounded-full p-6 shadow-lg">
            <Trash2 size={48} className="text-white" />
          </div>
          <span className="absolute bottom-20 text-2xl font-bold text-white uppercase tracking-widest drop-shadow-md">Delete</span>
        </motion.div>

        {/* KEEP OVERLAY (LEFT) */}
        <motion.div style={{ opacity: keepOpacity }} className="absolute inset-0 bg-green-500/30 flex items-center justify-center pointer-events-none">
          <div className="bg-green-600 rounded-full p-6 shadow-lg">
             <Save size={48} className="text-white" />
          </div>
           <span className="absolute bottom-20 text-2xl font-bold text-white uppercase tracking-widest drop-shadow-md">Keep</span>
        </motion.div>

        {/* FAVORITE OVERLAY (DOWN) */}
        <motion.div style={{ opacity: favOpacity }} className="absolute inset-0 bg-yellow-500/30 flex items-center justify-center pointer-events-none">
           <div className="bg-yellow-500 rounded-full p-6 shadow-lg">
             <Heart size={48} className="text-white fill-white" />
           </div>
           <span className="absolute bottom-20 text-2xl font-bold text-white uppercase tracking-widest drop-shadow-md">Favorite</span>
        </motion.div>

      </div>
    </motion.div>
  );
};