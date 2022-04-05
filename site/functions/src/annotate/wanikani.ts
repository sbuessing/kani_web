import * as fs from 'fs';
import { Subject } from '../shared/wanikani_types';

const VOCAB_FILE = 'assets/wanikani/vocabulary.json';
const KANJI_FILE = 'assets/wanikani/kanji.json';

// TODO: This is a copy paste of the desktop version, this will probably always use compiled data.
export class Wanikani {
  async getWords(useCache: boolean): Promise<Subject[]> {
    let words: Subject[];
    if (!fs.existsSync(VOCAB_FILE)) {
      console.log(`Can't find vocab file!`);
    } else {
      console.log(`Loading Wanikani vocab cache`);
      words = JSON.parse(fs.readFileSync(VOCAB_FILE).toString());
    }
    console.log(`Loaded ${words.length} Wanikani vocabulary.`);
    return words;
  }

  async getKanji(useCache: boolean): Promise<Subject[]> {
    // TODO: Consider writing minified copies to the server.
    let kanji: Subject[];
    if (!fs.existsSync(KANJI_FILE)) {
      console.log(`Can't fine kanji file!`);
    } else {
      console.log(`Loading Wanikani kanji cache`);
      kanji = JSON.parse(fs.readFileSync(KANJI_FILE).toString());
    }
    console.log(`Loaded ${kanji.length} Wanikani kanji.`);
    return kanji;
  }
}
