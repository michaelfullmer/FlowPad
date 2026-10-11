/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SongDraft, SavedSample } from './types';

const SONGS_KEY = 'flowpad_songs';
const SAMPLES_KEY = 'flowpad_samples';

export const Storage = {
  getSongs: (): SongDraft[] => {
    const data = localStorage.getItem(SONGS_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  saveSongs: (songs: SongDraft[]) => {
    localStorage.setItem(SONGS_KEY, JSON.stringify(songs));
  },
  
  getSamples: (): Record<string, SavedSample> => {
    const data = localStorage.getItem(SAMPLES_KEY);
    return data ? JSON.parse(data) : {};
  },
  
  saveSamples: (samples: Record<string, SavedSample>) => {
    localStorage.setItem(SAMPLES_KEY, JSON.stringify(samples));
  },
  
  saveSong: (song: SongDraft) => {
    const songs = Storage.getSongs();
    const index = songs.findIndex(s => s.id === song.id);
    if (index >= 0) {
      songs[index] = { ...song, updatedAt: Date.now() };
    } else {
      songs.push({ ...song, createdAt: Date.now(), updatedAt: Date.now() });
    }
    Storage.saveSongs(songs);
  },
  
  deleteSong: (id: string) => {
    const songs = Storage.getSongs();
    const song = songs.find(s => s.id === id);
    if (song?.sampleId) {
      const samples = Storage.getSamples();
      delete samples[song.sampleId];
      Storage.saveSamples(samples);
    }
    Storage.saveSongs(songs.filter(s => s.id !== id));
  }
};
