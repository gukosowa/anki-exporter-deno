export interface CompleteSort {
  'Sentences.created': string;
}

export type Language = 'deu' | 'eng' | 'jpn'

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
  direction: string;
  limit?: any;
  sortDefault: boolean;
  directionDefault: boolean;
  scope?: any;
  completeSort: CompleteSort;
}

export interface Paging {
  Sentences: Sentences;
}

export interface User {
  username: string;
}

export interface Transcription {
  id: number;
  sentence_id: number;
  script: string;
  text: string;
  user_id?: number;
  needsReview: boolean;
  modified: Date;
  user: User;
  readonly: boolean;
  type: string;
  html: string;
  markup?: any;
  info_message: string;
}

export interface Audio {
  author: string;
}

export interface User2 {
  username: string;
}

export interface Result {
  id: number;
  text: string;
  lang: string;
  correctness: number;
  script?: any;
  license: string;
  translations: any[][];
  transcriptions: Transcription[];
  audios: Audio[];
  user: User2;
  lang_name: string;
  dir: string;
  lang_tag: string;
  is_favorite?: any;
  is_owned_by_current_user: boolean;
  permissions?: any;
  current_user_review?: any;
}

export interface ResultApi {
  paging: Paging;
  results: Result[];
}
