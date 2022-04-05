import { containsKanji, Sentence, WordStats } from "../../site/functions/src/shared/types";
import { KaniFirebase } from "./kani_firebase";
import { SentenceStore } from "./sentence_store";
import { SentenceAnnotator } from "../../site/functions/src/annotate/sentence_annotator";

class Sentences {
  sa = new SentenceAnnotator();
  sentenceStore = new SentenceStore();
  kaniStore = new KaniFirebase();

  constructor() {
  }

  // Main method for the pipeline.
  async run() {
    const debug = false;
    const useCache = true;
    await this.sa.initialize(debug, useCache);
    const writeToFirestore = false;
    const writeToFiles = true;
    const runSize = 200000;

    const sentenceWriter = this.kaniStore.getSentenceWriter();
    let sentences = this.sentenceStore.getPairedSentences(useCache);
    console.log(`Loaded ${sentences.length} raw sentences`);

    // Filter the incoming sentences.
    if (true) { // Get a small set of good sentences.
      const testSentences: Sentence[] = [];
      for (let sentence of sentences) {
        if (testSentences.length >= runSize) break;
        // Filtering by sentence length leads to more visual consistency.
        if (sentence.japanese.length > 8 && sentence.japanese.length < 60 && containsKanji(sentence.japanese)) {
          testSentences.push(sentence);
        }
      }
      sentences = testSentences;
    }
    console.log(`Filtered to ${sentences.length} raw sentences`);

    let processed = 0;
    // Annotate and upload sentences in batches of 1000.
    while (sentences.length > 0) {
      const results = await Promise.all(sentences.splice(0, 1000).map(async (sentence) => {

        await this.sa.processSentence(sentence);

        this.sa.wordStats.has(sentence.wkWord) ? this.sa.wordStats.get(sentence.wkWord).goodSentenceCount += 1 : true;
        if (debug) {
          console.log(`Key: ${sentence.key}`);
          console.log("Japanese: " + sentence.japanese);
          console.log("English: " + sentence.english);
          console.log("Tokenized: " + sentence.words.map(span => span.orig).join(''));
          console.log("Dictionary: " + sentence.words.map(span => span.dict).join('-'));
          console.log("Translated: " + sentence.words.map(span => span.wk ? 'W' : 'D').join('-'));
          console.log('\n' + sentence.words.map(span => span.wk ? span.wkDef : span.def).join('-'));
          console.log(`Max word: ${sentence.level}`);
          console.log('\n\n');
        }
        if (writeToFiles) { this.sentenceStore.writeSentence(sentence); }
        if (writeToFirestore) { await sentenceWriter.set(sentence); }
      })).catch(error => {
        console.log('Error! ' + error);
        return [];
      });
      processed += results.length;
      await sentenceWriter.flush();
      process.stdout.clearLine(1);
      process.stdout.cursorTo(0);
      process.stdout.write(`Processing, ${processed} complete, ${sentences.length} remaining`);
    }
    console.log(`Processed ${processed} sentences`);
    await sentenceWriter.close();
    const stats = Array.from(this.sa.wordStats.values());
    this.sentenceStore.writeSummary(JSON.stringify(stats));
    this.summarize(stats);
    return true;
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

  someWords(words: WordStats[]): string {
    let max = 10;
    let wordString = words.map(word => word.word).join(' ');
    if (words.length > max) { wordString = words.slice(0, max).map(word => word.word).join(' ') + "..." }
    return wordString;
  }
}

const startTime = Date.now();
let pipeline = new Sentences();
pipeline.run().then(response => {
  console.log(`Pipeline completed with ${response}`);
  console.log(`Took ${(Date.now() - startTime) / 1000} seconds`);
}).catch(e => console.log(`Pipeline failed with ${e}`));