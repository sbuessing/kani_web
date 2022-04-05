import {
  ChangeDetectorRef,
  Component,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ContentService } from 'src/app/services/content.service';
import {
  Article,
  NewsSource,
  Sentence,
  StageLabels,
} from 'functions/src/shared/types';
import { UserSettings, UserWord } from 'functions/src/shared/firestore_types';
import { FireStoreService } from '../../services/firestore.service';
import { SentenceViewComponent } from './sentence_view/sentence_view.component';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-read',
  templateUrl: './read.component.html',
  styleUrls: ['./read.component.scss'],
})
export class ReadComponent implements OnInit, OnDestroy {
  @ViewChildren(SentenceViewComponent)
  sentenceViews: QueryList<SentenceViewComponent>;
  title: string;
  sentences: Sentence[] = [];
  wordsWithNoContent: UserWord[] = [];
  showFilters = false;
  article: Article;

  @Input()
  spw = '1';
  stages: number[];
  word: string;
  // Remove this and just store usersettings.  And make it a subject?
  userSettings: UserSettings;
  userWords: UserWord[] = [];
  book: string;
  maxLevel = 0;
  articleParam: string;
  newsSourceParam: string;
  loading = true;
  sub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private ts: FireStoreService,
    private ws: ContentService,
    private cdr: ChangeDetectorRef,
    private location: Location,
    private titleService: Title
  ) { }

  ngOnInit(): void {
    // These have to be on init, they are not ready at constructor time.
    this.stages = JSON.parse(
      this.route.snapshot.queryParamMap.get('srs_stages')
    );
    this.word = this.route.snapshot.queryParamMap.get('word');
    this.book = this.route.snapshot.queryParamMap.get('book');
    const spwParam = this.route.snapshot.queryParamMap.get('spw');
    this.newsSourceParam = this.route.snapshot.queryParamMap.get('source');
    this.articleParam = this.route.snapshot.queryParamMap.get('article');
    if (['1', '2', '5', '10'].includes(spwParam)) {
      this.spw = spwParam;
    }
    this.sub = this.ts
      .getUserProfile()
      .pipe(first())
      .subscribe((u) => {
        this.userSettings = u;
        this.userWords = u?.words ? u.words : [];
        this.maxLevel = u?.maxWKLevel ? u.maxWKLevel : 0;
        this.refreshData();
      });
  }

  // TODO: Split this into multiple pages instead of an overloaded page.
  refreshData() {
    this.sentences = [];
    if (this.word?.length > 0) {
      this.title = 'Word ' + this.word;
      this.sentencesForWords(
        this.userWords.filter((f) => this.word === f.c),
        this.userWords,
        100
      );
    } else if (this.stages?.length > 0) {
      this.title =
        this.stages.map((m) => StageLabels.get(m)).join(', ') + ' words';
      this.showFilters = true;
      const stageWords = this.userWords.filter((f) =>
        this.stages.includes(f.s)
      );
      this.sentencesForWords(
        stageWords,
        this.userWords,
        Number.parseInt(this.spw)
      );
    } else if (this.book?.length > 0) {
      this.title = 'Book ' + this.book;
      this.sentencesForBook(this.book, this.userWords);
    } else if (this.articleParam?.length > 0) {
      // News
      this.sentencesForArticle(
        this.newsSourceParam,
        this.articleParam,
        this.userWords
      );
    } else {
      let level = Number(this.route.snapshot.queryParamMap.get('level'));
      if (!(level > 0)) {
        level = 1;
      }
      this.title = 'Level ' + level;
      this.showFilters = true;
      const levelWords = this.userWords.filter((f) => f.l === level);
      this.sentencesForWords(
        levelWords,
        this.userWords,
        Number.parseInt(this.spw)
      );
    }
    this.titleService.setTitle("Kani Reader " + this.title);
  }

  select(sentence: Sentence) {
    this.sentenceViews.forEach((view) => {
      view.active = view.sentence === sentence;
    });
  }

  wordsFormatted(userWords: UserWord[]): string {
    return userWords.map((m) => m.c).join(', ');
  }

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    let active = 0;
    const sentenceArray = this.sentenceViews.toArray();
    for (let i = 0; i < sentenceArray.length; i++) {
      // Doing a for in loop was trying to set i to string?
      if (sentenceArray[i].active) {
        active = i;
        break;
      }
    }
    if (event.key === 'd' || event.key === 'j') {
      if (active + 1 === sentenceArray.length) {
        return;
      }
      sentenceArray[active].active = false;
      sentenceArray[active + 1].active = true;
      if (active + 2 < sentenceArray.length) {
        sentenceArray[active + 2].focus(); // Gives us more reading room.
      } else if (active + 1 < sentenceArray.length) {
        sentenceArray[active + 1].focus(); // Gives us more reading room.
      } else {
        sentenceArray[active + 1].focus();
      }
    }
    if (event.key === 'a' || event.key === 'k') {
      if (active === 0) {
        return;
      }
      sentenceArray[active].active = false;
      sentenceArray[active - 1].active = true;
      sentenceArray[active - 1].focus();
    }
    if (event.key === 's' || event.key === 'i') {
      sentenceArray[active].speak();
    }
    if (event.key === 'w' || event.key === 'l') {
      sentenceArray[active].showMeaning = !sentenceArray[active].showMeaning;
    }
    if (event.key === 'e' || event.key === 'o') {
      sentenceArray[active].showEnglish = !sentenceArray[active].showEnglish;
    }
  }

  // TODO: Refactor these two together? Starting to diverge.
  async sentencesForWords(
    words: UserWord[],
    allWords: UserWord[],
    spw: number
  ) {
    this.ws
      .getSummarySet()
      .toPromise()
      .then((ws) => {
        const wordStatsMap = new Map(ws.map((m) => [m.word, m]));
        const userWords = new Map(allWords.map((m) => [m.c, m]));
        words.forEach((w) => {
          const wordStats = wordStatsMap.get(w.c);
          if (wordStats.occurrences === 0) {
            this.wordsWithNoContent.push(w);
          } else {
            this.ws
              .getWordSentenceSet(w.id)
              .toPromise()
              .then((ss) => {
                this.shuffleArray(ss.sentences);
                ss.sentences.slice(0, spw).forEach((s) => {
                  this.addSentenceUserStatus(s, userWords);
                  this.sentences.push(s);
                });
              })
              .catch((err) => {
                console.log(`No content for ${w.c}`);
                return true; // Probably don't have content for this word.
              });
          }
        });
        this.loading = false;
      });
  }

  shuffleArray(array: Sentence[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  sentencesForBook(book: string, allWords: UserWord[]) {
    const userWords = new Map<string, UserWord>();
    allWords.forEach((word) => {
      userWords.set(word.c, word);
    });
    this.ws
      .getBookSentenceSet(book)
      .toPromise()
      .then((ss) => {
        ss.sentences.forEach((s) => {
          this.addSentenceUserStatus(s, userWords);
          this.sentences.push(s);
        });
      })
      .catch((err) => {
        console.log(`No content for ${book}`);
        return true; // Probably don't have content for this word.
      });
  }

  sentencesForArticle(source: string, article: string, allWords: UserWord[]) {
    const userWords = new Map<string, UserWord>();
    allWords.forEach((word) => {
      userWords.set(word.c, word);
    });
    this.ws
      .getArticle(source as NewsSource, article)
      .toPromise()
      .then((ss) => {
        this.titleService.setTitle("Kani Reader " + ss.title);
        this.article = ss;
        // this.title = ss.title; We use an article header instead.
        ss.sentences.forEach((s) => {
          this.addSentenceUserStatus(s, userWords);
          this.sentences.push(s);
        });
      })
      .catch((err) => {
        console.log(`No content for ${article}`);
        return true; // Probably don't have content for this word.
      });
  }

  // TODO: This definitely needs refactored.
  addSentenceUserStatus(sentence: Sentence, userWords: Map<string, UserWord>) {
    if (sentence && sentence.words) {
      sentence.words.map((word) => {
        if (word?.wk) {
          word.userStatus = userWords.get(word.wk)?.s;
          if (word.wkLevel > this.maxLevel) {
            word.wk = null;
            word.wkDef = null;
            word.wkRead = null;
            word.wkid = null;
          }
        }
        if (word.wkKanji > this.maxLevel) {
          word.wkKanji = null;
        }
        word.kanji?.map((k) => {
          if (k.wkLevel > this.maxLevel) {
            k.wkLevel = null;
            k.wkid = null;
            k.wkDef = null;
            k.wkPron = null;
          }
        });
      });
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
