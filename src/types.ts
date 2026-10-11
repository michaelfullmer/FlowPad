/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SectionType = 'Intro' | 'Verse' | 'Chorus' | 'Bridge' | 'Outro';

export interface LyricLine {
  id: string;
  text: string;
  section?: SectionType;
}

export interface SongDraft {
  id: string;
  title: string;
  lines: LyricLine[];
  sampleId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface SampleChop {
  id: number;
  start: number; // 0 to 1
  end: number;   // 0 to 1
  pitch: number; // -12 to 12
  loop: boolean;
}

export interface SavedSample {
  id: string;
  name: string;
  audioData: string; // base64 or blob URL
  chops: SampleChop[];
}
