import * as fs from 'fs';

// I can't link this file due to a VS issue. I need it in the project to debug. 
// https://github.com/microsoft/vscode/issues/25312
import { Sentence, SentenceSet, SentenceWord, WordStats } from "../../site/functions/src/shared/types";

const RAW_SENTENCES = 'assets/tatoeba/sentences.csv';
const RAW_LINKS = 'assets/tatoeba/links.csv';
const PAIRED_SENTENCES = 'assets/tatoeba/paired_sentences.json';
const WORD_SENTENCE_DIRECTORY = 'assets/words/';
const WORD_SUMMARY = WORD_SENTENCE_DIRECTORY + 'summary.json';

export class SentenceStore {

  constructor(private maxWordsPerFile: number = 10) { }

  public getPairedSentences(useCached: boolean): Sentence[] {
    if (useCached && fs.existsSync(PAIRED_SENTENCES)) {
      const sentencesJson = fs.readFileSync(PAIRED_SENTENCES).toString();
      const sentences: Sentence[] = JSON.parse(sentencesJson);
      return sentences;
    }

    const englishSentences = new Map<number, string>();
    const japaneseSentences = new Map<number, Sentence>();
    fs.readFileSync(RAW_SENTENCES).toString().split('\n').forEach(line => {
      const parts: string[] = line.split('\t');
      if (parts[1] === 'eng') {
        englishSentences.set(Number.parseInt(parts[0]), parts[2]);
      } else if (parts[1] === 'jpn') {
        japaneseSentences.set(Number.parseInt(parts[0]), { japanese: parts[2], english: "" });
      }
    });
    console.log(`There are ${japaneseSentences.size} japanese and ${englishSentences.size} english`);

    const links = fs.readFileSync(RAW_LINKS).toString().split('\n').forEach(link => {
      const parts = link.split('\t');
      const japaneseSentence = japaneseSentences.get(Number.parseInt(parts[0]));
      const englishSentence = englishSentences.get(Number.parseInt(parts[1]));
      if (japaneseSentence && englishSentence?.length > 3) {
        japaneseSentence.english = englishSentence;
        japaneseSentence.key = parts[0];
      }
    });
    const filtered = Array.from(japaneseSentences.values()).filter(sentence => sentence.english.length > 5);
    console.log(filtered.length + " paired sentences");
    fs.writeFileSync(PAIRED_SENTENCES, JSON.stringify(filtered));
    return filtered;
  }

  // TODO(sbuessing: Could there be contention here?)
  public writeSentence(sentence: Sentence) {
    sentence.words.forEach(word => {
      if (word.wk) {
        this.writeSentenceForWord(word, sentence);
      }
    });
  }

  public writeSummary(summary: string) {
    fs.writeFileSync(WORD_SUMMARY, summary);
  }

  public getSummary(): WordStats[] {
    return JSON.parse(fs.readFileSync(WORD_SUMMARY).toString());
  }


  public writeSentenceForWord(word: SentenceWord, sentence: Sentence) {
    const set = this.getSentencesForWord(word);
    const score = this.scoreForWord(word, sentence);
    if (score < set.worstScore) {
      return;
    }
    if (set.sentences.filter(f => f.key === sentence.key).length > 0) {
      return;
    }
    if (set.sentences.length < this.maxWordsPerFile) {
      set.sentences.push(sentence);
      sentence.score = score;
      if (score < set.worstScore) {
        set.worstScore = score;
      }
    } else { // try to add to file.
      sentence.score = score;
      let best = set.sentences;
      best.push(sentence);
      best.sort((a, b) => b.score - a.score);
      set.sentences = best.slice(0, this.maxWordsPerFile);
      set.worstScore = set.sentences[set.sentences.length - 1].score;
    }
    fs.writeFileSync(WORD_SENTENCE_DIRECTORY + word.wkid + '.json', JSON.stringify(set));
  }

  // TODO: Move scoring out to the pipeline and make configurable.
  public scoreForWord(word: SentenceWord, sentence: Sentence): number {
    let badKanji = 0;
    sentence.words.forEach(eachWord => {
      let isUnknownKanji = eachWord.def != null && eachWord.wk == null;
      let isBiggerWK = eachWord.wk && eachWord.wkLevel > word.wkLevel;
      if (isUnknownKanji || isBiggerWK) { badKanji++; }
    });
    return 100 - badKanji;
  }

  public getSentencesForWord(word: SentenceWord): SentenceSet {
    if (fs.existsSync(WORD_SENTENCE_DIRECTORY + word.wkid + '.json')) {
      return JSON.parse(fs.readFileSync(WORD_SENTENCE_DIRECTORY + word.wkid + '.json').toString());
    } else {
      return { key: word.wk, wkid: word.wkid, worstScore: 0, sentences: [] };
    }
  }
}