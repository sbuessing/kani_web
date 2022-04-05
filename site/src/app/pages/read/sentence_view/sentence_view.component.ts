import { BLACK_ON_WHITE_CSS_CLASS } from '@angular/cdk/a11y/high-contrast-mode/high-contrast-mode-detector';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import {
  containsKanji,
  LearningStatus,
  Sentence,
  SentenceWord,
  StageLabels,
} from 'functions/src/shared/types';

// A visual component that renders a sentence with expansion and highlighting capabilities.
@Component({
  selector: 'app-sentence-view',
  templateUrl: './sentence_view.component.html',
  styleUrls: ['./sentence_view.component.scss'],
})
export class SentenceViewComponent {
  @ViewChild('sentenceDiv') sentenceDiv: ElementRef;
  @Input() sentence: Sentence;
  @Input() jlptKnown;
  @Input() jlptStudy;
  @Input() active = false;
  // TODO, might be cleaner to put these behind a method.
  @Input() showEnglish = false;
  @Input() showMeaning = false;
  playing = window.speechSynthesis.speaking;
  stageLabels = StageLabels;
  containsKanji = containsKanji;

  focus() {
    this.sentenceDiv.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
  }

  learningStatus(word: SentenceWord): LearningStatus {
    if (
      !containsKanji(word.orig) ||
      word.userStatus > 8 ||
      (this.jlptKnown > 0 && word.jlpt >= this.jlptKnown)
    ) {
      return LearningStatus.Known;
    }
    if (
      word.userStatus > 0 ||
      (this.jlptStudy > 0 && word.jlpt >= this.jlptStudy)
    ) {
      return LearningStatus.Learning;
    }
    if (word.wk != null) {
      return LearningStatus.WillLearnWord;
    }
    if (word.wkKanji != null) {
      return LearningStatus.WillLearnKanji;
    }
    return LearningStatus.WontLearn;
  }

  // TODO: How do I use an enum with CSS?
  textColor(word: SentenceWord): string {
    switch (this.learningStatus(word)) {
      case LearningStatus.Known: {
        return '#555555';
      }
      case LearningStatus.Learning: {
        return '#71D1FF';
      }
      case LearningStatus.WillLearnWord: {
        return '#C999E8';
      }
      case LearningStatus.WillLearnKanji: {
        return '#85CC52';
      }
      case LearningStatus.WontLearn: {
        return '#F3008E';
      }
    }
  }

  showFurigana(word: SentenceWord): boolean {
    return this.learningStatus(word) >= LearningStatus.Learning;
  }

  showDefinition(word: SentenceWord): boolean {
    return this.learningStatus(word) >= LearningStatus.WillLearnWord;
  }

  definition(span: SentenceWord): string {
    return span.wk ? span.wkDef : span.def ? span.def : '';
  }

  furigana(word: SentenceWord): string {
    if (!this.showFurigana(word)) { return null; }
    return word.read;
  }

  briefDef(span: SentenceWord): string {
    if (!this.showDefinition(span)) {return null;}
    let def = this.definition(span).trim();
    if (def.charAt(0) === '(') {
      def = def.substr(def.indexOf(')') + 1).trim();
    } // Remove first paranthetical.
    if (def.includes('(')) {
      def = def.substr(0, def.indexOf('('));
    }
    return def;
  }

  speak() {
    this.playing = true;
    // https://developers.google.com/web/updates/2014/01/Web-apps-that-talk-Introduction-to-the-Speech-Synthesis-API
    const msg = new SpeechSynthesisUtterance(this.sentence.japanese);
    msg.lang = 'ja-JP';
    const voices = window.speechSynthesis.getVoices();
    for (const voice of voices) {
      if (voice.lang === 'ja-JP') {
        msg.voice = voice;
        break;
      }
    }
    msg.rate = 0.75;
    msg.onend = (event) => {
      this.playing = false;
    };
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(msg);
  }

  stop() {
    window.speechSynthesis.cancel();
    this.playing = false;
  }
}
