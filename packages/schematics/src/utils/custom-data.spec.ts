import { logging } from '@angular-devkit/core';
import { HostTree, SchematicsException } from '@angular-devkit/schematics';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { readCustomIconMapping, readCustomJson } from './custom-data';

function loggerWithMessages(): { logger: logging.Logger; warnings: string[] } {
    const logger = new logging.Logger('test');
    const warnings: string[] = [];

    logger.subscribe(({ level, message }) => level === 'warn' && warnings.push(message));

    return { logger, warnings };
}

describe('readCustomJson', () => {
    it('reads a path relative to the workspace root', () => {
        const tree = new HostTree();

        tree.create('/icons/data.json', '[1]');

        expect(readCustomJson(tree, 'icons/data.json')).toEqual([1]);
    });

    it('tries the bases in order', () => {
        const tree = new HostTree();

        tree.create('/libs/data.json', '["libs"]');
        tree.create('/data.json', '["root"]');

        expect(readCustomJson(tree, 'data.json', ['/libs', '/'])).toEqual(['libs']);
        expect(readCustomJson(tree, 'data.json', ['/apps', '/'])).toEqual(['root']);
    });

    it('falls back to an absolute path outside the tree', () => {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'custom-data-'));
        const file = path.join(dir, 'data.json');

        fs.writeFileSync(file, '["disk"]');

        try {
            expect(readCustomJson(new HostTree(), file)).toEqual(['disk']);
        } finally {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    });

    it('throws on a file found nowhere', () => {
        expect(() => readCustomJson(new HostTree(), 'missing.json')).toThrow("Unable to find 'missing.json'");
    });
});

describe('readCustomIconMapping', () => {
    it('reads replace/replaceWith pairs without a warning', () => {
        const tree = new HostTree();
        const { logger, warnings } = loggerWithMessages();

        tree.create('/data.json', JSON.stringify([{ replace: 'kbq-a_16', replaceWith: 'kbq-b_16' }]));

        expect(readCustomIconMapping(tree, 'data.json', logger)).toEqual([{ from: 'kbq-a_16', to: 'kbq-b_16' }]);
        expect(warnings).toEqual([]);
    });

    it('still reads the deprecated from/to pairs, with a warning', () => {
        const tree = new HostTree();
        const { logger, warnings } = loggerWithMessages();

        tree.create('/data.json', JSON.stringify([{ from: 'a_16', to: 'b_16' }]));

        expect(readCustomIconMapping(tree, 'data.json', logger)).toEqual([{ from: 'a_16', to: 'b_16' }]);
        expect(warnings).toEqual([expect.stringContaining('deprecated { "from", "to" } pairs')]);
    });

    it.each([
        ['an object', '{ "replace": "a", "replaceWith": "b" }'],
        ['an entry of neither shape', '[{ "replace": "a" }]']
    ])('throws on %s', (_: string, content: string) => {
        const tree = new HostTree();

        tree.create('/data.json', content);

        expect(() => readCustomIconMapping(tree, 'data.json', loggerWithMessages().logger)).toThrow(
            SchematicsException
        );
    });
});
