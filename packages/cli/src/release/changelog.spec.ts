import { COMMIT_HEADER_PATTERN, COMMIT_PARSER_OPTIONS } from './changelog';

/** Splits a header into the fields `headerCorrespondence` maps the pattern's groups to. */
function parseHeader(header: string) {
    const match = COMMIT_HEADER_PATTERN.exec(header);

    if (!match) {
        return null;
    }

    const [, type, pkg, scope, subject] = match;

    return { type, package: pkg, scope, subject };
}

describe('COMMIT_HEADER_PATTERN', () => {
    it('parses a header with a scope', () => {
        expect(parseHeader('fix(tree): roll the state up once (#DS-5779) (#2221)')).toEqual({
            type: 'fix',
            package: undefined,
            scope: 'tree',
            subject: 'roll the state up once (#DS-5779) (#2221)'
        });
    });

    it('parses a breaking change marked with `!` after the scope', () => {
        expect(parseHeader('feat(link)!: add the KbqLink component (#DS-3546) (#2202)')).toEqual({
            type: 'feat',
            package: undefined,
            scope: 'link',
            subject: 'add the KbqLink component (#DS-3546) (#2202)'
        });
    });

    it('parses a breaking change marked with `!` without a scope', () => {
        expect(parseHeader('feat!: angular 21 (#DS-5708) (#2136)')).toEqual({
            type: 'feat',
            package: undefined,
            scope: undefined,
            subject: 'angular 21 (#DS-5708) (#2136)'
        });
    });

    it('keeps a list of scopes whole in a breaking change', () => {
        expect(parseHeader('fix(select, tree-select)!: cleaner keeps disabled options selected')?.scope).toBe(
            'select, tree-select'
        );
    });

    it('splits the package off the scope', () => {
        expect(parseHeader('feat(components/button)!: add icon')).toEqual({
            type: 'feat',
            package: 'components',
            scope: 'button',
            subject: 'add icon'
        });
    });

    it('rejects a header without a type', () => {
        expect(parseHeader("Merge branch 'main' into fix/x")).toBeNull();
    });
});

describe('COMMIT_PARSER_OPTIONS', () => {
    async function parseNotes(message: string) {
        const { CommitParser } = await import('conventional-commits-parser');

        return new CommitParser(COMMIT_PARSER_OPTIONS).parse(message).notes;
    }

    it('parses a deprecation footer into a note', async () => {
        expect(await parseNotes('feat(select): add the panel width input\n\nDEPRECATED: use panelWidth')).toEqual([
            { title: 'DEPRECATED', text: 'use panelWidth' }
        ]);
    });

    it('parses a breaking change footer into a note', async () => {
        expect(await parseNotes('feat(select): remove the input\n\nBREAKING CHANGE: use panelWidth')).toEqual([
            { title: 'BREAKING CHANGE', text: 'use panelWidth' }
        ]);
    });
});
