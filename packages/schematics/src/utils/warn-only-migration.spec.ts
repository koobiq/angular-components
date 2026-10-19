import { logging } from '@angular-devkit/core';
import { SchematicContext, Tree } from '@angular-devkit/schematics';
import { WarnOnlyConfig, warnOnlyRule } from './warn-only-migration';

const LABEL = '[example-warn-only]';

const CONFIG: WarnOnlyConfig = {
    label: LABEL,
    warnPatterns: [
        { pattern: '\\bremovedHelper\\b', message: 'removedHelper is gone.' },
        { anchor: '\\bKbqExample\\b', pattern: '\\.value\\s*=[^=]', message: 'KbqExample.value is read-only.' }
    ],
    summary: ['Summary line.']
};

/** Runs the rule straight on `tree` and returns what it logged. */
async function run(tree: Tree): Promise<string> {
    const logger = new logging.Logger('warn-only-migration');
    const messages: string[] = [];

    logger.subscribe(({ message }) => messages.push(message));

    await warnOnlyRule(CONFIG, {})(tree, { logger } as unknown as SchematicContext);

    return messages.join('\n');
}

describe('warnOnlyRule', () => {
    let tree: Tree;

    beforeEach(() => {
        tree = Tree.empty();
    });

    it('reports every matching pattern of every .ts file, then the summary, and writes nothing', async () => {
        const content = 'removedHelper(); const example: KbqExample = get(); example.value = 1;\n';

        tree.create('/src/a.ts', content);
        tree.create('/src/b.ts', 'removedHelper();\n');

        const log = await run(tree);

        expect(log).toContain(`${LABEL} /src/a.ts\n  removedHelper is gone.`);
        expect(log).toContain(`${LABEL} /src/a.ts\n  KbqExample.value is read-only.`);
        expect(log).toContain(`${LABEL} /src/b.ts\n  removedHelper is gone.`);
        expect(log).toContain(`${LABEL} processed "<workspace root>", 3 use(s) reported.\nSummary line.`);
        expect(tree.readText('/src/a.ts')).toBe(content);
    });

    it('checks a pattern with an anchor only in files that match the anchor', async () => {
        tree.create('/src/form.ts', 'form.value = 1;\n');

        expect(await run(tree)).not.toContain(LABEL);
    });

    it('ignores other files and the skipped directories', async () => {
        tree.create('/src/app.html', 'removedHelper\n');
        tree.create('/node_modules/pkg/index.ts', 'removedHelper();\n');
        tree.create('/dist/app/main.ts', 'removedHelper();\n');

        expect(await run(tree)).not.toContain(LABEL);
    });
});
