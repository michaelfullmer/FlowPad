/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SongDraft } from './types';
import { Music, FileText, Trash2, ChevronRight, Clock, Activity } from 'lucide-react';

interface SongListProps {
  songs: SongDraft[];
  onSelect: (song: SongDraft) => void;
  onDelete: (id: string) => void;
}

export default function SongList({ songs, onSelect, onDelete }: SongListProps) {
  if (songs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white/20 p-8 text-center bg-[#0f0f0f]">
        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/5">
          <FileText size={40} />
        </div>
        <h3 className="text-xl font-bold mb-2 text-white/40">No songs yet.</h3>
        <p className="text-sm">Hit Write to start your first track.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0f0f0f] text-white p-4 pb-24 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6 text-cyan-400">My Songs</h2>
      
      <div className="space-y-3">
        {songs.sort((a, b) => b.updatedAt - a.updatedAt).map((song) => {
          const firstLine = song.lines[0]?.text || '';
          
          return (
            <div
              key={song.id}
              className="group bg-zinc-900/50 border border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:border-cyan-400/30 transition-all cursor-pointer relative overflow-hidden active:bg-white/5"
              onClick={() => onSelect(song)}
            >
              <div className="w-12 h-12 rounded-xl bg-cyan-400/10 flex items-center justify-center text-cyan-400 border border-cyan-400/20 shrink-0">
                {song.sampleId ? <Music size={24} /> : <FileText size={24} />}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold truncate">{song.title || 'Untitled Song'}</h3>
                  {song.sampleId && (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 bg-cyan-400/20 rounded text-cyan-400 text-[8px] font-bold uppercase tracking-tighter shrink-0">
                      <Activity size={10} />
                      Sample
                    </div>
                  )}
                </div>
                
                {firstLine && (
                  <p className="text-xs text-white/30 italic truncate mt-0.5">
                    "{firstLine}"
                  </p>
                )}

                <div className="flex items-center gap-3 text-[10px] text-white/30 uppercase tracking-widest mt-1.5">
                  <span className="flex items-center gap-1">
                    <Clock size={10} />
                    {new Date(song.updatedAt).toLocaleDateString()}
                  </span>
                  <span>{song.lines.length} Lines</span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Delete this song?')) onDelete(song.id);
                }}
                className="p-2 text-white/10 hover:text-red-400 transition-colors opacity-30 md:opacity-0 group-hover:opacity-100 active:opacity-100 shrink-0"
              >
                <Trash2 size={18} />
              </button>
              
              <ChevronRight size={20} className="text-white/10 shrink-0" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
