import { BotchanParser } from './botchan_parser';
import { GakkenParser } from './gakken_parser';
import { MainichiParser } from './mainichi_parser';
import { MaishoParser } from './maisho_parser';
import { NHKHardParser } from './nhk_hard_parser';
import { NHKParser } from './nhk_parser';
import { ArticleParser, NewsSource } from './shared/types';

export function getParser(type: NewsSource): ArticleParser {
  switch (type) {
    case NewsSource.NHK: {
      return new NHKParser();
    }
    case NewsSource.Maisho: {
      return new MaishoParser();
    }
    case NewsSource.Mainichi: {
      return new MainichiParser();
    }
    case NewsSource.Gakken: {
      return new GakkenParser();
    }
    case NewsSource.NHKHard: {
      return new NHKHardParser();
    }
    case NewsSource.Botchan: {
      return new BotchanParser();
    }
  }
}
