import { DB } from 'https://deno.land/x/sqlite@v3.2.1/mod.ts';
import { initDatabase, insertCard } from './sql.ts';
import { zipDir } from 'https://deno.land/x/jszip@0.11.0/mod.ts';
import { Card, DeckConfig } from './typings.d.ts';
import { ensureDirSync } from 'https://deno.land/std@0.125.0/fs/ensure_dir.ts';

export class AnkiBuilder {
  private readonly db: DB;
  private readonly deck: DeckConfig;
  private readonly dest: string;
  private mediaFiles: string[];

  constructor(private config: DeckConfig) {
    this.dest = './deck/';
    this.clean();
    this.db = new DB(this.dest + 'collection.anki2');
    this.deck = {
      ...config,
      id: +new Date(),
    };
    initDatabase(this.db, this.deck);
    this.mediaFiles = [];
  }

  addCard(card: Card) {
    insertCard(this.db, this.deck, card);
  }

  addMedia(filename: string, data: Uint8Array) {
    const index = this.mediaFiles.length;
    this.mediaFiles.push(filename);
    Deno.writeFileSync(this.dest + `${index}`, data);
  }

  async save() {
    ensureDirSync('./build');

    const mediaObj = this.mediaFiles.reduce(
      (obj: Record<number, string>, file: string, index: number) => {
        obj[index] = file;
        return obj;
      },
      {},
    );
    Deno.writeTextFileSync(`${this.dest}media`, JSON.stringify(mediaObj));

    const zipPath = `./build/${this.config.name}.apkg`;
    const zip = await zipDir('./deck/');
    await zip.writeZip(zipPath);
  }

  private clean() {
    try {
      Deno.removeSync(this.dest, { recursive: true });
    } catch (_e) {
      // skip
    }
    ensureDirSync(this.dest);
  }
}
