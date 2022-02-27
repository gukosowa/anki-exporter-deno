import { initDatabase, insertCard } from './sql.ts';
import { Card, DeckConfig } from './typings.d.ts';
import { DB, ensureDirSync, zipDir } from '../deps.ts';
import { pathBuild, pathDeck } from '../misc.ts';

export class AnkiBuilder {
  private readonly db: DB;
  private readonly deck: DeckConfig;
  private mediaFiles: string[];

  constructor(private config: DeckConfig) {
    this.clean();
    this.db = new DB(this.destination() + 'collection.anki2');
    this.deck = {
      ...config,
      id: +new Date(),
    };
    initDatabase(this.db, this.deck);
    this.mediaFiles = [];
  }

  destination(): string {
    return pathDeck;
  }

  addCard(card: Card) {
    insertCard(this.db, this.deck, card);
  }

  addMedia(filename: string, data: Uint8Array) {
    const index = this.mediaFiles.length;
    this.mediaFiles.push(filename);
    Deno.writeFileSync(this.destination() + `${index}`, data);
  }

  async save(): Promise<string> {
    ensureDirSync(pathBuild);

    const mediaObj = this.mediaFiles.reduce(
      (obj: Record<number, string>, file: string, index: number) => {
        obj[index] = file;
        return obj;
      },
      {},
    );
    Deno.writeTextFileSync(
      `${this.destination()}media`,
      JSON.stringify(mediaObj),
    );

    const zipPath = `${pathBuild}${this.config.name}.apkg`;
    const zip = await zipDir(this.destination());
    await zip.writeZip(zipPath);

    return zipPath;
  }

  private clean() {
    try {
      Deno.removeSync(this.destination(), { recursive: true });
    } catch (_e) {
      // skip
    }
    ensureDirSync(this.destination());
  }
}
