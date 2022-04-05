export const defaultConfig = {
  copySeparator: 'tab',
  disablekeys: false,
  highlight: true,
  kanjicomponents: true,
  lineEnding: 'n',
  maxClipCopyEntries: 7,
  maxDictEntries: 7,
  minihelp: true,
  onlyreading: false,
  popupcolor: 'blue',
  popupDelay: 150,
  popupLocation: 0,
  showOnKey: '',
  textboxhl: false,
  ttsEnabled: false,
  kanjiInfo: [
    { code: 'H', name: 'Halpern', shouldDisplay: true },
    { code: 'L', name: 'Heisig 5th Edition', shouldDisplay: true },
    { code: 'DN', name: 'Heisig 6th Edition', shouldDisplay: true },
    { code: 'E', name: 'Henshall', shouldDisplay: true },
    { code: 'DK', name: 'Kanji Learners Dictionary', shouldDisplay: true },
    { code: 'N', name: 'Nelson', shouldDisplay: true },
    { code: 'V', name: 'New Nelson', shouldDisplay: true },
    { code: 'Y', name: 'PinYin', shouldDisplay: true },
    { code: 'P', name: 'Skip Pattern', shouldDisplay: true },
    { code: 'IN', name: 'Tuttle Kanji &amp; Kana', shouldDisplay: true },
    { code: 'I', name: 'Tuttle Kanji Dictionary', shouldDisplay: true },
    { code: 'U', name: 'Unicode', shouldDisplay: true },
  ],
};
type MutableConfig = typeof defaultConfig;
type Config = Readonly<MutableConfig>;

export type { Config };
