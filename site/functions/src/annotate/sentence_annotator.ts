import {
  Article,
  ArticleStats,
  containsKanji,
  isKanji,
  Sentence,
  SentenceKanji,
  SentenceWord,
  WordStats,
} from '../shared/types';
import { Subject } from '../shared/wanikani_types';
import { RcxDict } from './rikaikun/data';
import { defaultConfig } from './rikaikun/configuration';
import { Wanikani } from './wanikani';
import { JLPT } from './jlpt';
import { toHiragana } from 'wanakana';
import { tokenize, getTokenizer, Tokenizer } from 'kuromojin';

const { Translate } = require('@google-cloud/translate').v2;
const projectId = 'kanireader';
interface Token {
  original: string;
  dictionary: string;
  pronunciation: string;
}

export class SentenceAnnotator {
  public kanjiTable = new Map<string, Subject>();
  public wordTable = new Map<string, Subject>();
  public wordStats = new Map<string, WordStats>();
  public jlpt = new JLPT().getWords();
  translate = new Translate({ projectId });
  kuromoji: Tokenizer;
  initialized = false;
  private dict: RcxDict;

  // Main method for the pipeline.
  async initialize(debug = false, useCache = true) {
    const start = Date.now();
    if (this.initialized) {
      return;
    }
    const config = defaultConfig;
    this.dict = await RcxDict.create(config);

    const wk = new Wanikani();
    const words = await wk.getWords(useCache);
    const kanjis = await wk.getKanji(useCache);
    kanjis.map((k) => this.kanjiTable.set(k.characters, k));
    words.map((w) => this.wordTable.set(w.characters, w));
    words.map((word) => {
      this.wordStats.set(word.characters, {
        word: word.characters,
        level: word.level,
        goodSentenceCount: 0,
        occurrences: 0,
      });
    });
    console.log(`${this.jlpt.size} jlpt words loaded`);
    this.kuromoji = await getTokenizer();
    this.initialized = true;
    console.log(
      `Annotator initialized in ${(Date.now() - start) / 1000} seconds.`
    );
  }

  async processArticle(article: Article, translate: boolean) {
    // Break on punctuation.  TODO make sure this works in a quotation.
    const rawSentences = this.parseTextToSentences(article.body);
    article.titleSentence = { japanese: article.title, english: '' };
    await this.processSentence(article.titleSentence);
    if (translate) { await this.translateSentence(article.titleSentence); }
    for (let i = 0; i < rawSentences.length; i++) {
      if (rawSentences[i].length === 0) {
        continue;
      }
      const s: Sentence = { japanese: rawSentences[i], english: '' };
      await this.processSentence(s);
      if (translate) { await this.translateSentence(s); }
      article.sentences.push(s);
    }
    article.body = null;

    article.articleStats = this.getArticleStats(article.sentences);
  }

  async processSentence(sentence: Sentence) {
    const kuroWords = await tokenize(sentence.japanese);
    const tokens: Token[] = kuroWords.map((m) => {
      return {
        original: m.surface_form,
        dictionary: m.basic_form,
        pronunciation: m.pronunciation,
      };
    });

    if (!sentence.words) {
      sentence.words = [];
    }

    // Add each word.
    for (const token of tokens) {
      const word: SentenceWord = { orig: token.original };
      sentence.words.push(word);
      if (!containsKanji(token.original)) {
        continue;
      } // Skip definitions for non-Kanji.

      word.dict = token.dictionary;
      // Add the reading.
      if (token.pronunciation?.length > 0) {
        word.read = toHiragana(token.pronunciation);
      }

      // Add the Wanikani meaning.
      const wkWord = this.wordTable.get(word.dict);
      if (wkWord) {
        word.wk = wkWord.characters;
        word.wkid = wkWord.id;
        word.wkRead = wkWord.readings.filter((m) => m.primary)[0].reading;

        // Just use the primary definition.
        word.wkDef = wkWord.meanings.find(
          (meaning) => meaning.primary === true
        ).meaning;
        word.wkLevel = wkWord.level;
        if (!sentence.level || wkWord.level > sentence.level) {
          sentence.level = wkWord.level;
          sentence.wkWord = wkWord.characters;
        }
        if (this.wordStats.has(word.dict)) {
          this.wordStats.get(word.dict).occurrences += 1;
        }
      }

      // Add JLPT word status.
      const jlptWord = this.jlpt.get(word.dict);
      if (jlptWord) {
        word.jlpt = jlptWord;
      }

      // Add the dictionary meaning.
      const entry = this.dict.wordSearch(token.original, false, 1);
      const definition = entry?.data?.[0].entry;
      if (definition?.length > 5) {
        word.def = this.trim(definition);
      }

      // TODO: I could do a backup pass and try to find a person's name?
      // Is there a way to use the word type (noun vs verb) to better match?

      // Add the kanji meanings.
      let maxKanji = 0;
      word.kanji = [];
      for (let i = 0; i < word.orig.length; i++) {
        const character = word.orig.charAt(i);
        const subject = this.kanjiTable.get(character);
        if (isKanji(character)) {
          const kanji: SentenceKanji = {
            kanji: character,
            wkLevel: subject?.level,
            wkDef: subject?.meanings.filter((m) => m.primary)[0].meaning,
            wkid: subject?.id,
            wkPron: subject?.readings
              .filter((f) => f.primary)
              .map((m) => m.reading)
              .join(', '),
          };

          // Add a dictionary version for non-WK Kanji.
          const kd = this.dict.kanjiSearch(character);
          kanji.jmDef = kd.eigo;
          kanji.jmOn = kd.onkun;

          word.kanji.push(kanji);
          if (subject === null) {
            maxKanji = 61;
          }
        }
        if (subject?.level > maxKanji) {
          maxKanji = subject.level;
        }
      }
      if (maxKanji === 61) {
        maxKanji = 0;
      }
      if (maxKanji > 0) {
        word.wkKanji = maxKanji;
      }
    }
    return true;
  }

  // Send the sentence to Google translate.
  async translateSentence(sentence: Sentence) {
    // TODO: Cache these for cost saving$.
    const [response] = await this.translate.translate(sentence.japanese, 'en');
    sentence.english = response;
  }

  // Trim a Rikaikun dictionary entry, remove paranthetical expressions about type.
  trim(definition: string): string {
    const parts = definition.split('/');
    let trimmed = parts[1].trim(); // Just the first definition.
    if (trimmed.charAt(0) === '(') {
      trimmed = trimmed.substring(trimmed.indexOf(')') + 1).trim();
    } // Remove first paranthetical.
    if (trimmed.charAt(0) === '(') {
      trimmed = trimmed.substring(trimmed.indexOf(')') + 1).trim();
    } // Remove second if exists.
    if (trimmed.charAt(0) === '(') {
      trimmed = trimmed.substring(trimmed.indexOf(')') + 1).trim();
    } // Remove third if exists.
    return trimmed;
  }

  // Clean and split a large body of text into an array of sentences.
  // TODO: Quotation handling.
  parseTextToSentences(text: string): string[] {
    const clean = text
      .split('\n')
      .join('')
      .split('。')
      .join('。\n')
      .split('？')
      .join('？\n')
      .split('<br />')
      .join('\n');
    const sentences = clean
      .split('\n')
      .map((s) => {
        return s.trim();
      })
      .filter((s) => s.length > 0);
    return sentences;
  }

  getArticleStats(sentences: Sentence[]): ArticleStats {
    const a: ArticleStats = {
      n5Words: 0,
      n4Words: 0,
      n3Words: 0,
      n2Words: 0,
      n1Words: 0,
      unknownWords: 0,
      wordCount: 0,
    };
    for (const sentence of sentences) {
      for (const word of sentence.words) {
        switch (word.jlpt) {
          case 5:
            a.n5Words++;
            break;
          case 4:
            a.n4Words++;
            break;
          case 3:
            a.n3Words++;
            break;
          case 2:
            a.n2Words++;
            break;
          case 1:
            a.n1Words++;
            break; //          default: a.n1Words++; // For now I"m just calling anything unknown N1.
        }
        a.wordCount++;
      }
    }
    return a;
  }
}
