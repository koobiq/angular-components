import { parseApiReport, parseMemberLine, splitTopLevel } from '../src/indexer/parse-api-md';

const report = [
    '## API Report File for "koobiq"',
    '',
    '```ts',
    '',
    "import * as _angular_core from '@angular/core';",
    '',
    '// @public',
    'export class KbqAlert {',
    '    constructor();',
    '    readonly alertColor: _angular_core.InputSignal<"error" | "warning">;',
    '    protected readonly alertColorClass: _angular_core.Signal<string>;',
    '    readonly closed: _angular_core.OutputEmitterRef<void>;',
    '    close(): void;',
    '    // (undocumented)',
    '    static ɵcmp: _angular_core.ɵɵComponentDeclaration<KbqAlert, "kbq-alert", ["kbqAlert"], { "alertColor": { "alias": "alertColor"; "required": false; }; }, { "closed": "closed"; }, ["icon"], ["*"], true, never>;',
    '    // (undocumented)',
    '    static ɵfac: _angular_core.ɵɵFactoryDeclaration<KbqAlert, never>;',
    '}',
    '',
    '// @public',
    'export enum KbqAlertColors {',
    '    // (undocumented)',
    '    Error = "error",',
    '    // (undocumented)',
    '    Info = "info"',
    '}',
    '',
    '// @public',
    'export const KBQ_ALERT_TOKEN: _angular_core.InjectionToken<string>;',
    '',
    '```',
    ''
].join('\r\n');

test('reads the CRLF reports the repository commits', () => {
    expect(parseApiReport(report).length).toBe(3);
});

test('lifts selector, exportAs and input/output aliases out of the Angular declaration', () => {
    const alert = parseApiReport(report).find((symbol) => symbol.name === 'KbqAlert');

    expect(alert?.kind).toBe('component');
    expect(alert?.selector).toBe('kbq-alert');
    expect(alert?.exportAs).toEqual(['kbqAlert']);
});

test('classifies members and drops what a consumer cannot reach', () => {
    const alert = parseApiReport(report).find((symbol) => symbol.name === 'KbqAlert');
    const byName = new Map(alert!.members.map((member) => [member.name, member.kind]));

    expect(byName.get('alertColor')).toBe('input');
    expect(byName.get('closed')).toBe('output');
    expect(byName.get('close')).toBe('method');
    expect(byName.has('alertColorClass'), 'protected members are template-only').toBe(false);
    expect(byName.has('constructor')).toBe(false);
    expect(byName.has('ɵcmp')).toBe(false);
    expect(byName.has('ɵfac')).toBe(false);
});

test('strips the namespace prefix from signatures', () => {
    const alert = parseApiReport(report).find((symbol) => symbol.name === 'KbqAlert');
    const member = alert!.members.find((it) => it.name === 'alertColor');

    expect(member?.signature).toBe('alertColor: InputSignal<"error" | "warning">');
});

test('reads enums and single-line declarations', () => {
    const symbols = parseApiReport(report);
    const colors = symbols.find((symbol) => symbol.name === 'KbqAlertColors');

    expect(colors?.kind).toBe('enum');
    expect(colors?.members.map((member) => member.name)).toEqual(['Error', 'Info']);
    expect(symbols.find((symbol) => symbol.name === 'KBQ_ALERT_TOKEN')?.kind).toBe('const');
});

test('splitTopLevel ignores separators nested in brackets and strings', () => {
    expect(splitTopLevel('A, "b,c", { "d": 1; }, [1, 2]')).toEqual(['A', '"b,c"', '{ "d": 1; }', '[1, 2]']);
});

test('parseMemberLine sees through any number of modifiers', () => {
    expect(parseMemberLine('    static readonly x: number;')).toEqual({
        name: 'x',
        modifiers: ['static', 'readonly']
    });
    expect(parseMemberLine('    get value(): string;')).toEqual({ name: 'value', modifiers: ['get'] });
    expect(parseMemberLine('    // (undocumented)')).toBe(null);
    expect(parseMemberLine('  twoSpaces: number;'), 'members are indented four spaces').toBe(null);
});
