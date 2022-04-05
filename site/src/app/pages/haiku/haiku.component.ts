import { Component, Input, OnInit } from '@angular/core';
import {
  Haiku,
  UserSettings,
  UserWord,
} from 'functions/src/shared/firestore_types';
import { Observable } from 'rxjs';
import { FireStoreService } from '../../services/firestore.service';

@Component({
  selector: 'app-haiku',
  templateUrl: './haiku.component.html',
  styleUrls: ['./haiku.component.scss'],
})
export class HaikuComponent {
  userSettings: UserSettings;
  userWords: UserWord[];
  maxLevel: number;
  @Input() level = 1;
  wordsToUse: UserWord[][];
  @Input() text = '';
  haikus: Observable<Haiku[]>;

  constructor(private fs: FireStoreService) {
    this.fs.getUserProfile().subscribe((u) => {
      this.userSettings = u;
      this.userWords = u.words ? u.words : [];
      this.maxLevel = u.maxWKLevel ? u.maxWKLevel : 0;
      this.level = 1;
      this.refresh();
    });

    this.haikus = this.fs.getHaikus();
  }

  refresh() {
    this.wordsToUse = [];
    for (let i = this.level; i <= 60; i++) {
      const levelWords = this.userWords.filter((w) => w.l === i && w.s > 0);
      this.shuffleArray(levelWords);
      if (levelWords.length > 0) {
        this.wordsToUse.push(levelWords.slice(0, 3));
      }
    }
  }

  skip() {
    this.refresh();
  }

  async save() {
    const haiku: Haiku = { text: this.text };
    await this.fs.saveHaiku(haiku).subscribe((val) => {});
  }

  shuffleArray(array: UserWord[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}
