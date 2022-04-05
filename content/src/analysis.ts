// This uses the output summary of the pipeline and checks for various conditions that may cause missing data.

import * as fs from 'fs';
import { WordStats } from "../../site/functions/src/shared/types";
import { SentenceStore } from "./sentence_store";

class Analysis {
  sentenceStore = new SentenceStore();

  constructor() {
  }

  async run() {

    const wordStats = this.sentenceStore.getSummary();

    console.log("=======  Level summary ======")
    this.summarize(wordStats);

    console.log("\n\n=======  Word summary ======");
    const total0 = wordStats.filter(f => f.occurrences == 0)
    console.log(total0.length + " words with no occurences.");
    //console.log(total0.map(m => m.word).join(' '));

    // Tilde words I should be able to join with the prior token if prior is a number.
    const tildes = wordStats.filter(f => f.word.includes('〜'));
    console.log(tildes.length + " words with a tilde");
    //console.log(tildes.map(m => m.word).join(' '));
    this.printSome(tildes);

    // Numbers may also need joined with prior?
    const numberWords = wordStats.filter(f => this.firstCharNum(f.word));
    console.log(numberWords.length + " words with a tilde");
    // console.log(numberWords.map(m => m.word).join(' '));
    this.printSome(numberWords);

    // Look for suru as following token.
    const suruWords = wordStats.filter(f => f.word.endsWith('する'));
    console.log(suruWords.length + " words with a する");
    //console.log(suruWords.map(m => m.word).join(' '));
    this.printSome(suruWords);

    // Has katakana

    // Is a compound

    // Remaining words = 
    const remaining = total0.filter(f => !tildes.includes(f))
      .filter(f => !numberWords.includes(f))
      .filter(f => !suruWords.includes(f));
    console.log(remaining.length + " words remaining");
    //console.log(remaining.map(m => m.word).join(' '));
    this.printSome(remaining);

    console.log("\n\n===== Checking raw sentences =====");
    const sentences = this.sentenceStore.getPairedSentences(true);
    remaining.forEach(w => {
      sentences.forEach(s => {
        if (s.japanese.includes(w.word)) {
          w.occurrences++;
        }
      });
    });
    console.log(`Of ${remaining.length}, ${remaining.filter(f => f.occurrences > 0).length} found`);
    console.log("Found:");
    this.printSome(remaining.filter(f => f.occurrences >= 0));
    console.log(`${remaining.filter(f => f.occurrences == 0).length} not found`);
    this.printSome(remaining.filter(f => f.occurrences == 0), 50);


    console.log("\n\n===== Checking book =====");
    const book = fs.readFileSync('assets/books/bookworm.txt').toString();
    console.log("able to read book");
    remaining.forEach(w => {
      if (book.includes(w.word)) {
        w.occurrences++;
      }
    });
    console.log(`Of ${remaining.length}, ${remaining.filter(f => f.occurrences > 0).length} found`);

  }

  numbers = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '〇', '十'];
  firstCharNum(word: string): boolean {
    return this.numbers.includes(word.charAt(0));
  }

  isKanji(ch): boolean {
    return (ch >= "\u4e00" && ch <= "\u9faf") ||
      (ch >= "\u3400" && ch <= "\u4dbf") ||
      ch === "𠮟";
  }

  summarize(stats: WordStats[]) {
    console.log("===== Stats summary =====")
    console.log(`Stats for ${stats.length} words`);
    for (let i = 1; i <= 60; i++) {
      let levelStats = stats.filter(stat => stat.level == i);
      let words0 = levelStats.filter(stat => stat.goodSentenceCount == 0);
      let count0 = words0.length;
      let wordString = this.someWords(words0);
      let occurrence0 = levelStats.filter(stat => stat.occurrences == 0);
      let countLow = levelStats.filter(stat => stat.goodSentenceCount > 1 && stat.goodSentenceCount < 5).length;
      let countGood = levelStats.filter(stat => stat.goodSentenceCount >= 5).length;
      console.log(`Level ${i}: ${count0} none; ${countLow} low; ${countGood} good.  ${occurrence0.length} didn't occur. Missing good: ${wordString}`);
    }
  }

  printSome(words, max = 10) {
    console.log(this.someWords(words, max));
  }

  someWords(words: WordStats[], max = 10): string {
    let wordString = words.map(word => word.word).join(' ');
    if (words.length > max) { wordString = words.slice(0, max).map(word => word.word).join(' ') + "..." }
    return wordString;
  }
}

const startTime = Date.now();
let analysis = new Analysis();
analysis.run().then(response => {
  console.log(`Analysis completed with ${response}`);
  console.log(`Took ${(Date.now() - startTime) / 1000} seconds`);
}).catch(e => console.log(`Analysis failed with ${e}`));