import { SentenceAnnotator } from './annotate/sentence_annotator';
import { Article } from './shared/types';

export class ParserFunction {
  async translateText(
    text: string,
    translate: boolean = false
  ): Promise<Article> {
    const sa = new SentenceAnnotator();
    await sa.initialize(true, true);

    const article: Article = {
      body: text,
      news_id: '',
      title: '',
      date: '',
      news_web_url: '',
      image: '',
      sentences: [],
    };
    await sa.processArticle(article, translate);
    return article;
  }
}
