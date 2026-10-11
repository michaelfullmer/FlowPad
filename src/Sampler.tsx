/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Play, RotateCcw, Volume2, Repeat, Timer, X } from 'lucide-react';
import WaveSurfer from 'wavesurfer.js';
import { SavedSample, SampleChop } from './types';
import { Storage } from './store';
import { motion } from 'motion/react';

interface SamplerProps {
  sampleId?: string;
  songTitle: string;
  onSave: (sample: SavedSample) => void;
}

const PAD_COLORS = [
  '#06b6d4', // Cyan
  '#f59e0b', // Amber
  '#10b981', // Green
  '#8b5cf6', // Purple
];

const DEFAULT_CHOPS: SampleChop[] = [
  { id: 0, start: 0, end: 0.25, pitch: 0, loop: false },
  { id: 1, start: 0.25, end: 0.5, pitch: 0, loop: false },
  { id: 2, start: 0.5, end: 0.75, pitch: 0, loop: false },
  { id: 3, start: 0.75, end: 1, pitch: 0, loop: false },
];

export default function Sampler({ sampleId, songTitle, onSave }: SamplerProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [sampleName, setSampleName] = useState('New Sample');
  const [chops, setChops] = useState<SampleChop[]>(DEFAULT_CHOPS);
  const [activePad, setActivePad] = useState<number | null>(null);
  const [duration, setDuration] = useState(0);
  
  // Ref to track latest chops for drag handlers (prevents stale closures)
  const chopsRef = useRef<SampleChop[]>(chops);
  useEffect(() => {
    chopsRef.current = chops;
  }, [chops]);

  // Tap Tempo state
  const [bpm, setBpm] = useState<number | null>(null);
  const tapTimes = useRef<number[]>([]);

  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const audioContext = useRef<AudioContext | null>(null);
  
  // CACHED BUFFER
  const cachedAudioBuffer = useRef<AudioBuffer | null>(null);

  const decodeAndCache = async (url: string) => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const decoded = await audioContext.current.decodeAudioData(arrayBuffer);
      cachedAudioBuffer.current = decoded;
    } catch (err) {
      console.error('Failed to decode audio:', err);
    }
  };

  useEffect(() => {
    if (waveformRef.current) {
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#4b5563',
        progressColor: '#06b6d4',
        cursorColor: '#06b6d4',
        barWidth: 2,
        barRadius: 3,
        height: 120,
        normalize: true,
      });

      wavesurfer.current.on('ready', () => {
        setDuration(wavesurfer.current?.getDuration() || 0);
      });

      // Load existing sample if provided
      if (sampleId) {
        const samples = Storage.getSamples();
        const sample = samples[sampleId];
        if (sample) {
          setAudioUrl(sample.audioData);
          setChops(sample.chops);
          setSampleName(sample.name || 'Saved Sample');
          wavesurfer.current.load(sample.audioData);
          decodeAndCache(sample.audioData);
        }
      }
    }

    return () => wavesurfer.current?.destroy();
  }, [sampleId]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        audioChunks.current.push(e.data);
      };

      mediaRecorder.current.onstop = async () => {
        const blob = new Blob(audioChunks.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        wavesurfer.current?.load(url);
        decodeAndCache(url);
        
        // Convert to base64 for storage
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64 = reader.result as string;
          onSave({ 
            id: sampleId || Math.random().toString(36).substr(2, 9), 
            name: sampleName,
            audioData: base64, 
            chops 
          });
        };
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      
      setTimeout(() => {
        if (mediaRecorder.current?.state === 'recording') stopRecording();
      }, 30000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    setIsRecording(false);
  };

  const playPad = async (padIndex: number) => {
    if (!cachedAudioBuffer.current || !audioContext.current) return;

    const chop = chops[padIndex];
    const source = audioContext.current.createBufferSource();
    source.buffer = cachedAudioBuffer.current;
    
    source.playbackRate.value = Math.pow(2, chop.pitch / 12);
    source.loop = chop.loop;

    const startTime = chop.start * cachedAudioBuffer.current.duration;
    const durationToPlay = (chop.end - chop.start) * cachedAudioBuffer.current.duration;

    source.connect(audioContext.current.destination);
    source.start(0, startTime, durationToPlay);
    
    setActivePad(padIndex);
    source.onended = () => setActivePad(null);
  };

  const updateChop = (index: number, updates: Partial<SampleChop>, skipSave = false) => {
    const newChops = [...chops];
    newChops[index] = { ...newChops[index], ...updates };
    setChops(newChops);
    
    if (audioUrl && !skipSave) {
      onSave({ 
        id: sampleId || Math.random().toString(36).substr(2, 9), 
        name: sampleName,
        audioData: audioUrl, 
        chops: newChops 
      });
    }
  };

  const handleTap = () => {
    const now = Date.now();
    tapTimes.current.push(now);
    
    if (tapTimes.current.length > 4) {
      tapTimes.current.shift();
    }
    
    if (tapTimes.current.length > 1) {
      const intervals = [];
      for (let i = 1; i < tapTimes.current.length; i++) {
        intervals.push(tapTimes.current[i] - tapTimes.current[i-1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b) / intervals.length;
      setBpm(Math.round(60000 / avgInterval));
    }
  };

  const resetTap = () => {
    tapTimes.current = [];
    setBpm(null);
  };

  const handleMarkerDrag = (e: React.MouseEvent | React.TouchEvent, index: number, type: 'start' | 'end') => {
    if (!waveformRef.current) return;
    
    const rect = waveformRef.current.getBoundingClientRect();
    const moveHandler = (moveEvent: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : (moveEvent as MouseEvent).clientX;
      let pos = (clientX - rect.left) / rect.width;
      pos = Math.max(0, Math.min(1, pos));
      
      // Use ref to get latest state during drag
      const currentChops = chopsRef.current;
      const chop = currentChops[index];
      const MIN_GAP = 0.05;

      if (type === 'start') {
        if (pos > chop.end - MIN_GAP) pos = chop.end - MIN_GAP;
      } else {
        if (pos < chop.start + MIN_GAP) pos = chop.start + MIN_GAP;
      }
      
      // Update state immediately for UI, but skip onSave until drag ends
      updateChop(index, { [type]: pos }, true);
    };

    const upHandler = () => {
      window.removeEventListener('mousemove', moveHandler);
      window.removeEventListener('mouseup', upHandler);
      window.removeEventListener('touchmove', moveHandler);
      window.removeEventListener('touchend', upHandler);

      // Final save when drag ends
      if (audioUrl) {
        onSave({ 
          id: sampleId || Math.random().toString(36).substr(2, 9), 
          name: sampleName,
          audioData: audioUrl, 
          chops: chopsRef.current 
        });
      }
    };

    window.addEventListener('mousemove', moveHandler);
    window.addEventListener('mouseup', upHandler);
    window.addEventListener('touchmove', moveHandler);
    window.addEventListener('touchend', upHandler);
  };

  return (
    <div className="flex flex-col h-full bg-[#0f0f0f] text-white p-4 pb-24 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col">
          <input
            type="text"
            value={sampleName}
            onChange={(e) => {
              setSampleName(e.target.value);
              if (audioUrl) {
                onSave({ 
                  id: sampleId || Math.random().toString(36).substr(2, 9), 
                  name: e.target.value,
                  audioData: audioUrl, 
                  chops 
                });
              }
            }}
            className="bg-transparent text-xl font-bold text-cyan-400 focus:outline-none border-b border-transparent focus:border-cyan-400/30"
            placeholder="Sample Name"
          />
          <span className="text-[10px] text-white/30 uppercase tracking-widest mt-1">
            Linking to: {songTitle}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2">
              <button 
                onClick={resetTap}
                className="text-[10px] text-white/20 hover:text-white/40 uppercase tracking-widest"
              >
                Reset
              </button>
              <span className="text-[10px] text-white/30 uppercase tracking-widest">BPM</span>
            </div>
            <span className="text-lg font-mono text-cyan-400">{bpm || '--'}</span>
          </div>
          <button
            onClick={handleTap}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-cyan-400 transition-all active:scale-90"
          >
            <Timer size={20} />
          </button>
        </div>
      </div>

      {/* Waveform Area */}
      <div className="bg-zinc-900/50 rounded-2xl p-4 mb-6 border border-white/5 relative">
        <div ref={waveformRef} className="mb-4 relative z-0" />
        
        {/* Draggable Markers Overlay */}
        {audioUrl && (
          <div className="absolute inset-0 top-4 left-4 right-4 h-[120px] pointer-events-none">
            {chops.map((chop, i) => (
              <React.Fragment key={i}>
                {/* Region Highlight */}
                <div 
                  className="absolute top-0 bottom-0 opacity-20"
                  style={{ 
                    left: `${chop.start * 100}%`, 
                    width: `${(chop.end - chop.start) * 100}%`,
                    backgroundColor: PAD_COLORS[i]
                  }}
                />
                
                {/* Start Marker */}
                <div 
                  className="absolute top-0 bottom-0 w-[24px] flex justify-center pointer-events-auto cursor-ew-resize z-10 -ml-[12px]"
                  style={{ left: `${chop.start * 100}%` }}
                  onMouseDown={(e) => handleMarkerDrag(e, i, 'start')}
                  onTouchStart={(e) => handleMarkerDrag(e, i, 'start')}
                >
                  <div className="w-0.5 h-full" style={{ backgroundColor: PAD_COLORS[i] }} />
                  <div className="absolute top-0 w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: PAD_COLORS[i] }} />
                  <div className="absolute -top-5 text-[8px] font-mono whitespace-nowrap" style={{ color: PAD_COLORS[i] }}>
                    S{i+1}
                  </div>
                </div>
                {/* End Marker */}
                <div 
                  className="absolute top-0 bottom-0 w-[24px] flex justify-center pointer-events-auto cursor-ew-resize z-10 -ml-[12px]"
                  style={{ left: `${chop.end * 100}%` }}
                  onMouseDown={(e) => handleMarkerDrag(e, i, 'end')}
                  onTouchStart={(e) => handleMarkerDrag(e, i, 'end')}
                >
                  <div className="w-0.5 h-full opacity-50" style={{ backgroundColor: PAD_COLORS[i] }} />
                  <div className="absolute bottom-0 w-3 h-3 rounded-full shadow-lg opacity-50" style={{ backgroundColor: PAD_COLORS[i] }} />
                  <div className="absolute -bottom-5 text-[8px] font-mono opacity-50 whitespace-nowrap" style={{ color: PAD_COLORS[i] }}>
                    E{i+1}
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        )}
        
        <div className="flex justify-center gap-4 mt-6">
          {!audioUrl ? (
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                isRecording ? 'bg-red-500 animate-pulse' : 'bg-cyan-500 hover:bg-cyan-400 shadow-lg shadow-cyan-500/20'
              }`}
            >
              {isRecording ? <Square fill="white" /> : <Mic size={32} />}
            </button>
          ) : (
            <button
              onClick={() => { setAudioUrl(null); wavesurfer.current?.empty(); cachedAudioBuffer.current = null; }}
              className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-full text-sm flex items-center gap-2 transition-colors border border-white/5"
            >
              <RotateCcw size={16} />
              <span>Reset Sample</span>
            </button>
          )}
        </div>
      </div>

      {/* Chop Pads */}
      <div className="grid grid-cols-2 gap-4 flex-1">
        {chops.map((chop, i) => (
          <div key={i} className="bg-zinc-900/50 rounded-2xl p-4 border border-white/5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Pad {i + 1}</span>
                <span className="text-[8px] font-mono text-white/20">
                  {(chop.start * duration).toFixed(2)}s - {(chop.end * duration).toFixed(2)}s
                </span>
              </div>
              <button 
                onClick={() => updateChop(i, { loop: !chop.loop })}
                className={`p-1.5 rounded-lg transition-colors ${chop.loop ? 'bg-opacity-10' : 'text-white/20 hover:bg-white/5'}`}
                style={{ 
                  color: chop.loop ? PAD_COLORS[i] : undefined,
                  backgroundColor: chop.loop ? `${PAD_COLORS[i]}1a` : undefined 
                }}
              >
                <Repeat size={14} />
              </button>
            </div>
            
            <button
              onClick={() => playPad(i)}
              disabled={!audioUrl}
              className={`flex-1 min-h-[80px] rounded-xl flex items-center justify-center transition-all shadow-lg shadow-black/20 ${
                activePad === i ? 'scale-95' : 'bg-white/5 hover:bg-white/10 text-white/40'
              } disabled:opacity-20`}
              style={{ 
                backgroundColor: activePad === i ? PAD_COLORS[i] : undefined,
                color: activePad === i ? 'black' : undefined
              }}
            >
              {!audioUrl ? (
                <Mic size={24} className="opacity-20" />
              ) : (
                <Play fill={activePad === i ? 'black' : 'none'} size={32} />
              )}
            </button>

            <div className="flex items-center gap-2">
              <Volume2 size={12} className="text-white/20" />
              <input
                type="range"
                min="-12"
                max="12"
                value={chop.pitch}
                onChange={(e) => updateChop(i, { pitch: parseInt(e.target.value) })}
                className="flex-1 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                style={{ accentColor: PAD_COLORS[i] }}
              />
              <span className="text-[10px] font-mono w-6 text-right" style={{ color: PAD_COLORS[i] }}>
                {chop.pitch > 0 ? '+' : ''}{chop.pitch}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
