import { Language, Result, ResultApi, Translation } from './types.ts';
import { pathMedia } from './misc.ts';
import { ensureDir } from './deps.ts';

function getUrl(page = 1, sentence: Language = 'jpn'): string {
  const sort: 'created' | 'random' = 'random';
  const randSeed = randomString(4);
  if (sort === 'random') {
    console.log('Random seed', randSeed);
  }
  return `https://tatoeba.org/de/api_v0/search?from=${sentence}&has_audio=yes&native=yes&orphans=no&query=&sort=${sort}&sort_reverse=&rand_seed=${randSeed}&tags=&to=&trans_filter=limit&trans_has_audio=&trans_link=&trans_orphan=&trans_to=&trans_unapproved=&trans_user=&unapproved=no&user=&page=${
    '' + page
  }`;
}

function randomString(length: number, charSet?: string): string {
  charSet = charSet ??
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  for (let i = 0; i < length; i++) {
    const randomPoz = Math.floor(Math.random() * charSet.length);
    randomString += charSet.substring(randomPoz, randomPoz + 1);
  }
  return randomString;
}

async function fetchBody(url: string): Promise<ResultApi> {
  const response = await fetch(url);
  const text = await response.text();
  let json;
  for (let retry = 0; retry < 20; retry++) {
    try {
      json = JSON.parse(text);
    } catch (_e) {
      console.log('Error: ' + text);
      await sleep(1000);
    }
  }

  return json as ResultApi;
}

async function downloadAudio(result: Result): Promise<void> {
  await ensureDir(pathMedia);
  const res = await fetch(getAudioUrl(result));
  const uint8Array = new Uint8Array(await res.arrayBuffer());
  return Deno.writeFile(`${pathMedia}${result.id}.mp3`, uint8Array);
}

function getAudioUrl(result: Result): string {
  return `https://audio.tatoeba.org/sentences/jpn/${result.id}.mp3`;
}

async function fetchPage(
  page: number,
  sentence: Language = 'jpn',
): Promise<Result[]> {
  const json = await fetchBody(getUrl(page, sentence));

  const promises = [];
  for (const result of json.results) {
    promises.push(downloadAudio(result));
  }

  await Promise.all(promises);

  return json.results;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getTranslation(
  translations: Translation[],
  preferLang: Language[],
): string {
  let translation = translations[0].text;
  for (let i = 0; i < preferLang.length; i++) {
    const lang = preferLang[i];
    const trans = translations.find((translation) => translation.lang === lang);
    if (trans) {
      translation = trans.text;
      break;
    }
  }
  return translation;
}

export async function fetchPages(
  from: number,
  to: number,
  sentence: Language = 'jpn',
  throttle = 1000,
): Promise<Result[]> {
  const results: Result[][] = [];
  for (let page = from; page <= to; page++) {
    console.log(`Crawl page ${page}`);
    results.push(await fetchPage(page, sentence));
    await sleep(throttle);
  }

  return results.flat();
}
