import { join } from 'node:path';
import { readComponentsApi } from '../src/sources/components';

/**
 * The reader pinned against the four published layouts it has to support, offline.
 *
 * Fixtures are real `.d.ts` excerpts lifted from the published tarballs of 18.39.5, 19.8.7 and
 * 20.4.1, and from this repository's own build for 21 (not on npm yet) — not hand-written ones,
 * which would only prove the parser agrees with an idea of the layout, not the layout itself. Each
 * keeps just enough of `package.json`'s `exports` and of `KbqButton` and `core`'s `KbqColorDirective`
 * to exercise `readComponentsApi` end to end: the `exports`-first lookup, the barrel-following
 * 18.x/19.x need and the flat 20.x/21.x files resolve to, and the inheritance that makes `color`
 * answer at all.
 *
 * `21 (local build)` in the table in `.claude/ds-5062-mcp-plan.md` names the bug this guards: the
 * generic argument substitution from `fix(mcp): substitute a base class's type argument into an
 * inherited member`.
 */

const FIXTURES = join(import.meta.dirname, 'fixtures', 'packages');

const packageAt = (major: number) => ({
    name: '@koobiq/components',
    version: `${major}.0.0`,
    root: join(FIXTURES, String(major)),
    major
});

const EPOCHS = [
    { major: 18, entryPoints: ['button', 'core'], color: 'KbqComponentColors | ThemePalette | string' },
    { major: 19, entryPoints: ['button', 'core'], color: 'KbqComponentColors | ThemePalette | string' },
    { major: 20, entryPoints: ['button', 'core'], color: 'KbqComponentColors | ThemePalette | string' },
    // The only epoch with a generic base class and a nested entry point — both introduced at 21.
    { major: 21, entryPoints: ['button', 'core', 'scrollbar/deprecated'], color: 'KbqButtonColor | null | undefined' }
] as const;

for (const { major, entryPoints, color } of EPOCHS) {
    describe(`koobiq ${major}`, () => {
        const api = readComponentsApi(packageAt(major));

        test('the package is read', () => {
            expect(api, `fixture for ${major} did not resolve`).toBeTruthy();
        });

        test('entry points match the published layout', () => {
            expect(api!.entryPoints).toEqual([...entryPoints]);
        });

        test('KbqButton gives a selector', () => {
            expect(api!.find('KbqButton')?.selector).toBe('[kbq-button]');
        });

        test('color is a concrete type, and marked as inherited from core', () => {
            const button = api!.find('KbqButton');
            const colorInput = button?.inputs.find((input) => input.alias === 'color');

            expect(colorInput?.from, 'color must be read as inherited, not declared on KbqButton itself').toBe('core');
            expect(colorInput?.type).toBe(color);
        });

        if (major === 21) {
            test('the nested entry point is named scrollbar/deprecated', () => {
                const scrollbar = api!.read('scrollbar/deprecated');

                expect(scrollbar?.some((symbol) => symbol.name === 'KbqScrollbar' && symbol.selector)).toBeTruthy();
            });
        }
    });
}
