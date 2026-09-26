import { exportedNames, parseApiReport, renderApiReport, selectorNames } from './api-report';

// Shaped like an API Extractor report, CRLF line endings included.
const REPORT = [
    '## API Report File for "koobiq"',
    '',
    '```ts',
    '',
    "import * as i0 from '@angular/core';",
    '',
    '// @public',
    'export class KbqBadge {',
    '    readonly compact: i0.InputSignalWithTransform<boolean, unknown>;',
    '    readonly badgeColor: i0.InputSignal<string>;',
    '    readonly closed: i0.OutputEmitterRef<void>;',
    '    // @deprecated (undocumented)',
    '    legacy: boolean;',
    '    // (undocumented)',
    '    static ɵcmp: i0.ɵɵComponentDeclaration<KbqBadge, "kbq-badge, [kbqBadge]", ["kbqBadge"], { "compact": { "alias": "compact"; "required": false; "isSignal": true; }; "badgeColor": { "alias": "color"; "required": true; "isSignal": true; }; "legacy": { "alias": "legacy"; "required": false; }; }, { "closed": "closed"; }, never, ["*"], true, never>;',
    '}',
    '',
    '// @public',
    'export enum KbqBadgeColors {',
    '    // (undocumented)',
    '    Error = "error",',
    '    // (undocumented)',
    '    Theme = "theme"',
    '}',
    '',
    '// @public @deprecated',
    'export function kbqBadgeProvider(color?: string): i0.Provider;',
    '',
    '// @public',
    'export const KBQ_BADGE_OPTIONS: i0.InjectionToken<unknown>;',
    '',
    '```',
    ''
].join('\r\n');

describe(parseApiReport.name, () => {
    const api = parseApiReport(REPORT);

    it('should read selectors, exportAs and the bound names and types of inputs and outputs', () => {
        expect(api.directives).toEqual([
            {
                className: 'KbqBadge',
                kind: 'component',
                selector: 'kbq-badge, [kbqBadge]',
                exportAs: ['kbqBadge'],
                inputs: [
                    { name: 'compact', type: 'boolean', required: false, deprecated: false },
                    { name: 'color', type: 'string', required: true, deprecated: false },
                    { name: 'legacy', type: 'boolean', required: false, deprecated: true }
                ],
                outputs: [{ name: 'closed', type: 'void', required: false, deprecated: false }],
                deprecated: false
            }
        ]);
    });

    it('should read enums, functions and constants with their deprecation', () => {
        expect(api.enums).toEqual([
            { name: 'KbqBadgeColors', values: ['Error = "error"', 'Theme = "theme"'], deprecated: false }
        ]);
        expect(api.functions).toEqual([
            {
                name: 'kbqBadgeProvider',
                signature: 'function kbqBadgeProvider(color?: string): Provider',
                deprecated: true
            }
        ]);
        expect(api.constants).toEqual([
            { name: 'KBQ_BADGE_OPTIONS', signature: 'KBQ_BADGE_OPTIONS: InjectionToken<unknown>', deprecated: false }
        ]);
    });

    it('should list what the hand-written text may mention', () => {
        expect(exportedNames(api)).toEqual(['KbqBadge', 'kbqBadgeProvider', 'KBQ_BADGE_OPTIONS', 'KbqBadgeColors']);
        expect(selectorNames(api)).toEqual({ elements: ['kbq-badge'], attributes: ['kbqBadge'] });
    });

    it('should render a summary with the deprecated parts marked', () => {
        const markdown = renderApiReport(api, 'badge');

        expect(markdown).toContain('Component, selector `kbq-badge, [kbqBadge]`, exportAs `kbqBadge`.');
        expect(markdown).toContain('- `color: string` (required)');
        expect(markdown).toContain('- `legacy: boolean` **(deprecated)**');
        expect(markdown).toContain('- `function kbqBadgeProvider(color?: string): Provider` **(deprecated)**');
        expect(markdown).toContain('`node_modules/@koobiq/components/badge/index.d.ts`');
    });
});
