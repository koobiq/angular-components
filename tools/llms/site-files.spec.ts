import { addFile, MAX_FILE_LENGTH, SectionParent, splitSections } from './site-files';

const GUIDE: SectionParent = {
    path: 'en/main/migration',
    link: '[Upgrade guide](https://koobiq.io/en/main/migration.md)'
};

const filler = (length: number): string => 'word '.repeat(length / 5).trim();

describe(splitSections.name, () => {
    it('leaves a text that fits in one file as it is', () => {
        const files = new Map<string, string>();

        expect(splitSections('# Upgrade guide\n\n## One\n\nShort.', GUIDE, files)).toBe(
            '# Upgrade guide\n\n## One\n\nShort.'
        );
        expect(files.size).toBe(0);
    });

    it('moves the sections of a long text to files of their own, at the first level with more than one heading', () => {
        const files = new Map<string, string>();
        const text = [
            '# Upgrade guide',
            '## How to upgrade',
            'Step by step.',
            '### Step one',
            filler(MAX_FILE_LENGTH),
            '### Step two',
            '#### Detail',
            'Done.'
        ].join('\n\n');

        expect(splitSections(text, GUIDE, files)).toBe(
            [
                '# Upgrade guide',
                '## How to upgrade',
                'Step by step.',
                [
                    '- [Step one](https://koobiq.io/en/main/migration/step-one.md)',
                    '- [Step two](https://koobiq.io/en/main/migration/step-two.md)'
                ].join('\n')
            ].join('\n\n')
        );
        expect(files.get('en/main/migration/step-two.md')).toBe(
            [
                '# Step two',
                'A section of [Upgrade guide](https://koobiq.io/en/main/migration.md).',
                '## Detail\n\nDone.'
            ].join('\n\n')
        );
    });

    it('fails on two sections that would share a file', () => {
        const text = ['# Upgrade guide', '## Step', filler(MAX_FILE_LENGTH), '## Step', 'Again.'].join('\n\n');

        expect(() => splitSections(text, GUIDE, new Map())).toThrow('the section "Step" has no path of its own');
    });

    it('splits a section that is still too long the same way, each part naming the sections above it', () => {
        const files = new Map<string, string>();
        const text = [
            '# Upgrade guide',
            '## Review',
            '### Alert',
            filler(MAX_FILE_LENGTH * 0.7),
            '### Badge',
            filler(MAX_FILE_LENGTH * 0.7),
            '## After',
            'Build.'
        ].join('\n\n');

        splitSections(text, GUIDE, files);

        expect([...files.keys()]).toEqual([
            'en/main/migration/review/alert.md',
            'en/main/migration/review/badge.md',
            'en/main/migration/review.md',
            'en/main/migration/after.md'
        ]);
        expect(files.get('en/main/migration/review/alert.md')).toContain(
            'A section of [Review](https://koobiq.io/en/main/migration/review.md) in [Upgrade guide](https://koobiq.io/en/main/migration.md).'
        );
    });
});

describe(addFile.name, () => {
    it('fails on a path another file already has', () => {
        const files = new Map([['tokens/select.md', '# Select tokens']]);

        expect(() => addFile(files, 'tokens/select.md', '# Other')).toThrow('tokens/select.md is written twice');
    });
});
