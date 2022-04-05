import { Article, ArticleRaw, Sentence } from "../../site/functions/src/shared/types";
import { SentenceAnnotator } from "../../site/functions/src/annotate/sentence_annotator";
import { SentenceStore } from "./sentence_store";
import { NHKHardParser } from "../../site/functions/src/nhk_hard_parser";
import { BotchanParser } from "../../site/functions/src/botchan_parser";

class SentenceTester {
  sentenceStore = new SentenceStore();
  sa = new SentenceAnnotator();
  constructor() {
  }

  async run() {

    await this.sa.initialize(true, true);


    // // 1. Examine a sentence

    //     const sentence: Sentence = { japanese: "神戸弘陵高校", english:"" };
    //     //const sentence: Sentence = { japanese: "野球をする病院に離れて見ると高校の島野に魅力がつく", english: "" };
    //     await this.sa.processSentence(sentence);
    //     for (const word of sentence.words) {
    //       console.log(word.orig + ' def: ' + word.def + ' WK: ' + word.wkDef);
    //     }
    // //    console.log(JSON.stringify(sentence, null, 2));


    // 2. Examine an article index.
    // let parser = new BotchanParser();
    // let rawArticles = await parser.findArticles();
    // for (var raw of rawArticles) {
    //   var article = await parser.fetchArticle(raw);
    //   console.log(article.news_web_url);
    // }

    // 3. Examine an article
    let parser = new NHKHardParser();
    const raw: ArticleRaw = {
      news_web_url: 'https://www3.nhk.or.jp/news/html/20220105/k10013416231000.html',
      news_id: 'k10013416231000',
      title: '',
      news_prearranged_time: '',
      news_web_image_uri: '',
      news_easy_image_uri: '',
    };
    // let parser = new BotchanParser();
    // const raw: ArticleRaw = {
    //   news_web_url: 'https://www.sosekiproject.org/botchan/botchanchapter04.html',
    //   news_id: 'botchanchapter04',
    //   title: '',
    //   news_prearranged_time: '',
    //   news_web_image_uri: '',
    //   news_easy_image_uri: '',
    // };
    var article: Article = await parser.fetchArticle(raw);
    // console.log('body: ' + article.body)
    await this.sa.processArticle(article, true);
    console.log(article.title);
    console.log(article.titleSentence.japanese);
    console.log(article.titleSentence.english);
    //   console.log(article.sentences.length + ' sentences.')
    //   console.log('image: ' + article.image);
  }
}

const startTime = Date.now();
let tester = new SentenceTester();
tester.run().then(response => {
  console.log(`Testing completed with ${response}`);
  console.log(`Took ${(Date.now() - startTime) / 1000} seconds`);
}).catch(e => console.error('Test failed', e));