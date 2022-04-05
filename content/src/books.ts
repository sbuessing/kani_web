// This uses the output summary of the pipeline and checks for various conditions that may cause missing data.
// Books are downloaded from: https://pdfnovels.net/
// And converted to text with: https://pdftotext.com/

import { Sentence } from "../../site/functions/src/shared/types";
import * as fs from 'fs';
import { SentenceAnnotator } from "../../site/functions/src/annotate/sentence_annotator";
const BOOKS_DIR = 'assets/books/';

class Books {
  sa = new SentenceAnnotator();
  constructor() {
  }

  // Main method for the pipeline.
  async run() {

    await this.sa.initialize();
    const runSize = 500;
    const translate = false; // THIS HAS A COST.

    let files = fs.readdirSync(BOOKS_DIR);
    files = files.filter(f => f.endsWith(".txt"));

    console.log("\n\n===== Checking books =====");

    // Old school for loops don't try to parallelize and hand back async errors correctly.
    for (let file = 0; file < files.length; file++) {
      let filename = files[file];
      console.log(`Processing book ${filename}`);
      let book = fs.readFileSync(BOOKS_DIR + files[file]).toString();

      // TODO is this necessary?
      book = book.split("\r\n").join("\n");

      // TODO: Verify this is working as expected.
      // Remove page numbers and blank lines.
      // let bookLineCheck = book.split("\n");
      // bookLineCheck = bookLineCheck.filter(f => f.length > 0)
      //     .filter(f => Number.parseInt(f) > 0);
      // book = bookLineCheck.join();

      book = book.split("\n").join("");
      // Un-verticalize the book.
      book = book.split("︑").join(",");
      book = book.split("︒").join("。");
      book = book.split("﹁").join("「");
      book = book.split("﹂").join("」");

      // Break on punctuation.  TODO make sure this works in a quotation.  
      book = book.split("。").join("。\n");
      book = book.split("？").join("？\n");
      book = book.split("？").join("\n");
      const bookSentences = book.split("\n");
      console.log(bookSentences.length + " raw sentences");

      // Output the text substitution form for easy viewing.
      fs.writeFileSync(BOOKS_DIR + filename + '.out', bookSentences.join("\n"));

      const sentences: Sentence[] = [];

      for (let i = 0; i < bookSentences.length; i++) {
        if (bookSentences[i].length == 0) { continue; }
        if (i > runSize) { break; }
        const s: Sentence = { japanese: bookSentences[i], english: "" };
        await this.sa.processSentence(s);
        if (translate) {
          await this.sa.translateSentence(s);
        }
        sentences.push(s);
      }
      const bookSet = { key: "", wkid: 0, worstScore: 0, sentences: sentences };
      fs.writeFileSync(BOOKS_DIR + filename.replace('.txt', '.json'), JSON.stringify(bookSet));
    }
  }
}

const startTime = Date.now();
let books = new Books();
books.run().then(response => {
  console.log(`Analysis completed with ${response}`);
  console.log(`Took ${(Date.now() - startTime) / 1000} seconds`);
}).catch(e => console.log(`Analysis failed with ${e}`));