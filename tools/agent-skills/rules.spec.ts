import { firstSentence, parseTokenNames, renderMigrations } from './content';
import { checkFacts, checkLinks, checkSkillFile, KnownFacts } from './rules';

const FACTS: KnownFacts = {
    exports: new Set(['KbqButtonModule', 'KBQ_WINDOW', 'kbqThemeProvider']),
    elements: new Set(['kbq-form-field']),
    attributes: new Set(['kbqInput', 'kbq-button']),
    bindings: new Set(['kbqTooltipPlacement']),
    sourceNames: new Set(['kbqDatepickerMin']),
    tokens: new Set(['--kbq-foreground-contrast', '--kbq-button-filled-background']),
    entryPoints: new Set(['button', 'core', 'scrollbar/deprecated'])
};

const problems = (text: string) => checkFacts('SKILL.md', text, FACTS).map(({ message }) => message);

describe(checkFacts.name, () => {
    it('should accept names that exist in the sources', () => {
        const text = [
            "import { KbqButtonModule } from '@koobiq/components/button';",
            "import { KbqScrollbar } from '@koobiq/components/scrollbar/deprecated';".replace(
                'KbqScrollbar',
                'KBQ_WINDOW'
            ),
            '<kbq-form-field><input kbqInput [kbqTooltipPlacement]="top" /></kbq-form-field>',
            "Use `kbqThemeProvider()` and `color: var(--kbq-foreground-contrast)`; check `hasError('kbqDatepickerMin')`.",
            'Redefine `--kbq-button-*` or `--kbq-<name>-*` tokens.',
            'Read node_modules/@koobiq/components/agent-docs/components/button.md and `@koobiq/components/<entry>`.'
        ].join('\n');

        expect(problems(text)).toEqual([]);
    });

    it('should report every name the sources do not have, with its line', () => {
        const text = [
            'KbqButtonComponent and KBQ_MISSING_TOKEN',
            '<kbq-form-control>',
            'kbqNoSuchDirective',
            '--kbq-foreground-missing and --kbq-nothing-*',
            "from '@koobiq/components/buttons'"
        ].join('\n');

        expect(checkFacts('SKILL.md', text, FACTS)).toEqual([
            { file: 'SKILL.md:1', message: '`KbqButtonComponent` is not exported by any entry point' },
            { file: 'SKILL.md:1', message: '`KBQ_MISSING_TOKEN` is not exported by any entry point' },
            {
                file: 'SKILL.md:3',
                message: '`kbqNoSuchDirective` does not exist in the library or its companion packages'
            },
            { file: 'SKILL.md:2', message: '<kbq-form-control> is not a selector of any component' },
            { file: 'SKILL.md:4', message: '`--kbq-foreground-missing` is not a defined design token' },
            { file: 'SKILL.md:4', message: '`--kbq-nothing-*` is not a defined design token' },
            { file: 'SKILL.md:5', message: '`@koobiq/components/buttons` is not an entry point' }
        ]);
    });
});

describe(checkSkillFile.name, () => {
    const skill = (frontmatter: string, body = '# Koobiq\n') => `---\n${frontmatter}\n---\n\n${body}`;

    it('should accept a skill that follows the specification', () => {
        expect(
            checkSkillFile(
                'SKILL.md',
                skill('name: koobiq-angular\ndescription: Builds Angular UI with Koobiq.'),
                'koobiq-angular'
            )
        ).toEqual([]);
    });

    it('should reject keys that claude.ai and the Skills API do not accept', () => {
        const messages = checkSkillFile(
            'SKILL.md',
            skill('name: koobiq-angular\ndescription: Builds UI.\nuser-invocable: true'),
            'koobiq-angular'
        ).map(({ message }) => message);

        expect(messages).toEqual([
            'frontmatter key "user-invocable" is not in the specification; claude.ai and the Skills API reject it'
        ]);
    });

    it('should report a wrong name, an overlong description, a long body and a leftover placeholder', () => {
        const messages = checkSkillFile(
            'SKILL.md',
            skill(`name: koobiq\ndescription: ${'a'.repeat(1025)}`, `${'line\n'.repeat(500)}{{VERSION}}\n`),
            'koobiq-angular'
        ).map(({ message }) => message);

        expect(messages).toEqual([
            'name must be "koobiq-angular", the name of its folder',
            'description is 1025 characters, the limit is 1024',
            expect.stringMatching(/^is \d+ lines long, the limit is 500$/),
            'still has an unfilled {{placeholder}}'
        ]);
    });
});

describe(checkLinks.name, () => {
    it('should report relative links that leave the skill and ignore URLs and anchors', () => {
        const text =
            '[forms](references/forms.md) [missing](references/missing.md) [site](https://koobiq.io) [top](#rules)';

        expect(checkLinks('SKILL.md', text, (target) => target === 'references/forms.md')).toEqual([
            { file: 'SKILL.md', message: 'links to references/missing.md, which is not part of the skill' }
        ]);
    });
});

describe('content helpers', () => {
    it('should list each defined token once', () => {
        expect(
            parseTokenNames(
                '.kbq-badge {\n    --kbq-badge-height: 1px;\n    --kbq-badge-height: 2px;\n    color: var(--kbq-x);\n}'
            )
        ).toEqual([
            '--kbq-badge-height'
        ]);
    });

    it('should cut a description down to its first sentence and quote tags', () => {
        expect(firstSentence('<kbq-code-block> shows code. It highlights syntax.')).toBe(
            '`<kbq-code-block>` shows code.'
        );
    });

    it('should order migrations from the newest version and say which can run on their own', () => {
        const markdown = renderMigrations(
            [
                { name: 'old-one', version: '20.2.0-0', description: 'Old.', runnable: false },
                { name: 'new-one', version: '21.0.0-0', description: 'New.', runnable: true }
            ],
            '21.0.0'
        );

        expect(markdown.indexOf('## 21.0.0')).toBeLessThan(markdown.indexOf('## 20.2.0'));
        expect(markdown).toContain('Run on its own: `ng generate @koobiq/components:new-one`');
        expect(markdown).not.toContain('ng generate @koobiq/components:old-one');
    });
});
