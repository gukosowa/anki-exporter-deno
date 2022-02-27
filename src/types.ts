export type Language = 'deu' | 'eng' | 'jpn';

export interface CompleteSort {
  'Sentences.created': string;
}

export interface Paging {
  Sentences: Sentences;
}

export interface Sentences {
  finder: string;
  page: number;
  current: number;
  count: number;
  perPage: number;
  start: number;
  end: number;
  prevPage: boolean;
  nextPage: boolean;
  pageCount: number;
  sort: string;
  direction: boolean;
  limit: null;
  sortDefault: boolean;
  directionDefault: boolean;
  scope: null;
  completeSort: CompleteSort;
}

export interface Result {
  id: number;
  text: string;
  lang: Language;
  correctness: number;
  script: null;
  license: License;
  translations: Array<Translation[]>;
  transcriptions: Transcription[];
  audios: ResultAudio[];
  user: User;
  lang_name: LangName;
  dir: Dir;
  lang_tag: LangTag;
  is_favorite: null;
  is_owned_by_current_user: boolean;
  permissions: null;
  current_user_review: null;
}

export interface ResultAudio {
  author: string;
}

export enum Dir {
  LTR = 'ltr',
  RTL = 'rtl',
}

export enum LangName {
  Japanisch = 'Japanisch',
}

export enum LangTag {
  Ja = 'ja',
}

export enum License {
  CcBy20Fr = 'CC BY 2.0 FR',
}

export interface Transcription {
  id: number;
  sentence_id: number;
  script: Script;
  text: string;
  user_id: number | null;
  needsReview: boolean;
  modified: Date;
  user: User | null;
  readonly: boolean;
  type: Type;
  html: string;
  markup: null;
  info_message: string;
}

export enum Script {
  Hans = 'Hans',
  Hant = 'Hant',
  Hrkt = 'Hrkt',
  Latn = 'Latn',
}

export enum Type {
  Altscript = 'altscript',
  Transcription = 'transcription',
}

export interface User {
  username: string;
}

export interface Translation {
  id: number;
  text: string;
  lang: Language;
  correctness: number;
  script: Script | null;
  transcriptions: Transcription[];
  audios: TranslationAudio[];
  isDirect?: boolean;
  lang_name: string;
  dir: Dir;
  lang_tag: string;
}

export interface TranslationAudio {
  author: null | string;
  external?: null;
  sentence_id?: number;
  user?: User | null;
}

export interface ResultApi {
  paging: Paging;
  results: Result[];
}
