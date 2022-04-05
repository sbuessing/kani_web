// NHK Processing file.
export interface ArticleRaw {
  news_id: string;
  title: string;
  news_web_url: string;
  news_prearranged_time: string;
  news_web_image_uri: string;
  news_easy_image_uri: string;
}

export interface SentenceKanji {
  kanji: string;
  wkLevel?: number;
  wkid?: number;
  wkPron: string; // Pronunciation.
  wkDef?: string;
  jmDef?: string;
  jmOn?: string;
}

export interface SentenceWord {
  orig: string; // Form in sentence.
  dict?: string; // Dictionary form
  read?: string; // Reading from conjugator
  def?: string; // Definition from JMDict
  // TODO: make this the wk key.  I keep f'ing up this field.  It's always dictionary form.
  wk?: string;
  wkid?: number;
  wkRead?: string; // Reading from Wanikani.  Do I need this?
  wkLevel?: number;
  wkKanji?: number; // Max Wanikani kanji level.
  wkDef?: string; // Definition from Wanikani
  jlpt?: number;
  kanji?: SentenceKanji[];

  // NOTE: This field is only populated on the client side. It's probably a hack to have it in the base data structure but this works.
  userStatus?: number;
}

export interface Sentence {
  key?: string;
  english: string;
  japanese: string;
  level?: number;
  wkWord?: string;
  words?: SentenceWord[];
  score?: number;
}

// This is a file type not a Firestore type.
export interface SentenceSet {
  key: string;
  wkid: number;
  worstScore: number;
  sentences: Sentence[];
}

export interface Article {
  news_id: string;
  title: string;
  titleSentence?: Sentence;
  date: string;
  news_web_url: string;
  image: string;
  body: string;
  sentences: Sentence[];
  articleStats?: ArticleStats;
}

export interface ArticleStats {
  n5Words: number;
  n4Words: number;
  n3Words: number;
  n2Words: number;
  n1Words: number;
  unknownWords: number;
  wordCount: number;
}

export enum NewsSource {
  NHK = 'nhk',
  NHKHard = 'nhkhard',
  Gakken = 'gakken',
  Maisho = 'maisho',
  Mainichi = 'mainichi',
  Botchan = 'botchan',
}

export function newsSourceName(newsSource: NewsSource) {
  switch (newsSource) {
    case NewsSource.NHK:
      return 'NHK Easy';
    case NewsSource.NHKHard:
      return 'NHK News';
    case NewsSource.Maisho:
      return 'Maisho News';
    case NewsSource.Mainichi:
      return 'Mainichi News';
    case NewsSource.Gakken:
      return 'Gakken Science';
    case NewsSource.Botchan:
      return 'Botchan Chapters';
  }
}

export interface ArticleParser {
  storageLocation: string;
  findArticles(): Promise<ArticleRaw[]>;
  fetchArticle(raw: ArticleRaw): Promise<Article>;
}

////// Summaries, used for both platforms.
export interface ArticleSummary {
  article_id: string;
  title: string;
  date: string;
  image: string;
  stats?: ArticleStats;
}
export interface NewsStats {
  articles: ArticleSummary[];
}
export interface WordStats {
  word: string;
  level: number;
  goodSentenceCount: number;
  occurrences: number;
}

////// Code enums and functions, not used for storage.

// TODO: This should probably be in a metadata file somewhere.
export const JLPTStats = {
  '1': 3304,
  '2': 1822,
  '3': 1721,
  '4': 579,
  '5': 670,
};

export enum LearningStatus {
  Known = 0,
  Learning = 1,
  WillLearnWord = 2,
  WillLearnKanji = 3,
  WontLearn = 4,
}

export enum SRSStage {
  //    Locked = 0,
  Lesson = 0,
  Apprentice1 = 1,
  Apprentice2 = 2,
  Apprentice3 = 3,
  Apprentice4 = 4,
  Guru1 = 5,
  Guru2 = 6,
  Master = 7,
  Enlightened = 8,
  Burned = 9,
}

export const StageLabels = new Map([
  // [SRSStage.Locked, 'Locked'],
  [SRSStage.Lesson, 'Lesson'],
  [SRSStage.Apprentice1, 'Apprentice 1'],
  [SRSStage.Apprentice2, 'Apprentice 2'],
  [SRSStage.Apprentice3, 'Apprentice 3'],
  [SRSStage.Apprentice4, 'Apprentice 4'],
  [SRSStage.Guru1, 'Guru 1'],
  [SRSStage.Guru2, 'Guru 2'],
  [SRSStage.Master, 'Master'],
  [SRSStage.Enlightened, 'Enlightened'],
  [SRSStage.Burned, 'Burned'],
]);

export function getStageColor(stage: SRSStage): string {
  switch (stage) {
    case SRSStage.Lesson:
      return '#999';
    case SRSStage.Apprentice1:
      return '#ff80d5';
    case SRSStage.Apprentice2:
      return '#ff80d5';
    case SRSStage.Apprentice3:
      return '#ff80d5';
    case SRSStage.Apprentice4:
      return '#ff80d5';
    case SRSStage.Guru1:
      return '#bb60d2';
    case SRSStage.Guru2:
      return '#bb60d2';
    case SRSStage.Master:
      return '#6680e5';
    case SRSStage.Enlightened:
      return '#00aaff';
    case SRSStage.Burned:
      return '#faac05';
  }
}

// Helper functions
export function containsKanji(word: string): boolean {
  for (let i = 0; i < word.length; i++) {
    if (isKanji(word.charAt(i))) {
      return true;
    }
  }
  return false;
}

export function isKanji(ch: string): boolean {
  return (
    (ch >= '\u4e00' && ch <= '\u9faf') ||
    (ch >= '\u3400' && ch <= '\u4dbf') ||
    ch === '𠮟'
  );
}
