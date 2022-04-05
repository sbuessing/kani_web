// This reads the article digest from NHK, looks for ones already created, and adds new ones.

import { Sentence, Article, NewsStats } from "../../site/functions/src/shared/types";
import * as fs from 'fs';
import { SentenceAnnotator } from "../../site/functions/src/annotate/sentence_annotator";
import Axios, * as axios from 'axios';
import cheerio from 'cheerio';
import { KaniFirebase } from "./kani_firebase";
import wiki from 'wikijs';

const WIKI_DIR = 'assets/wiki/';
const STORAGE_DIR = 'wiki/';

class Wikipedia {
  sa = new SentenceAnnotator();
  kfs = new KaniFirebase();
  constructor() {
  }

  // TODO: Reuse logic from server function or kill this code.
  // Main method for the pipeline.
  async run() {
    var debug = false;
    const translate = false; // THIS HAS A COST.
    const upload = false;
    await this.sa.initialize(debug, true);

    // Preparing word list.

    console.log("\n\n===== Fetching articles =====");
    let badWordCount = 0;
    let goodWordCount = 0;
    for (let word of this.sa.wordTable.keys()) {
      await wiki({ apiUrl: 'https://ja.wiktionary.org/w/api.php' })
        .page(word)
        //.then(page => page.info())
        .then(page => page.url())
        //.then(page => {return page.html()})
        .then(summary => { console.log(summary); goodWordCount++; })
        .catch(e => {
          badWordCount++;
          if (badWordCount % 100 == 0) {
            process.stdout.clearLine(1);
            process.stdout.cursorTo(0);
            process.stdout.write(`${badWordCount} missing, ${goodWordCount} found`);
          }
        });
    }

    console.log(`Out of ${this.sa.wordTable.size} there were ${badWordCount} with no entry`);

    // // Grab individual articles.
    // let articleURLs: ArticleRaw[] = [];
    // for (var prop in newsDays[0]) {
    //   var articleArray: ArticleRaw[] = newsDays[0][prop];
    //   for (let article of articleArray) {
    //     articleURLs.push(article);
    //   }
    // }
    // console.log(`${articleURLs.length} articles in news_list.`);

    // let processed = 0;
    // let zeroContent = 0;
    // TODO: Process all articles and don't use ArticleRaw.

    // await Promise.all(articleURLs.map(async url => {

    //   url.news_web_url = `https://www3.nhk.or.jp/news/easy/${url.news_id}/${url.news_id}.html`;
    //   var response = await Axios.get(url.news_web_url);
    //   fs.writeFileSync(NEWS_DIR + url.news_id + 'easy.html', response.data);

    //   var article: Article = await fetchArticle(url);

    //   // Break on punctuation.  TODO make sure this works in a quotation.
    //   article.body = article.body.split("。").join("。\n")
    //     .split("？").join("？\n")
    //     .split("<br />").join("\n");
    //   const rawSentences = article.body.split("\n");
    //   for (let i = 0; i < rawSentences.length; i++) {
    //     if (rawSentences[i].length == 0) {continue;}
    //     const s: Sentence = {japanese: rawSentences[i], english: ""};
    //     await this.sa.processSentence(s);
    //     if (translate) {
    //       await this.sa.translateSentence(s);
    //     }
    //     article.sentences.push(s);
    //   }
    //   article.body = null;

    //   fs.writeFileSync(NEWS_DIR + url.news_id + '.json', JSON.stringify(article));
    //   if (upload) {
    //     await this.kfs.uploadNewsArticle(NEWS_DIR + url.news_id + '.json', STORAGE_DIR + `${url.news_id}.json`);
    //   }
    //   if (article.sentences.length == 0) {zeroContent++;}
    //   processed++;
    // }));

    // console.log(`${processed} articles processed, ${zeroContent} had zero content.`);

    // // We've added new articles, now create a new manifest including all files on disk.
    // var wikiStats: NewsStats = {articles: []};
    // var allFiles = fs.readdirSync(WIKI_DIR);
    // allFiles = allFiles.filter(f => f.endsWith(".json"));
    // allFiles.map(m => {
    //   if (m === "summary.json") {return;}
    //   var article: Article = JSON.parse(fs.readFileSync(WIKI_DIR + m).toString());
    //   wikiStats.articles.push({article_id: article.news_id, title: article.title, date: article.date, image: article.image});
    // });
    // console.log(`Found ${wikiStats.articles.length} articles.`);
    // fs.writeFileSync(WIKI_DIR + 'summary.json', JSON.stringify(wikiStats));
    // if (upload) {
    //   await this.kfs.uploadNewsArticle(WIKI_DIR + 'summary.json', STORAGE_DIR + "summary.json");
    // }
    // return true;
  }
}

const startTime = Date.now();
let news = new Wikipedia();
news.run().then(response => {
  console.log(`Wiki completed with ${response}`);
  console.log(`Took ${(Date.now() - startTime) / 1000} seconds`);
}).catch(e => console.log(`Wiki failed with ${e}`));
