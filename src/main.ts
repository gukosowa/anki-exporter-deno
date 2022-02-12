import { Language } from './types.ts';
import { AnkiBuilder } from './anki/index.ts';
import { fetchPages } from './tatoeba.ts';
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

async function createDeck(
  from: number,
  to: number,
  sentence: Language = 'jpn',
  throttle = 1000,
) {
  const apkg = new AnkiBuilder(configAnki);
  const results = await fetchPages(from, to, sentence, throttle);

  for (const result of results) {
    const sentence = result.text;
    const translation = result.translations[0][0].text;
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

  await apkg.save();

  Deno.removeSync(pathDeck, { recursive: true });
  Deno.removeSync(pathMedia, { recursive: true });
}

await createDeck(1, 3, 'jpn', 200);
