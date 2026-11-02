import { compactTables, headingLevels, shiftHeadings, slugify, splitByHeading } from './markdown-text';

describe(compactTables.name, () => {
    it('drops the padding of a table and keeps the code and the pipes inside its cells', () => {
        expect(
            compactTables(
                [
                    'Intro.',
                    '',
                    '| Task          | Use                   |',
                    '| ------------- | --------------------- |',
                    '| One value     | `select` + `multiple` |',
                    '| Escaped pipe  | `a \\| b`              |'
                ].join('\n')
            )
        ).toBe(
            [
                'Intro.',
                '',
                '| Task | Use |',
                '| - | - |',
                '| One value | `select` + `multiple` |',
                '| Escaped pipe | `a \\| b` |'
            ].join('\n')
        );
    });
});

describe(splitByHeading.name, () => {
    it('splits at the headings of the level, but not at those in a block of code', () => {
        expect(
            splitByHeading(['Intro', '## One', 'a', '```md', '## Not one', '```', '## Two', 'b'].join('\n'), 2)
        ).toEqual({
            preamble: 'Intro',
            sections: [
                { title: 'One', body: 'a\n```md\n## Not one\n```' },
                { title: 'Two', body: 'b' }
            ]
        });
    });
});

describe(shiftHeadings.name, () => {
    it('moves the headings outside the blocks of code, keeping them between 1 and 6', () => {
        expect(shiftHeadings(['# Title', '### Section', '```sh', '# a comment', '```'].join('\n'), -1)).toBe(
            ['# Title', '## Section', '```sh', '# a comment', '```'].join('\n')
        );
    });
});

describe(headingLevels.name, () => {
    it('lists the levels of the headings outside the blocks of code', () => {
        expect(headingLevels(['# Title', '## One', '```sh', '# a comment', '```', '### Two'].join('\n'))).toEqual([
            1,
            2,
            3
        ]);
    });
});

describe(slugify.name, () => {
    it('makes an id of a heading', () => {
        expect(slugify('Labels, marks, identity')).toBe('labels-marks-identity');
        expect(slugify('Token update (18.6.x)')).toBe('token-update-18-6-x');
    });
});
