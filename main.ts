import { ensureDir } from 'https://deno.land/std@0.125.0/fs/mod.ts';
import { Language, Result, ResultApi } from './types.ts';
import { AnkiBuilder } from './anki/index.ts';

function getUrl(page = 1, sentence: Language = 'jpn'): string {
  return `https://tatoeba.org/de/api_v0/search?from=${sentence}&has_audio=yes&native=yes&orphans=no&query=&sort=created&sort_reverse=&tags=&to=&trans_filter=limit&trans_has_audio=&trans_link=&trans_orphan=&trans_to=&trans_unapproved=&trans_user=&unapproved=no&user=&page=${
    '' + page
  }`;
}
// console.log(apkg);

async function fetchBody(url: string): Promise<ResultApi> {
  const response = await fetch(url);
  return JSON.parse(await response.text()) as ResultApi;
}

async function _clearFolderAudio() {
  await Deno.remove(getAudioPath(), { recursive: true });
}

function getAudioPath(): string {
  return './media/';
}

async function downloadAudio(result: Result): Promise<void> {
  await ensureDir(getAudioPath());
  const res = await fetch(getAudioUrl(result));
  const uint8Array = new Uint8Array(await res.arrayBuffer());
  return Deno.writeFile(`${getAudioPath()}${result.id}.mp3`, uint8Array);
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

async function fetchPages(
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

async function createDeck(
  from: number,
  to: number,
  sentence: Language = 'jpn',
  throttle = 1000,
) {
  const apkg = new AnkiBuilder({
    name: 'tatoeba',
    card: {
      fields: ['sentence', 'translation', 'reference'],
      template: {
        question: '{{sentence}}',
        answer: `
  <div class="translation">{{translation}}</div>
  <div class="reference"><a href="https://tatoeba.org/de/sentences/show/{{reference}}" style="
    display: block;
    margin-top: 10px;
    font-size: small;
    color: black;
">ref</a></div>`,
      },
    },
  });
  const results = await fetchPages(from, to, sentence, throttle);

  for (const result of results) {
    const sentence = result.text;
    const translation = result.translations[0][0].text;
    const transcription = result.transcriptions[0]?.html ?? '';
    const audioFile = `${result.id}.mp3`;
    const audioPath = `${getAudioPath()}${audioFile}`;

    apkg.addMedia(audioFile, Deno.readFileSync(audioPath));
    apkg.addCard({
      content: [
        `${sentence}[sound:${audioFile}]`,
        `${transcription} <br><br>  ${translation}`,
        `${result.id}`,
      ],
    });
  }

  await apkg.save();

  Deno.removeSync('./deck/', { recursive: true });
  Deno.removeSync('./media/', { recursive: true });
}

await createDeck(1, 50, 'jpn', 1000);
