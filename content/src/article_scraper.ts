
import { SentenceAnnotator } from "../../site/functions/src/annotate/sentence_annotator";
import { getParser } from "../../site/functions/src/parsers";
import { KaniFirebase } from "./kani_firebase";
import { ArticleStorage } from "./article_storage";
import { ArticleParser, NewsSource } from "../../site/functions/src/shared/types";

// This is a generic article scraper.
export class ArticleScraper {
  sa = new SentenceAnnotator();
  kfs = new KaniFirebase();

  // Main method for the pipeline.
  async run(parser: ArticleParser, translate = false, upload = true) {

    await this.sa.initialize(false, true);
    const storage = new ArticleStorage(parser.storageLocation);

    const rawArticles = await parser.findArticles();
    console.log(`Found ${rawArticles.length} raw articles.`);

    // This usually works but it's triggering DDOS 404's from some sources.
    //const results = await Promise.all(rawArticles.map(async (rawArticle) => {
    for (const rawArticle of rawArticles) {

      const article = await parser.fetchArticle(rawArticle);
      await this.sa.processArticle(article, translate);

      const fileURL = storage.writeArticle(article);
      if (upload) {
        await this.kfs.uploadNewsArticle(fileURL, parser.storageLocation + article.news_id + `.json`);
      }
    }

    const fileURL = storage.createSummary();
    if (upload) {
      await this.kfs.uploadNewsArticle(fileURL, parser.storageLocation + "summary.json");
    }
    return true;
  }
}

const startTime = Date.now();
let scraper = new ArticleScraper();
const type = process.argv[2];
console.log(`\n\n===== Starting scraper ${type} =====`);
const parser = getParser(type as NewsSource);

// TODO: Make this run them all.
scraper.run(parser).then(response => {
  console.log(`Scraper completed with ${response}`);
  console.log(`Took ${(Date.now() - startTime) / 1000} seconds`);
}).catch(e => console.error("Scraper failed", e));
