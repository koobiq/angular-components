import { findFrontmatterProblems, findSkillProblems, parseFrontmatter } from './skill-problems';

const SKILL_MD = [
    '---',
    'name: koobiq-angular',
    'description: Builds UI with Koobiq.',
    'license: MIT',
    'metadata:',
    "    koobiq-version: '21.0.0'",
    '---',
    '',
    '# Koobiq',
    '',
    'Open [the card](references/components/select.md).'
].join('\n');

describe(parseFrontmatter.name, () => {
    it('reads the fields, metadata as a map of its own, and the text after them', () => {
        const frontmatter = parseFrontmatter(SKILL_MD)!;

        expect(frontmatter.fields).toEqual(
            new Map<string, unknown>([
                ['name', 'koobiq-angular'],
                ['description', 'Builds UI with Koobiq.'],
                ['license', 'MIT'],
                ['metadata', new Map([['koobiq-version', '21.0.0']])]
            ])
        );
        expect(frontmatter.body.trim().startsWith('# Koobiq')).toBe(true);
    });

    it('returns null without a frontmatter', () => {
        expect(parseFrontmatter('# Koobiq')).toBeNull();
    });

    it('reports what YAML would read otherwise instead of guessing: a block scalar, `: ` in a plain value, a key twice', () => {
        const frontmatter = parseFrontmatter(
            [
                '---',
                'name: koobiq',
                'description: >',
                '    Builds UI.',
                'license: Use when: always',
                'license: MIT',
                '---',
                ''
            ].join('\n')
        )!;

        expect(frontmatter.problems).toEqual([
            '"description" is not a string YAML reads as written: quote it, on one line',
            'a line this check cannot read: Builds UI.',
            '"license" is not a string YAML reads as written: quote it, on one line',
            '"license" is set twice'
        ]);
    });

    it('reports a tab, a map inside a map and a quote YAML would not read', () => {
        const frontmatter = parseFrontmatter(
            [
                '---',
                "description: 'it's'",
                'metadata:',
                '    origin:',
                '        repo: koobiq',
                '\tauthor: koobiq',
                "    note: 'it''s fine'",
                '---',
                ''
            ].join('\n')
        )!;

        expect(frontmatter.problems).toEqual([
            '"description" is not a string YAML reads as written: quote it, on one line',
            'a map inside a map, which holds strings only: origin:',
            'a map inside a map, which holds strings only: repo: koobiq',
            'a line this check cannot read: author: koobiq'
        ]);
        expect(frontmatter.fields.get('metadata')).toEqual(new Map([['note', "it's fine"]]));
    });
});

describe(findFrontmatterProblems.name, () => {
    it('reports a field the specification does not define and a name that is not the directory', () => {
        expect(
            findFrontmatterProblems(
                'koobiq-angular',
                parseFrontmatter(SKILL_MD.replace('name: koobiq-angular', 'name: koobiq\nwhen_to_use: always'))
            )
        ).toEqual([
            'SKILL.md: a field the specification does not define, "when_to_use"',
            'SKILL.md: "name" is "koobiq", its directory "koobiq-angular"'
        ]);
    });

    it('reports a description over the 1,024 characters of the specification', () => {
        expect(
            findFrontmatterProblems(
                'koobiq-angular',
                parseFrontmatter(SKILL_MD.replace('Builds UI with Koobiq.', 'a'.repeat(1025)))
            )
        ).toEqual(['SKILL.md: "description" has 1025 characters, not 1 to 1024']);
    });
});

describe(findSkillProblems.name, () => {
    const card = '# Select\n\nSee [radio](radio.md), [the skill](../../SKILL.md) and [tree](tree.md).';

    it('passes a skill whose links lead to its own files', () => {
        const files = new Map([
            ['SKILL.md', SKILL_MD],
            ['references/components/select.md', card.replace(' and [tree](tree.md)', '')],
            ['references/components/radio.md', '# Radio']
        ]);

        expect(findSkillProblems({ name: 'koobiq-angular', files }, new Set())).toEqual([]);
    });

    it('reports a path of the site the skill names in code that the site does not serve', () => {
        const files = new Map([
            ['SKILL.md', `${SKILL_MD}\n\nRead \`<site>/api/<entry-point>.md\` and \`<site>/guide.md\`.`],
            ['references/components/select.md', '# Select']
        ]);

        expect(findSkillProblems({ name: 'koobiq-angular', files }, new Set(['api/select.md']))).toEqual([
            'koobiq-angular: SKILL.md: a path the site does not serve: <site>/guide.md'
        ]);
    });

    it('reports a link to a file the skill does not have, a link out of it and a file too long to read', () => {
        const files = new Map([
            ['SKILL.md', SKILL_MD.replace('references/components/select.md', '../README.md')],
            ['references/components/select.md', card],
            ['references/components/radio.md', `# Radio\n\n${'a'.repeat(100_000)}`]
        ]);

        expect(findSkillProblems({ name: 'koobiq-angular', files }, new Set())).toEqual([
            'koobiq-angular: SKILL.md: a link out of the skill: ../README.md',
            'koobiq-angular: references/components/select.md: a link to a file the skill does not have: tree.md',
            'koobiq-angular: references/components/radio.md: 100009 characters, over the 100000 an agent reads at once'
        ]);
    });
});
