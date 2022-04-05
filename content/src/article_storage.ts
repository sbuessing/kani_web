import { Article, NewsStats } from "../../site/functions/src/shared/types";
import * as fs from 'fs';

const ROOT = 'articles/'
export class ArticleStorage {
    constructor(private dir: string) {
        if (!fs.existsSync(ROOT)) {
            fs.mkdirSync(ROOT);
        }
        if (!fs.existsSync(ROOT + dir)) {
            fs.mkdirSync(ROOT + this.dir);
        }
    }

    public writeArticle(article: Article): string {
        const file = ROOT + this.dir + article.news_id + '.json';
        fs.writeFileSync(file, JSON.stringify(article));
        return file;
    }

    public createSummary(): string {
        var newsStats: NewsStats = { articles: [] };
        var allFiles = fs.readdirSync(ROOT + this.dir);
        allFiles = allFiles.filter(f => (f.endsWith(".json") && !f.includes("summary.json") && !f.includes("news_list.json")));
        allFiles.map(m => {
            var article: Article = JSON.parse(fs.readFileSync(ROOT + this.dir + m).toString());
            newsStats.articles.push({ article_id: article.news_id, title: article.title, date: article.date, image: article.image, stats: article.articleStats });
        });
        console.log(`Found ${newsStats.articles.length} articles.`);
        const file = ROOT + this.dir + 'summary.json';
        fs.writeFileSync(file, JSON.stringify(newsStats));
        return file;
    }
}