import React, { useState } from 'react';
import { VocabularyItem } from '../types';
import { Volume2, RotateCw } from 'lucide-react';

interface FlashcardProps {
  item: VocabularyItem;
  onNext?: () => void;
}

export const Flashcard: React.FC<FlashcardProps> = ({ item, onNext }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    const utterance = new SpeechSynthesisUtterance(item.english);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const toggleFlip = () => setIsFlipped(!isFlipped);

  // Reset flip state when item changes
  React.useEffect(() => {
    setIsFlipped(false);
  }, [item]);

  return (
    <div 
      className="w-full h-80 sm:h-96 perspective-1000 cursor-pointer group"
      onClick={toggleFlip}
    >
      <div className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}>
        
        {/* Front Face (English) */}
        <div className="absolute w-full h-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 flex flex-col items-center justify-center backface-hidden">
          <div className="absolute top-4 right-4 text-slate-400 text-sm font-medium uppercase tracking-wider">
            English
          </div>
          
          <h2 className="text-4xl font-bold text-slate-800 text-center mb-2">{item.english}</h2>
          <p className="text-slate-500 font-mono text-lg mb-6">/{item.transcription}/</p>
          
          <button 
            onClick={handleSpeak}
            className="p-3 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
            title="Прослушать"
          >
            <Volume2 size={24} />
          </button>
          
          <div className="absolute bottom-6 flex items-center text-slate-400 text-sm">
            <RotateCw size={16} className="mr-2" />
            Нажмите, чтобы перевернуть
          </div>
        </div>

        {/* Back Face (Russian + Context) */}
        <div className="absolute w-full h-full bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl shadow-xl border border-indigo-100 p-8 flex flex-col items-center justify-center backface-hidden rotate-y-180">
          <div className="absolute top-4 right-4 text-indigo-400 text-sm font-medium uppercase tracking-wider">
            Русский
          </div>

          <h3 className="text-3xl font-bold text-indigo-900 text-center mb-4">{item.russian}</h3>
          
          <div className="text-center space-y-4 w-full">
            <div className="bg-white/60 p-3 rounded-lg backdrop-blur-sm">
              <p className="text-xs text-indigo-500 uppercase font-semibold mb-1">Определение</p>
              <p className="text-slate-700 italic">"{item.definition}"</p>
            </div>
            
            <div className="bg-white/60 p-3 rounded-lg backdrop-blur-sm">
               <p className="text-xs text-indigo-500 uppercase font-semibold mb-1">Пример</p>
               <p className="text-slate-800 font-medium">"{item.example}"</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};