import { Component, Input, OnDestroy } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { FormBuilder, FormControl } from '@angular/forms';
import { from, Observable, Subscription } from 'rxjs';
import { ContentService } from 'src/app/services/content.service';
import {
  JLPTStats,
  NewsSource,
  Sentence,
  SentenceSet,
  StageLabels,
} from 'functions/src/shared/types';
import { Assignment, Subject } from 'functions/src/shared/wanikani_types';

import { UserSettings, UserWord } from 'functions/src/shared/firestore_types';

import { FireStoreService } from '../../services/firestore.service';
import { WanikaniService } from '../../services/wanikani.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { User } from '@angular/fire/auth';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnDestroy {
  apiKey = new FormControl('');
  public user: User;
  public userSettings$: Observable<UserSettings>;
  public assignment$: Observable<Assignment[]>;
  public vocabulary$: Observable<Subject[]>;
  public kanji$: Observable<Subject[]>;
  public sentence$: Observable<Sentence[]>;
  public sentenceSet$: Observable<SentenceSet>;
  userWords: UserWord[];
  lastUpdated: Date;
  documentCount = 0;
  loading = false;
  @Input()
  jlptKnown: string;
  @Input()
  jlptStudy: string;
  newsResponse: string;
  helloResponse: string;
  maxLevel = 0;
  public knownWK = 0;
  public learningWK = 0;
  public knownJLPT = 0;
  public learningJLPT = 0;
  sub: Subscription;
  public NewsSource = Object.values(NewsSource);

  constructor(
    auth: Auth,
    private wks: WanikaniService,
    private ts: FireStoreService,
    private formBuilder: FormBuilder,
    private ws: ContentService,
    private snackBar: MatSnackBar,
    private fns: Functions,
    private titleService: Title
  ) {
    titleService.setTitle("Kani Reader Profile");
    auth.onAuthStateChanged((user) => {
      this.user = user;
    });

    // TODO(sbuessing): Move auth checks inside the service and chain every call to auth check, and remove userid parameter.
    this.userSettings$ = this.ts.getUserProfile();
    this.sub = this.userSettings$.subscribe((settings) => {
      if (!settings) {
        console.log('No settings yet');
        return;
      }
      this.maxLevel = settings?.maxWKLevel;
      this.apiKey.setValue(settings?.apiKey);
      if (settings.lastWkUpdate) {
        this.lastUpdated = new Date(settings?.lastWkUpdate);
      }
      this.jlptKnown = settings.jlptKnown?.toString();
      this.jlptStudy = settings.jlptStudy?.toString();
      if (settings.words?.length > 0) {
        this.userWords = settings.words;
        this.generateSummary(settings.words);
      }
      this.updateJLPTWords();
    });
    this.sentenceSet$ = this.ws.getWordSentenceSet(2467); // get ー
  }

  hello() {
    this.helloResponse = '...';
    const callable = httpsCallable<string, string>(this.fns, 'hello');
    callable('').then((response) => {
      console.log(response);
      this.helloResponse = response.data;
    });
  }

  helloSecure() {
    this.helloResponse = '...';
    const callable = httpsCallable<string, string>(this.fns, 'helloSecure');
    callable('').then((response) => {
      console.log(response);
      this.helloResponse = response.data;
    });
  }

  async updateArticles(source: string) {
    this.newsResponse = '...';
    const callable = httpsCallable(this.fns, 'updateArticles');
    callable({ text: source })
      .then((response) => {
        console.log(response);
        this.newsResponse = response.data as string;
      })
      .catch((response) => {
        console.log(response);
        this.newsResponse = 'Failure';
      });
  }

  saveJLPTStudy() {
    this.ts.setUserProfile({ jlptStudy: Number.parseInt(this.jlptStudy) });
    this.updateJLPTWords();
    return true;
  }

  saveJLPTKnown() {
    this.ts.setUserProfile({ jlptKnown: Number.parseInt(this.jlptKnown) });
    this.updateJLPTWords();
    return true;
  }

  async setApiKey() {
    this.loading = true;
    this.ts.setUserProfile({ apiKey: this.apiKey.value });
    this.refreshWanikani();
  }

  fetchData() {
    this.assignment$ = from(this.wks.getAssignments(this.apiKey.value));
  }

  fetchWords() {
    this.vocabulary$ = from(
      this.wks.getSubjects(this.apiKey.value, 'vocabulary')
    );
  }

  fetchKanji() {
    this.kanji$ = from(this.wks.getSubjects(this.apiKey.value, 'kanji'));
  }

  stageName(stage: number) {
    return StageLabels.get(stage);
  }

  // TODO: Rate limit this so it doesn't blow up.
  async countDocs() {
    this.documentCount = 0;
    const lookups = this.userWords.map((word) =>
      this.ws.getWordSentenceSet(word.id)
    );
    while (lookups.length > 0) {
      const results = await Promise.all(
        lookups.splice(0, 10).map(async (lookup) => {
          await lookup
            .toPromise()
            .then((response) => {
              this.documentCount++;
            })
            .catch((error) => {
              const donothing = 0;
            });
        })
      );
    }
  }

  async updateJLPTWords() {
    let knownLevel = Number.parseInt(this.jlptKnown);
    let studyLevel = Number.parseInt(this.jlptStudy);
    let known = 0;
    let learning = 0;
    for (let i = 5; i > 0; i--) {
      if (knownLevel > 0 && knownLevel <= i) {
        known += JLPTStats[i];
      } else if (studyLevel > 0 && studyLevel <= i) {
        learning += JLPTStats[i];
      }
    }
    this.knownJLPT = known;
    this.learningJLPT = learning;
  }

  async refreshWanikani() {
    this.loading = true;
    const level = await this.wks.getMaxLevel(this.apiKey.value);
    await this.ts.setUserProfile({ maxWKLevel: level });
    this.wks
      .getUserWords(this.apiKey.value)
      .then((userWords) => {
        const filtered = userWords.filter((w) => w.l <= level);
        this.ts.setUserProfile({
          words: filtered,
          lastWkUpdate: Date.now(),
        });
        this.snackBar.open('Wanikani updated.', '', { duration: 3000 });
      })
      .catch((e) => {
        this.snackBar.open('Wanikani update failed', '', {
          duration: 10000,
        });
      })
      .finally(() => {
        this.loading = false;
      });
  }

  generateSummary(words: UserWord[]) {
    console.log('starting summary');
    this.knownWK = 0;
    this.learningWK = 0;
    words.forEach((userword) => {
      if (userword.s === 9) {
        this.knownWK++;
      } else if (userword.s > 0) {
        this.learningWK++;
      }
    });
  }

  isAdmin(): boolean {
    return this.user.email === 'sbuessing@gmail.com';
  }

  deleteUser() {
    this.ts.deleteUserProfile();
  }

  staleUser() {
    const twoDaysAgo = Date.now() - 2 * 86400000;
    this.ts.setUserProfile({ lastWkUpdate: twoDaysAgo });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
