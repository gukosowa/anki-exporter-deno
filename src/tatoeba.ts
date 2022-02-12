import { Language, Result, ResultApi } from './types.ts';
import { pathMedia } from './misc.ts';
import { ensureDir } from './deps.ts';

function getUrl(page = 1, sentence: Language = 'jpn'): string {
  return `https://tatoeba.org/de/api_v0/search?from=${sentence}&has_audio=yes&native=yes&orphans=no&query=&sort=created&sort_reverse=&tags=&to=&trans_filter=limit&trans_has_audio=&trans_link=&trans_orphan=&trans_to=&trans_unapproved=&trans_user=&unapproved=no&user=&page=${
    '' + page
  }`;
}

async function fetchBody(url: string): Promise<ResultApi> {
  const response = await fetch(url);
  return JSON.parse(await response.text()) as ResultApi;
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

export async function fetchPages(
  from: number,
  to: number,
  sentence: Language = 'jpn',
  throttle = 1000,
): Promise<Result[]> {
  const promises: Promise<Result[]>[] = [];
  for (let page = from; page <= to; page++) {
    console.log(`Crawl page ${page}`);
    promises.push(fetchPage(page, sentence));
    await sleep(throttle);
  }

  const results = await Promise.all(promises) as Result[][];

  return results.flat();
}
