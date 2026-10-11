/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { SectionType, SongDraft } from './types';
import { countSyllables, getRhymes } from './songUtils';
import { Plus, Trash2, Music, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LyricEditorProps {
  song: SongDraft;
  onUpdate: (song: SongDraft) => void;
  onOpenSampler: () => void;
}

const SECTIONS: SectionType[] = ['Intro', 'Verse', 'Chorus', 'Bridge', 'Outro'];

export default function LyricEditor({ song, onUpdate, onOpenSampler }: LyricEditorProps) {
  const [activeLineIndex, setActiveLineIndex] = useState<number | null>(null);
  const [rhymes, setRhymes] = useState<string[]>([]);
  const editorRef = useRef<HTMLDivElement>(null);
  
  const handleLineChange = (index: number, text: string) => {
    const newLines = [...song.lines];
    newLines[index] = { ...newLines[index], text };
    onUpdate({ ...song, lines: newLines });
    
    // Update rhymes for the last word
    const words = text.trim().split(/\s+/);
    if (words.length > 0) {
      const lastWord = words[words.length - 1];
      setRhymes(getRhymes(lastWord));
    } else {
      setRhymes([]);
    }
  };

  const addLine = (index: number) => {
    const newLines = [...song.lines];
    newLines.splice(index + 1, 0, { id: Math.random().toString(36).substr(2, 9), text: '' });
    onUpdate({ ...song, lines: newLines });
    setActiveLineIndex(index + 1);
  };

  const removeLine = (index: number) => {
    if (song.lines.length <= 1) return;
    const newLines = song.lines.filter((_, i) => i !== index);
    onUpdate({ ...song, lines: newLines });
    setActiveLineIndex(null);
  };

  const setSection = (index: number, section: SectionType) => {
    const newLines = [...song.lines];
    newLines[index] = { ...newLines[index], section };
    onUpdate({ ...song, lines: newLines });
  };

  // Keyboard dismiss on tap outside
  const handleContainerClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (editorRef.current && !editorRef.current.contains(e.target as Node))) {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      setActiveLineIndex(null);
    }
  };

  return (
    <div 
      className="flex flex-col h-full bg-[#0f0f0f] text-white pb-24"
      onClick={handleContainerClick}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#0f0f0f] z-10">
        <input
          type="text"
          value={song.title}
          onChange={(e) => onUpdate({ ...song, title: e.target.value })}
          placeholder="Song Title"
          className="bg-transparent text-xl font-bold focus:outline-none text-cyan-400 placeholder:text-white/20"
        />
        <div className="flex gap-2">
          <button
            onClick={onOpenSampler}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-cyan-400 transition-colors border border-white/5"
            title="Open Sampler"
          >
            <Music size={20} />
          </button>
        </div>
      </div>

      {/* Editor */}
      <div ref={editorRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {song.lines.map((line, index) => (
          <div key={line.id} className="group relative">
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center pt-2">
                <div className="relative">
                  <select
                    value={line.section || ''}
                    onChange={(e) => setSection(index, e.target.value as SectionType)}
                    className="appearance-none bg-white/5 text-[10px] uppercase tracking-wider px-2 py-1 rounded border border-white/10 focus:outline-none focus:border-cyan-400 pr-6"
                  >
                    <option value="">Label</option>
                    {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                </div>
                <span className="text-[10px] text-white/30 mt-1 font-mono">
                  {countSyllables(line.text)}
                </span>
              </div>
              
              <textarea
                value={line.text}
                onChange={(e) => handleLineChange(index, e.target.value)}
                onFocus={() => setActiveLineIndex(index)}
                placeholder="Write a line..."
                rows={1}
                className="flex-1 bg-transparent resize-none focus:outline-none text-lg py-1 border-b border-transparent focus:border-cyan-400/30 transition-colors placeholder:text-white/10"
                style={{ height: 'auto' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = target.scrollHeight + 'px';
                }}
              />

              <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => addLine(index)} className="p-1 hover:text-cyan-400"><Plus size={16} /></button>
                <button onClick={() => removeLine(index)} className="p-1 hover:text-red-400"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
        
        <button
          onClick={() => addLine(song.lines.length - 1)}
          className="w-full py-4 border-2 border-dashed border-white/5 rounded-xl text-white/20 hover:text-cyan-400 hover:border-cyan-400/30 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          <span>Add Line</span>
        </button>
      </div>

      {/* Rhyme Panel */}
      <AnimatePresence>
        {activeLineIndex !== null && rhymes.length > 0 && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-24 left-4 right-4 bg-zinc-900 border border-white/10 rounded-2xl p-4 shadow-2xl z-20"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Rhyme Suggestions</span>
              <button onClick={() => setRhymes([])} className="text-white/20 hover:text-white">×</button>
            </div>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {rhymes.map((rhyme, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-cyan-400/10 text-cyan-400 rounded-full text-sm border border-cyan-400/20"
                >
                  {rhyme}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
