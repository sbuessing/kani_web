import { Component, QueryList, ViewChildren } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  signInAnonymously,
  signInWithPopup,
} from '@angular/fire/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Sentence } from 'functions/src/shared/types';
import { SentenceViewComponent } from '../read/sentence_view/sentence_view.component';

declare function gtag(a: string, b: string, c: any): any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  sentences: Sentence[] = SampleSentences;
  @ViewChildren(SentenceViewComponent)
  sentenceViews: QueryList<SentenceViewComponent>;
  constructor(
    private auth: Auth,
    private router: Router,
    private snackBar: MatSnackBar,
    private titleService: Title
  ) {
    titleService.setTitle("Kani Reader Login");
  }


  login() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(this.auth, provider)
      .then(() => {
        this.router.navigateByUrl('/home');
        gtag('event', 'conversion', { 'send_to': 'AW-1056918717/SVI0CIa1tZYDEL2Z_fcD' });
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        this.snackBar.open(
          'There was an error, please refresh. ' + error.code,
          '',
          { duration: 3000 }
        );
      });
  }

  loginAnonymously() {
    signInAnonymously(this.auth)
      .then(() => {
        this.router.navigateByUrl('/home');
        gtag('event', 'conversion', { 'send_to': 'AW-1056918717/SVI0CIa1tZYDEL2Z_fcD' });
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        this.snackBar.open(
          'There was an error, please refresh. ' + error.code,
          '',
          { duration: 3000 }
        );
      });
  }

  select(sentence: Sentence) {
    this.sentenceViews.forEach((view) => {
      view.active = view.sentence === sentence;
    });
  }
}

const SampleSentences: Sentence[] = [
  {
    japanese: '「機動戦士ガンダム」は日本の有名なアニメです。',
    english: '"Mobile Suit Gundam" is a famous Japanese anime.',
    words: [
      {
        orig: '「',
      },
      {
        orig: '機動',
        dict: '機動',
        read: 'きどう',
        def: 'maneuver (usu. of military force)',
        kanji: [
          {
            kanji: '機',
            wkLevel: 20,
            wkDef: 'Machine',
            wkid: 1090,
            wkPron: 'き',
            jmDef:
              'loom, mechanism, machine, airplane, opportunity, potency, efficacy, occasion',
            jmOn: 'キ、 はた',
          },
          {
            kanji: '動',
            wkLevel: 12,
            wkDef: 'Move',
            wkid: 827,
            wkPron: 'どう',
            jmDef: 'move, motion, change, confusion, shift, shake',
            jmOn: 'ドウ、 うご.く、 うご.かす',
          },
        ],
        wkKanji: 20,
      },
      {
        orig: '戦士',
        dict: '戦士',
        read: 'せんし',
        def: 'soldier',
        kanji: [
          {
            kanji: '戦',
            wkLevel: 11,
            wkDef: 'War',
            wkid: 803,
            wkPron: 'せん',
            jmDef: 'war, battle, match',
            jmOn: 'セン、 いくさ、 たたか.う、 おのの.く、 そよ.ぐ、 わなな.く',
          },
          {
            kanji: '士',
            wkLevel: 13,
            wkDef: 'Samurai',
            wkid: 877,
            wkPron: 'し',
            jmDef: 'gentleman, scholar, samurai, samurai radical (no. 33)',
            jmOn: 'シ、 さむらい',
          },
        ],
        wkKanji: 13,
      },
      {
        orig: 'ガン',
      },
      {
        orig: 'ダム',
      },
      {
        orig: '」',
      },
      {
        orig: 'は',
      },
      {
        orig: '日本',
        dict: '日本',
        read: 'にっぽん',
        wk: '日本',
        wkid: 2570,
        wkRead: 'にほん',
        wkDef: 'Japan',
        wkLevel: 2,
        jlpt: 3,
        def: 'Japan',
        kanji: [
          {
            kanji: '日',
            wkLevel: 2,
            wkDef: 'Sun',
            wkid: 476,
            wkPron: 'にち, じつ',
            jmDef: 'day, sun, Japan, counter for days',
            jmOn: 'ニチ、 ジツ、 ひ、 -び、 -か',
          },
          {
            kanji: '本',
            wkLevel: 2,
            wkDef: 'Book',
            wkid: 487,
            wkPron: 'ほん',
            jmDef:
              'book, present, main, origin, true, real, counter for long cylindrical things',
            jmOn: 'ホン、 もと',
          },
        ],
        wkKanji: 2,
      },
      {
        orig: 'の',
      },
      {
        orig: '有名',
        dict: '有名',
        read: 'ゆうめい',
        wk: '有名',
        wkid: 2869,
        wkRead: 'ゆうめい',
        wkDef: 'Famous',
        wkLevel: 6,
        jlpt: 5,
        def: 'famous',
        kanji: [
          {
            kanji: '有',
            wkLevel: 6,
            wkDef: 'Have',
            wkid: 615,
            wkPron: 'ゆう, う',
            jmDef: 'possess, have, exist, happen, occur, approx',
            jmOn: 'ユウ、 ウ、 あ.る',
          },
          {
            kanji: '名',
            wkLevel: 4,
            wkDef: 'Name',
            wkid: 544,
            wkPron: 'めい, みょう',
            jmDef: 'name, noted, distinguished, reputation',
            jmOn: 'メイ、 ミョウ、 な、 -な',
          },
        ],
        wkKanji: 6,
      },
      {
        orig: 'な',
      },
      {
        orig: 'アニメ',
      },
      {
        orig: 'です',
      },
      {
        orig: '。',
      },
    ],
    level: 6,
    wkWord: '有名',
  },
  {
    japanese:
      'このアニメの主人公、アムロが乗って戦った「νガンダム」の像が福岡市にできます。',
    english:
      'A statue of "ν Gundam", in which Amuro, the main character of this animation, fought on board, can be created in Fukuoka City.',
    words: [
      {
        orig: 'この',
      },
      {
        orig: 'アニメ',
      },
      {
        orig: 'の',
      },
      {
        orig: '主人公',
        dict: '主人公',
        read: 'しゅじんこう',
        jlpt: 1,
        def: 'protagonist',
        kanji: [
          {
            kanji: '主',
            wkLevel: 4,
            wkDef: 'Master',
            wkid: 528,
            wkPron: 'しゅ',
            jmDef: 'lord, chief, master, main thing, principal',
            jmOn: 'シュ、 ス、 シュウ、 ぬし、 おも、 あるじ',
          },
          {
            kanji: '人',
            wkLevel: 1,
            wkDef: 'Person',
            wkid: 444,
            wkPron: 'にん, じん',
            jmDef: 'person',
            jmOn: 'ジン、 ニン、 ひと、 -り、 -と',
          },
          {
            kanji: '公',
            wkLevel: 3,
            wkDef: 'Public',
            wkid: 499,
            wkPron: 'こう',
            jmDef: 'public, prince, official, governmental',
            jmOn: 'コウ、 ク、 おおやけ',
          },
        ],
        wkKanji: 4,
      },
      {
        orig: '、',
      },
      {
        orig: 'アムロ',
      },
      {
        orig: 'が',
      },
      {
        orig: '乗っ',
        dict: '乗る',
        read: 'のっ',
        wk: '乗る',
        wkid: 3112,
        wkRead: 'のる',
        wkDef: 'To Ride',
        wkLevel: 9,
        jlpt: 5,
        def: 'power',
        kanji: [
          {
            kanji: '乗',
            wkLevel: 9,
            wkDef: 'Ride',
            wkid: 722,
            wkPron: 'の',
            jmDef:
              'ride, power, multiplication, record, counter for vehicles, board, mount, join',
            jmOn: 'ジョウ、 ショウ、 の.る、 -の.り、 の.せる',
          },
        ],
        wkKanji: 9,
      },
      {
        orig: 'て',
      },
      {
        orig: '戦っ',
        dict: '戦う',
        read: 'たたかっ',
        wk: '戦う',
        wkid: 3578,
        wkRead: 'たたかう',
        wkDef: 'To Fight',
        wkLevel: 13,
        jlpt: 3,
        def: 'war',
        kanji: [
          {
            kanji: '戦',
            wkLevel: 11,
            wkDef: 'War',
            wkid: 803,
            wkPron: 'せん',
            jmDef: 'war, battle, match',
            jmOn: 'セン、 いくさ、 たたか.う、 おのの.く、 そよ.ぐ、 わなな.く',
          },
        ],
        wkKanji: 11,
      },
      {
        orig: 'た',
      },
      {
        orig: '「',
      },
      {
        orig: 'ν',
      },
      {
        orig: 'ガン',
      },
      {
        orig: 'ダム',
      },
      {
        orig: '」',
      },
      {
        orig: 'の',
      },
      {
        orig: '像',
        dict: '像',
        read: 'ぞう',
        jlpt: 1,
        def: 'image',
        kanji: [
          {
            kanji: '像',
            wkLevel: 13,
            wkDef: 'Statue',
            wkid: 890,
            wkPron: 'ぞう',
            jmDef: 'statue, picture, image, figure, portrait',
            jmOn: 'ゾウ',
          },
        ],
        wkKanji: 13,
      },
      {
        orig: 'が',
      },
      {
        orig: '福岡',
        dict: '福岡',
        read: 'ふくおか',
        def: 'Fukuoka (city, prefecture)',
        kanji: [
          {
            kanji: '福',
            wkLevel: 13,
            wkDef: 'Luck',
            wkid: 867,
            wkPron: 'ふく',
            jmDef: 'blessing, fortune, luck, wealth',
            jmOn: 'フク',
          },
          {
            kanji: '岡',
            wkLevel: 21,
            wkDef: 'Hill',
            wkid: 1137,
            wkPron: 'おか',
            jmDef: 'mount, hill, knoll',
            jmOn: 'コウ、 おか',
          },
        ],
        wkKanji: 21,
      },
      {
        orig: '市',
        dict: '市',
        read: 'し',
        wk: '市',
        wkid: 2635,
        wkRead: 'し',
        wkDef: 'City',
        wkLevel: 3,
        jlpt: 4,
        def: 'market',
        kanji: [
          {
            kanji: '市',
            wkLevel: 3,
            wkDef: 'City',
            wkid: 522,
            wkPron: 'し',
            jmDef: 'market, city, town',
            jmOn: 'シ、 いち',
          },
        ],
        wkKanji: 3,
      },
      {
        orig: 'に',
      },
      {
        orig: 'でき',
      },
      {
        orig: 'ます',
      },
      {
        orig: '。',
      },
    ],
    level: 13,
    wkWord: '戦う',
  },
  {
    japanese: '像の高さはアニメとだいたい同じ25mぐらいで、重さは80tです。',
    english:
      'The height of the statue is about 25m, which is about the same as the animation, and the weight is 80t.',
    words: [
      {
        orig: '像',
        dict: '像',
        read: 'ぞう',
        jlpt: 1,
        def: 'image',
        kanji: [
          {
            kanji: '像',
            wkLevel: 13,
            wkDef: 'Statue',
            wkid: 890,
            wkPron: 'ぞう',
            jmDef: 'statue, picture, image, figure, portrait',
            jmOn: 'ゾウ',
          },
        ],
        wkKanji: 13,
      },
      {
        orig: 'の',
      },
      {
        orig: '高',
        dict: '高い',
        read: 'たか',
        wk: '高い',
        wkid: 2968,
        wkRead: 'たかい',
        wkDef: 'Tall',
        wkLevel: 7,
        jlpt: 5,
        def: 'high',
        kanji: [
          {
            kanji: '高',
            wkLevel: 7,
            wkDef: 'Tall',
            wkid: 666,
            wkPron: 'こう',
            jmDef: 'tall, high, expensive',
            jmOn: 'コウ、 たか.い、 たか、 -だか、 たか.まる、 たか.める',
          },
        ],
        wkKanji: 7,
      },
      {
        orig: 'さ',
      },
      {
        orig: 'は',
      },
      {
        orig: 'アニメ',
      },
      {
        orig: 'と',
      },
      {
        orig: 'だいたい',
      },
      {
        orig: '同じ',
        dict: '同じ',
        read: 'おなじ',
        wk: '同じ',
        wkid: 2747,
        wkRead: 'おなじ',
        wkDef: 'Same',
        wkLevel: 5,
        jlpt: 5,
        def: 'same',
        kanji: [
          {
            kanji: '同',
            wkLevel: 5,
            wkDef: 'Same',
            wkid: 568,
            wkPron: 'どう',
            jmDef: 'same, agree, equal',
            jmOn: 'ドウ、 おな.じ',
          },
        ],
        wkKanji: 5,
      },
      {
        orig: '25',
      },
      {
        orig: 'm',
      },
      {
        orig: 'ぐらい',
      },
      {
        orig: 'で',
      },
      {
        orig: '、',
      },
      {
        orig: '重',
        dict: '重い',
        read: 'おも',
        wk: '重い',
        wkid: 3150,
        wkRead: 'おもい',
        wkDef: 'Heavy',
        wkLevel: 9,
        jlpt: 5,
        def: '-fold',
        kanji: [
          {
            kanji: '重',
            wkLevel: 9,
            wkDef: 'Heavy',
            wkid: 735,
            wkPron: 'じゅう',
            jmDef:
              'heavy, important, esteem, respect, heap up, pile up, nest of boxes, -fold',
            jmOn: 'ジュウ、 チョウ、 え、 おも.い、 おも.り、 おも.なう、 かさ.ねる、 かさ.なる、 おも',
          },
        ],
        wkKanji: 9,
      },
      {
        orig: 'さ',
      },
      {
        orig: 'は',
      },
      {
        orig: '80',
      },
      {
        orig: 't',
      },
      {
        orig: 'です',
      },
      {
        orig: '。',
      },
    ],
    level: 9,
    wkWord: '重い',
  },
];
