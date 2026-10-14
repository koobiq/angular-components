import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import ts from 'typescript';

// Every concrete `KbqPopUpTrigger` has to announce itself to a tooltip on the same element through
// `kbqSiblingPopupProvider`: Angular does not inherit `providers` by a subclass with a decorator of its own, so a
// missing one only shows up as a tooltip left on screen over the open pop-up.

interface ClassInfo {
    parent: string;
    providers: string;
}

const libraryRoot = __dirname;

const librarySources = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const path = join(dir, entry.name);

        if (entry.isDirectory()) return librarySources(path);

        return entry.name.endsWith('.ts') && !entry.name.endsWith('.spec.ts') && entry.name !== 'e2e.ts' ? [path] : [];
    });

const classes = new Map<string, ClassInfo>();

for (const file of librarySources(libraryRoot)) {
    const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);

    source.forEachChild((node) => {
        const parent = ts.isClassDeclaration(node)
            ? node.heritageClauses?.find(({ token }) => token === ts.SyntaxKind.ExtendsKeyword)?.types[0].expression
            : undefined;

        if (!ts.isClassDeclaration(node) || !node.name || !parent || !ts.isIdentifier(parent)) return;

        const metadata = ts
            .getDecorators(node)
            ?.map(({ expression }) => expression)
            .filter(ts.isCallExpression)
            .find(
                ({ expression }) => ts.isIdentifier(expression) && ['Component', 'Directive'].includes(expression.text)
            )
            ?.arguments.find(ts.isObjectLiteralExpression);
        const providers = metadata?.properties.find(
            (member) =>
                ts.isPropertyAssignment(member) && ts.isIdentifier(member.name) && member.name.text === 'providers'
        );

        classes.set(node.name.text, {
            parent: parent.text,
            providers: providers?.getText(source) ?? ''
        });
    });
}

const extendsFrom = (name: string, ancestor: string): boolean => {
    for (let current = classes.get(name); current; current = classes.get(current.parent)) {
        if (current.parent === ancestor) return true;
    }

    return false;
};

// Tooltips are what these pop-ups mute, so they do not announce themselves.
const popupTriggers = [...classes.keys()].filter(
    (name) =>
        extendsFrom(name, 'KbqPopUpTrigger') && name !== 'KbqTooltipTrigger' && !extendsFrom(name, 'KbqTooltipTrigger')
);

describe('KbqPopUpTrigger subclasses', () => {
    it('are found by the scan', () => {
        expect(popupTriggers).toEqual(expect.arrayContaining(['KbqPopoverTrigger', 'KbqAppSwitcherTrigger']));
    });

    it.each(popupTriggers)('%s announces itself to a tooltip on the same element', (name) => {
        expect(classes.get(name)!.providers).toContain(`kbqSiblingPopupProvider(${name})`);
    });
});
