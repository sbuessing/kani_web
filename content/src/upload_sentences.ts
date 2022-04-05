import { KaniFirebase } from "./kani_firebase";
import * as fs from 'fs';

export class Uploader {
  kfs = new KaniFirebase();

  async run() {
    const SENTENCE_DIRECTORY = 'assets/words/';
    let uploadCount = 0;
    const files = fs.readdirSync(SENTENCE_DIRECTORY);
    for (const file of files) {
      await this.kfs.uploadNewsArticle(SENTENCE_DIRECTORY + file, 'sentences/' + file);
      uploadCount++;
      if (uploadCount % 100 == 0) {
        console.log(`${uploadCount} files uploaded.`);
      }
    }
    console.log(`Uploaded ${uploadCount} files`);
    return true;
  }
}

const startTime = Date.now();
let uploader = new Uploader();
console.log('Starting uploader');
uploader.run().then(response => {
  console.log(`Uploader completed with ${response}`);
  console.log(`Took ${(Date.now() - startTime) / 1000} seconds`);
}).catch(e => console.error("uploader failed", e));
