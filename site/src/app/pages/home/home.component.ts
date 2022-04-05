import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  NewsStats,
  NewsSource,
  newsSourceName,
} from 'functions/src/shared/types';
import { ContentService } from 'src/app/services/content.service';
import { FireStoreService } from 'src/app/services/firestore.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WanikaniService } from 'src/app/services/wanikani.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnDestroy {
  maxWKLevel = 0;
  devmode = true;
  articles: Map<string, NewsStats> = new Map();
  subs: Subscription[] = [];
  public NewsSource = Object.values(NewsSource);

  constructor(
    private ts: FireStoreService,
    private ws: ContentService,
    private snackBar: MatSnackBar,
    private wks: WanikaniService,
    private titleService: Title
  ) {
    titleService.setTitle("Kani Reader Home");
    this.subs.push(
      this.ts.getUserProfile().subscribe((user) => {
        if (user?.maxWKLevel > 0) {
          this.maxWKLevel = user.maxWKLevel;
        }
        const lastUpdate = new Date(user.lastWkUpdate);
        if (!lastUpdate || Date.now() - lastUpdate.getTime() > 86400000) {
          this.refreshWanikani(user.apiKey);
        }
      })
    );
    for (let s of Object.values(NewsSource)) {
      this.getArticles(s);
    }
  }

  public getSourceName(s: string) {
    return newsSourceName(s as NewsSource);
  }

  private getArticles(s: string) {
    this.subs.push(
      this.ws
        .getNewsStats(s as NewsSource)
        .pipe(
          map((data) => {
            if (s as NewsSource === NewsSource.Gakken) {
              data.articles = this.shuffle(data.articles);
            }
            this.articles.set(s, data);
          })
        )
        .subscribe()
    );
  }

  async refreshWanikani(apiKey: string) {
    this.snackBar.open('Updating Wanikani', '', { duration: 3000 });
    this.wks
      .getUserWords(apiKey)
      .then((userWords) => {
        this.ts.setUserProfile({
          words: userWords,
          lastWkUpdate: Date.now(),
        });
        this.snackBar.open('Wanikani updated.', '', { duration: 3000 });
      })
      .catch((e) => {
        this.snackBar.open('Wanikani update failed', '', {
          duration: 10000,
        });
      })
      .finally(() => { });
  }

  shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
    return arr;
  }

  ngOnDestroy(): void {
    for (const s of this.subs) {
      s.unsubscribe();
    }
  }
}
