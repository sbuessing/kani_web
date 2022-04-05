// This reads the article digest from NHK, looks for ones already created, and adds new ones.

import Axios from 'axios';
import cheerio from 'cheerio';
import { Article, ArticleParser, ArticleRaw } from './shared/types';

// All articles seem to be present as both regular and easy.
const NHK_LIST = 'http://www3.nhk.or.jp/news/easy/news-list.json';

export class NHKHardParser implements ArticleParser {
  public storageLocation = 'nhkhard/';

  public async findArticles(): Promise<ArticleRaw[]> {
    console.log('\n\n===== Fetching latest articles =====');
    const response = await Axios.get(NHK_LIST);
    const newsDays = response.data;

    // Grab individual articles.
    const articleURLs: ArticleRaw[] = [];
    for (const prop in newsDays[0]) {
      const articleArray: ArticleRaw[] = newsDays[0][prop];
      for (const article of articleArray) {
        articleURLs.push(article);
      }
    }
    return articleURLs;
  }

  public async fetchArticle(raw: ArticleRaw): Promise<Article> {
    const response = await Axios.get(raw.news_web_url);
    const $ = cheerio.load(response.data);
    $('rt').remove(); // Cut all Ruby furigana.

    let title = $('article').find('.content--title').text();
    // Quick title cleanup.
    title = title.split('\n').join('').trim();
    const body = $('article').find('.content--detail-main').text();

    // 3 out of 4 stories havnpme a specified absolute url image.
    // One has an easy only relative path image.  /shruggie
    let image = raw.news_web_image_uri;
    if (!image.includes('://')) {
      image =
        'https://www3.nhk.or.jp/news/easy/' +
        raw.news_id +
        '/' +
        raw.news_easy_image_uri;
    }

    const article: Article = {
      news_id: raw.news_id,
      news_web_url: raw.news_web_url,
      image,
      title,
      body,
      sentences: [],
      date: raw.news_prearranged_time,
    };
    return article;
  }
}
