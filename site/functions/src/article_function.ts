// This reads the article digest from Maisho, skips ones already created, and adds new ones.

import admin from 'firebase-admin';
import { SentenceAnnotator } from './annotate/sentence_annotator';
import { NewsStorage } from './news_storage';
import { getParser } from './parsers';
import { Article, NewsSource } from './shared/types';

export class ArticleFunction {
  sa: SentenceAnnotator;

  constructor(private app: admin.app.App, private translate = true) {
    this.sa = new SentenceAnnotator();
  }

  // Main method for the pipeline. Designed to be repeatable with cached annotator.
  async run(newsSource: NewsSource) {
    this.sa.initialize();

    let parser = getParser(newsSource);
    const storage = new NewsStorage(this.app, parser.storageLocation);

    // TODO: Could delay this until we know there are files to translate.
    await this.sa.initialize(false, this.translate);

    console.log('\n\n===== Parsing articles =====');
    // Fetch the latest news summary.
    const rawArticles = await parser.findArticles();
    console.log(`Found ${rawArticles.length} articles!`);

    let newsStats = await storage.getSummary();
    if (newsStats === null) {
      console.log('No summary present');
      newsStats = { articles: [] };
    }

    let processed = 0;
    for (const rawArticle of rawArticles) {
      // Check if already processed.
      if ((await storage.articleExists(rawArticle.news_id))[0] === true) {
        break;
      }

      const article: Article = await parser.fetchArticle(rawArticle);
      await this.sa.processArticle(article, this.translate);
      article.body = null;

      await storage.writeArticle(rawArticle.news_id, JSON.stringify(article));

      newsStats.articles.push({
        article_id: article.news_id,
        title: article.title,
        date: article.date,
        image: article.image,
        stats: article.articleStats,
      });
      processed++;
    }

    // trim the article set to 100. Centralize this function?
    newsStats.articles = newsStats.articles
      .sort((a, b) => (b.date > a.date ? 1 : -1))
      .slice(0, 100);

    // We've added new articles, now create a new manifest including all files in storage.
    await storage.writeSummary(JSON.stringify(newsStats));

    const summary = `Finished processing. ${rawArticles.length} articles. ${processed} processed. ${newsStats.articles.length} total articles.`;
    console.log(summary);
    return summary;
  }
}
