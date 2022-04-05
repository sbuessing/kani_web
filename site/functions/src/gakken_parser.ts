import Axios from 'axios';
import cheerio from 'cheerio';
import { Agent } from 'https';
import { Article, ArticleRaw, ArticleParser } from './shared/types';

const ARTICLE_LIST = 'http://kids.gakken.co.jp/kagaku/kagaku110/';

export class GakkenParser implements ArticleParser {
  public storageLocation = 'gakken/';

  public async findArticles(): Promise<ArticleRaw[]> {
    const agent = new Agent({ rejectUnauthorized: false });
    const response = await Axios.get(ARTICLE_LIST, { httpsAgent: agent });

    const rawArticles: ArticleRaw[] = [];
    const $ = cheerio.load(response.data);
    $('a').each((i, elem) => {
      let link = $(elem).attr('href');
      if (link.startsWith('/')) {
        link = link.substring(1);
      }
      if (!link.startsWith('http')) {
        link = 'https://kids.gakken.co.jp/' + link;
      }
      if (
        link !== 'https://kids.gakken.co.jp/kagaku/kagaku110/' &&
        link.includes('kagaku110') &&
        !link.includes('kagaku110/cat')
      ) {
        console.log(link);

        const id = link.split('jp/kagaku/')[1].split('/').join('-');
        const raw: ArticleRaw = {
          news_web_url: link,
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
    const agent = new Agent({ rejectUnauthorized: false });
    const response = await Axios.get(raw.news_web_url, { httpsAgent: agent });
    const $ = cheerio.load(response.data);

    $('rt').remove(); // Cut all Ruby furigana.
    $('rp').remove(); // Cut all Ruby furigana.

    const title = $('.page_tl').text();

    let image = $('article').find('img').attr('data-src');

    let body = '';
    $('article')
      .find('.page_lead')
      .each((i, elem) => {
        body += $(elem).text();
      });
    $('article')
      .find('.article_con')
      .each((i, elem) => {
        body += $(elem).text();
      });

    const article: Article = {
      news_id: raw.news_id,
      news_web_url: raw.news_web_url,
      image,
      title,
      body,
      sentences: [],
      date: '',
    };
    return article;
  }
}
