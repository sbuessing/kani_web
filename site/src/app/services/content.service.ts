import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { from, Observable } from 'rxjs';
import {
  Article,
  NewsSource,
  NewsStats,
  SentenceSet,
  WordStats,
} from 'functions/src/shared/types';
import { getDownloadURL, ref, Storage } from '@angular/fire/storage';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ContentService {
  constructor(private storage: Storage, private http: HttpClient) {}

  getSummarySet(): Observable<WordStats[]> {
    return this.getFile<WordStats[]>('/sentences/summary.json');
  }

  getWordSentenceSet(word: number): Observable<SentenceSet> {
    return this.getFile<SentenceSet>(`/sentences/${word}.json`);
  }

  getBookSentenceSet(book: string): Observable<SentenceSet> {
    return this.http.get<SentenceSet>(`/assets/books/${book}.json`);
  }

  getNewsStats(source: NewsSource): Observable<NewsStats> {
    return this.getFile<NewsStats>(source.valueOf() + `/summary.json`);
  }

  getArticle(source: NewsSource, article: string): Observable<Article> {
    return this.getFile<Article>(source.valueOf() + `/${article}.json`);
  }

  private getFile<V>(file: string): Observable<V> {
    return from(getDownloadURL(ref(this.storage, file))).pipe(
      switchMap((value, index) => {
        return this.http.get<V>(value);
      })
    );
  }
}
