import { Language } from './types.ts';
import { AnkiBuilder } from './anki/index.ts';
import { fetchPages, getTranslation } from './tatoeba.ts';
import { pathDeck, pathMedia } from './misc.ts';

const configAnki = {
  name: 'tatoeba_' + +new Date(),
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
};

export async function createDeck(
  from: number,
  to: number,
  sentence: Language = 'jpn',
  throttle = 1000,
  preferLang: Language[] = ['deu', 'eng'],
) {
  const apkg = new AnkiBuilder(configAnki);
  const results = await fetchPages(from, to, sentence, throttle);

  console.log(`Build ${results.length} Anki cards...`);
  for (const result of results) {
    const sentence = result.text;
    const translation = getTranslation(result.translations[0], preferLang);
    const transcription = result.transcriptions[0]?.html ?? '';
    const audioFile = `${result.id}.mp3`;
    const audioPath = `${pathMedia}${audioFile}`;

    apkg.addMedia(audioFile, Deno.readFileSync(audioPath));
    apkg.addCard({
      content: [
        `${sentence}[sound:${audioFile}]`,
        `${transcription} <br><br>  ${translation}`,
        `${result.id}`,
      ],
    });
  }

  console.log('Zip and save created files...');
  const filename = await apkg.save();

  Deno.removeSync(pathDeck, { recursive: true });
  Deno.removeSync(pathMedia, { recursive: true });

  console.log(`Cleared temp files and created out/${filename}`);
}
