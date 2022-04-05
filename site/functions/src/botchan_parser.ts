import Axios from 'axios';
import cheerio from 'cheerio';
import { Article, ArticleParser, ArticleRaw } from './shared/types';

const CHAPTER_LIST = 'https://www.sosekiproject.org/botchan/index.html';

export class BotchanParser implements ArticleParser {
  public storageLocation = 'botchan/';

  public async findArticles(): Promise<ArticleRaw[]> {
    console.log('\n\n===== Fetching latest articles =====');
    const rawArticles: ArticleRaw[] = [];
    const response = await Axios.get(CHAPTER_LIST);
    const $ = cheerio.load(response.data);
    $('a').each((i, elem) => {
      const link = $(elem).attr('href');
      if (link.includes('botchanchapter')) {
        const id = link.replace('.html', '');
        const raw: ArticleRaw = {
          news_web_url: 'https://www.sosekiproject.org/botchan/' + link,
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
    $('.vocabdef').remove(); // Cut all Ruby furigana.

    let title = $('h1').text();
    let body = '';
    $('.chapter_text')
      .find('.japanese')
      .each((i, elem) => {
        body += $(elem).text();
      });

    const article: Article = {
      news_id: raw.news_id,
      news_web_url: raw.news_web_url,
      image: '',
      title,
      body,
      sentences: [],
      date: raw.news_prearranged_time,
    };
    return article;
  }
}
