import * as fs from 'fs';

const VOCAB_FILE = 'assets/jlpt/vocabulary_list.json';

export class JLPT {
  getWords(): Map<string, number> {
    const words = new Map<string, number>();
    const file = JSON.parse(fs.readFileSync(VOCAB_FILE).toString());
    for (const prop in file) {
      const level = Number.parseInt(file[prop]['category']);
      words.set(prop, level);
    }
    return words;
  }
}
