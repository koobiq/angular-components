import { readFileSync } from 'fs';
import * as path from 'path';

type Registry = { schematics: Record<string, { description: string }> };

const read = (file: string): Registry['schematics'] =>
    (JSON.parse(readFileSync(path.join(__dirname, file), 'utf8')) as Registry).schematics;

/** `ng g --help` shows the collection.json description, `ng update` the migrations.json one. */
describe('schematic descriptions', () => {
    it('should match between collection.json and migrations.json', () => {
        const collection = read('collection.json');
        const migrations = read('migrations.json');
        const mismatched = Object.keys(migrations).filter(
            (name) => name in collection && collection[name].description !== migrations[name].description
        );

        expect(mismatched).toEqual([]);
    });
});
