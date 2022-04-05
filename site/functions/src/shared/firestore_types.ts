// Types that are used in Firestore.

import { Sentence } from './types';

export interface UserSettings {
  apiKey?: string;
  jlptKnown?: number;
  jlptStudy?: number;
  maxWKLevel?: number;
  words?: UserWord[];
  lastWkUpdate?: number;
}

// A more concise that should summarize in a single array.
export interface UserWord {
  id: number;
  c: string; // characters
  l: number; // Wanikani level
  s?: number; // SRS stage
}

///// Haiku types.  These are stored in Firestore, modify with care.
export interface Haiku {
  user?: string; // Always added at the service layer.
  text?: string;
  timestamp?: number; // Always added at the service layer.
  sentences?: Sentence[];
}
