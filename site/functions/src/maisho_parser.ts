// This reads the article digest from NHK, looks for ones already created, and adds new ones.

import Axios from 'axios';
import cheerio from 'cheerio';
import { Article, ArticleRaw, ArticleParser } from './shared/types';

const ARTICLE_LIST = 'http://mainichi.jp/maisho/';

export class MaishoParser implements ArticleParser {
  public storageLocation = 'maisho/';

  public async findArticles(): Promise<ArticleRaw[]> {
    const response = await Axios.get(ARTICLE_LIST);

    const rawArticles: ArticleRaw[] = [];
    const $ = cheerio.load(response.data);
    $('a').each((i, elem) => {
      const link = $(elem).attr('href');
      if (link.includes('maisho/articles')) {
        const id = link.split('articles/')[1].split('/').join('-');
        const raw: ArticleRaw = {
          news_web_url: 'http:' + link,
          news_id: id,
          title: '',
          news_prearranged_time: '',
          news_web_image_uri: '',
          news_easy_image_uri: '',
        };
        rawArticles.push(raw);
      }
    });
    return rawArticles;
  }

  public async fetchArticle(raw: ArticleRaw): Promise<Article> {
    const response = await Axios.get(raw.news_web_url);
    const $ = cheerio.load(response.data);

    $('rt').remove(); // Cut all Ruby furigana.
    $('rp').remove(); // Cut all Ruby furigana.

    const title = $('.title-page').text();
    let body = '';
    $('.articledetail-body')
      .find('p')
      .each((i, elem) => {
        body += $(elem).text();
      });
    let image = $('.articledetail-body-image-inner picture img').attr('src');
    if (image === null) {
      image = $(
        '.articledetail-body .articledetail-image-inner picture img'
      ).attr('src');
    }
    if (image === null) {
      image = $(
        '.articledetail-body .articledetail-image-inner picture img'
      ).attr('src');
    }

    let date = raw.news_web_url.split('articles/')[1].split('/')[0];
    date =
      date.substring(0, 4) +
      '-' +
      date.substring(4, 6) +
      '-' +
      date.substring(6, 8);

    const article: Article = {
      news_id: raw.news_id,
      news_web_url: raw.news_web_url,
      image,
      title,
      body,
      sentences: [],
      date,
    };
    return article;
  }
}
