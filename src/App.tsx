/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SongDraft, SavedSample } from './types';
import { Storage } from './store';
import LyricEditor from './LyricEditor';
import Sampler from './Sampler';
import SongList from './SongList';
import { PenTool, Music, Library, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Tab = 'write' | 'sample' | 'songs';

const EMPTY_SONG: SongDraft = {
  id: '',
  title: '',
  lines: [{ id: '1', text: '' }],
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('write');
  const [currentSong, setCurrentSong] = useState<SongDraft>({ ...EMPTY_SONG, id: Math.random().toString(36).substr(2, 9) });
  const [savedSongs, setSavedSongs] = useState<SongDraft[]>([]);

  useEffect(() => {
    setSavedSongs(Storage.getSongs());
  }, []);

  const handleSaveSong = (song: SongDraft) => {
    Storage.saveSong(song);
    setSavedSongs(Storage.getSongs());
  };

  const handleNewSong = () => {
    const newSong = { ...EMPTY_SONG, id: Math.random().toString(36).substr(2, 9) };
    setCurrentSong(newSong);
    setActiveTab('write');
  };

  const handleSelectSong = (song: SongDraft) => {
    setCurrentSong(song);
    setActiveTab('write');
  };

  const handleDeleteSong = (id: string) => {
    Storage.deleteSong(id);
    setSavedSongs(Storage.getSongs());
    if (currentSong.id === id) {
      handleNewSong();
    }
  };

  const handleSaveSample = (sample: SavedSample) => {
    const samples = Storage.getSamples();
    samples[sample.id] = sample;
    Storage.saveSamples(samples);
    
    const updatedSong = { ...currentSong, sampleId: sample.id };
    setCurrentSong(updatedSong);
    handleSaveSong(updatedSong);
  };

  return (
    <div className="fixed inset-0 bg-[#0f0f0f] flex flex-col font-sans selection:bg-cyan-400/30">
      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {activeTab === 'write' && (
            <motion.div
              key="write"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full"
            >
              <LyricEditor
                song={currentSong}
                onUpdate={(s) => {
                  setCurrentSong(s);
                  handleSaveSong(s);
                }}
                onOpenSampler={() => setActiveTab('sample')}
              />
            </motion.div>
          )}

          {activeTab === 'sample' && (
            <motion.div
              key="sample"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="h-full"
            >
              <Sampler
                sampleId={currentSong.sampleId}
                songTitle={currentSong.title || 'Untitled Song'}
                onSave={handleSaveSample}
              />
            </motion.div>
          )}

          {activeTab === 'songs' && (
            <motion.div
              key="songs"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full"
            >
              <SongList
                songs={savedSongs}
                onSelect={handleSelectSong}
                onDelete={handleDeleteSong}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Action Button for New Song */}
        {activeTab === 'songs' && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={handleNewSong}
            className="fixed bottom-24 right-6 w-14 h-14 bg-cyan-400 text-black rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform z-30"
          >
            <Plus size={32} />
          </motion.button>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="h-20 bg-zinc-900/80 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-6 pb-2 z-40">
        <NavButton
          active={activeTab === 'write'}
          onClick={() => setActiveTab('write')}
          icon={<PenTool size={24} />}
          label="Write"
        />
        
        <NavButton
          active={activeTab === 'sample'}
          onClick={() => setActiveTab('sample')}
          icon={<Music size={24} />}
          label="Sample"
        />

        {/* Logo in center - visually floating */}
        <div className="flex flex-col items-center -mt-10 pointer-events-none">
          <div className="w-16 h-16 bg-black rounded-full p-2 border-4 border-zinc-900 shadow-2xl pointer-events-auto">
            <img 
              src="https://i.imgur.com/dzZyFUC.png" 
              alt="FlowPad Logo" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        <NavButton
          active={activeTab === 'songs'}
          onClick={() => setActiveTab('songs')}
          icon={<Library size={24} />}
          label="Library"
        />
      </nav>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all ${
        active ? 'text-cyan-400 scale-110' : 'text-white/30 hover:text-white/60'
      }`}
    >
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      {active && (
        <motion.div
          layoutId="nav-indicator"
          className="w-1 h-1 bg-cyan-400 rounded-full mt-1"
        />
      )}
    </button>
  );
}
