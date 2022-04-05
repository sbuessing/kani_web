// Wanikani types
export interface Assignment {
  subject_id: number;
  subject_type: string;
  srs_stage: number;
}
export interface Meaning {
  meaning: string;
  primary: boolean;
}
export interface Reading {
  reading: string;
  primary: boolean;
}
export interface Subject {
  id: number;
  characters: string;
  level: number;
  meanings: Meaning[];
  readings: Reading[];
}
