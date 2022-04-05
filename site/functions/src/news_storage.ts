// This class manages a news storage directory.

import admin from 'firebase-admin';
import * as fs from 'fs';
import * as os from 'os';
import { Article, NewsStats } from './shared/types';

export class NewsStorage {
  constructor(private app: admin.app.App, private dir: string) {}

  async articleExists(articleId: string): Promise<[boolean]> {
    return this.app
      .storage()
      .bucket()
      .file(this.dir + articleId + '.json')
      .exists();
  }

  async writeArticle(articleId: string, article: string): Promise<boolean> {
    const filename = articleId + '.json';
    const path = os.tmpdir() + '/' + filename;
    fs.writeFileSync(path, article);
    await this.app
      .storage()
      .bucket()
      .upload(path, { destination: this.dir + filename });
    return true;
  }

  async getSummary(): Promise<NewsStats> {
    const response = await this.app
      .storage()
      .bucket()
      .file(this.dir + 'summary.json')
      .exists();
    if (response[0] !== true) {
      // Start a fresh manifest.
      return { articles: [] };
    }
    const path = os.tmpdir() + '/' + 'summary.json';
    await this.app
      .storage()
      .bucket()
      .file(this.dir + 'summary.json')
      .download({ destination: path });
    const newsStats: NewsStats = JSON.parse(fs.readFileSync(path).toString());
    return newsStats;
  }

  async writeSummary(summary: string): Promise<boolean> {
    const destination = 'summary.json';
    const path = os.tmpdir() + '/' + destination;
    fs.writeFileSync(path, summary);
    await this.app
      .storage()
      .bucket()
      .upload(path, { destination: this.dir + destination });
    return true;
  }

  async getAllArticles(): Promise<Article[]> {
    const articles: Article[] = [];
    const allFiles = await this.app
      .storage()
      .bucket()
      .getFiles({ directory: this.dir });

    await Promise.all(
      allFiles[0].map(async (file) => {
        if (file.name.includes('summary')) {
          return;
        }
        const path = os.tmpdir() + '/' + file.name;
        await file.download({ destination: path });
        const article: Article = JSON.parse(fs.readFileSync(path).toString());
        articles.push(article);
      })
    );
    return articles;
  }
}
