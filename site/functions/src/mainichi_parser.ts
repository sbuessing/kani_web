// This reads the article digest from NHK, looks for ones already created, and adds new ones.

import Axios from 'axios';
import cheerio from 'cheerio';
import { Article, ArticleParser, ArticleRaw } from './shared/types';

const NEWS_LIST = 'http://mainichi.jp/';

export class MainichiParser implements ArticleParser {
  public storageLocation = 'mainichi/';

  public async findArticles(): Promise<ArticleRaw[]> {
    const response = await Axios.get(NEWS_LIST);

    const rawArticles: ArticleRaw[] = [];
    const $ = cheerio.load(response.data);
    $('a').each((i, elem) => {
      const link = $(elem).attr('href');
      if (link.includes('mainichi.jp/articles')) {
        console.log(link);
        const raw: ArticleRaw = {
          news_web_url: 'http:' + link,
          news_id: '',
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

    const news_id = raw.news_web_url.split('articles/')[1].split('/').join('-');
    const image = $('.articledetail-body-image-inner picture img').attr('src');
    const title = $('.title-page').text();
    let body = '';
    $('.articledetail-body')
      .find('p')
      .each((i, elem) => {
        body += $(elem).text();
      });

    const article: Article = {
      news_id,
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
