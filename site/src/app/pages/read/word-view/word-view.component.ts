import { Component, Input, OnInit } from '@angular/core';
import { SentenceWord, StageLabels } from 'functions/src/shared/types';

@Component({
  selector: 'app-word-view',
  templateUrl: './word-view.component.html',
  styleUrls: ['./word-view.component.scss'],
})
export class WordViewComponent {
  @Input() word: SentenceWord;
  stageLabels = StageLabels;
}
