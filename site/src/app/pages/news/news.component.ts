import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NewsSource, NewsStats } from 'functions/src/shared/types';
import { ContentService } from 'src/app/services/content.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss'],
})
export class NewsComponent implements OnInit {
  news: Observable<NewsStats>;
  newsSourceParam: string;

  constructor(private route: ActivatedRoute, private ws: ContentService) {}

  ngOnInit(): void {
    this.newsSourceParam = this.route.snapshot.queryParamMap.get('source');
    this.news = this.ws.getNewsStats(this.newsSourceParam as NewsSource).pipe(
      map((data) => {
        // TODO: This might be brittle.
        data.articles = data.articles.sort((a, b) => {
          return b.date > a.date ? 1 : -1;
        });
        return data;
      })
    );
  }
}
