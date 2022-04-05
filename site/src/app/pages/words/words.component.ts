import { Component, Input, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import {
  SRSStage,
  StageLabels,
  getStageColor,
} from 'functions/src/shared/types';

import { UserSettings, UserWord } from 'functions/src/shared/firestore_types';

import { FireStoreService } from '../../services/firestore.service';

interface SRSStageRow {
  srsStage: SRSStage;
  srsStageName: string;
  count: number;
}

@Component({
  selector: 'app-words',
  templateUrl: './words.component.html',
  styleUrls: ['./words.component.scss'],
})
export class WordsComponent implements OnDestroy {
  public srsStages: SRSStageRow[];
  private userSetting$: Observable<UserSettings>;
  filteredWords: UserWord[];
  allWords: UserWord[];
  @Input()
  public testBoolean: boolean;
  @Input() toggles: string[]; // TODO: Even when this was a number, the template was still passing in strings.
  getStageColor = getStageColor;
  sub: Subscription;

  userid: any;

  constructor(private ts: FireStoreService, private router: Router) {
    this.filteredWords = [];
    this.testBoolean = false;
    this.srsStages = Object.values(SRSStage)
      .filter((value) => isNaN(Number(value)) === false) // wtf js
      .map((stage) => {
        return {
          srsStage: stage as SRSStage,
          srsStageName: StageLabels.get(stage as SRSStage),
          count: 0,
        };
      });
    this.toggles = ['1', '2', '3', '4']; // Study apprentice words by default.
    this.userSetting$ = this.ts.getUserProfile();
    this.sub = this.userSetting$.subscribe((settings) => {
      this.allWords = settings.words;
      this.updateFilterCounts();
      this.updateWords(null);
    });
  }

  async updateWords(event) {
    this.filteredWords = this.allWords
      .filter((userWord) => this.toggles.includes(userWord?.s?.toString()))
      .sort((a, b) => a.l - b.l);
  }

  studySRSStages() {
    const numbers = this.toggles.map((t) => Number.parseInt(t));
    this.router.navigate(['/read'], {
      queryParams: { srs_stages: JSON.stringify(numbers) },
    });
    return false; // TODO: Why do I need this?
  }

  updateFilterCounts() {
    const counts = this.allWords.reduce((p, c) => {
      const stage = c.s;
      if (!p.hasOwnProperty(stage)) {
        p[stage] = 0;
      }
      p[stage]++;
      return p;
    }, {} as Record<number, number>);
    this.srsStages.forEach((stage) => {
      stage.count = counts[stage.srsStage];
      if (!stage.count) {
        stage.count = 0;
      }
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
