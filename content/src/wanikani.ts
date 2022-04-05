import Axios, * as axios from 'axios';
import * as fs from 'fs';
import { OutgoingHttpHeaders } from "http2";
import { Subject } from "../../site/functions/src/shared/wanikani_types";

const VOCAB_FILE = 'assets/wanikani/vocabulary.json';
const KANJI_FILE = 'assets/wanikani/kanji.json';
const API_ROOT = 'https://api.wanikani.com/v2/';
const API_KEY_FILE = 'assets/wanikani/apitoken';

class Wanikani {

  async getWords(useCache: boolean): Promise<Subject[]> {
    let words: Subject[];
    if (!fs.existsSync(VOCAB_FILE)) {
      console.log('Rebuilding Wanikani word cache');
      words = await this.fetchSubjects();
      fs.writeFileSync(VOCAB_FILE, JSON.stringify(words));
    } else {
      console.log(`Loading Wanikani vocab cache`);
      words = JSON.parse(fs.readFileSync(VOCAB_FILE).toString());
    }
    console.log(`Loaded ${words.length} Wanikani vocabulary.`)
    return words;
  }

  async getKanji(useCache: boolean): Promise<Subject[]> {
    // TODO: Consider writing minified copies to the server.
    let kanji: Subject[];
    if (!fs.existsSync(KANJI_FILE)) {
      console.log('Rebuilding Wanikani kanji cache');
      kanji = await this.fetchSubjects("kanji");
      fs.writeFileSync(KANJI_FILE, JSON.stringify(kanji));
    } else {
      console.log(`Loading Wanikani kanji cache`);
      kanji = JSON.parse(fs.readFileSync(KANJI_FILE).toString());
    }
    console.log(`Loaded ${kanji.length} Wanikani kanji.`)
    return kanji;
  }

  async fetchSubjects(type: string = 'vocabulary'): Promise<Subject[]> {
    const apiKey = fs.readFileSync(API_KEY_FILE).toString();
    const subjects: Subject[] = [];
    const headers: OutgoingHttpHeaders = { Authorization: 'Bearer ' + apiKey };
    const options: axios.AxiosRequestConfig = { headers: headers };
    let nextPage = API_ROOT + 'subjects?types=' + type;
    do {
      console.log(`Fetching ${nextPage}`);
      const response = await Axios.get(nextPage, options);
      const jsonResponse = response.data;
      jsonResponse['data'].forEach(
        element => {
          const subject: Subject = this.trimSubject(element['data']);
          subject.id = element['id'];
          subjects.push(subject);
        }
      );
      nextPage = jsonResponse['pages']['next_url'];
      // });
    } while (nextPage != null);
    return subjects;
  }

  // Creates a more compact version that fits in Firebase function memory.
  trimSubject(raw: Subject): Subject {
    let subject: Subject = {
      id: raw.id,
      characters: raw.characters,
      level: raw.level,
      meanings: raw.meanings.filter(f => f.primary),
      readings: raw.readings.filter(f => f.primary)
    };
    return subject;
  }

  async run() {
    await this.getWords(true);
    await this.getKanji(true);
  }
}

const startTime = Date.now();
let wk = new Wanikani();
wk.run().then(response => {
  console.log(`Testing completed with ${response}`);
  console.log(`Took ${(Date.now() - startTime) / 1000} seconds`);
}).catch(e => `Testing failed with ${e}`);